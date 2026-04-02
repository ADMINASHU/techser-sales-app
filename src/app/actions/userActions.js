"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { sendNotificationToUsers } from "@/lib/fcmNotification";

import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  region: z.string().min(1, "Region is required"),
  branch: z.string().min(1, "Branch is required"),
  designation: z.string().optional(),
});

export async function updateProfile(formData) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const data = Object.fromEntries(formData);
  const parsed = ProfileSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Only include fields that are present in the parsed data
  const updateFields = {};
  if (parsed.data.name) updateFields.name = parsed.data.name;
  if (parsed.data.contactNumber)
    updateFields.contactNumber = parsed.data.contactNumber;
  if (parsed.data.address) updateFields.address = parsed.data.address;
  if (parsed.data.region) updateFields.region = parsed.data.region;
  if (parsed.data.branch) updateFields.branch = parsed.data.branch;

  // Security: No self-restriction anymore for Super User, but they will be de-verified if changed
  if (parsed.data.designation)
    updateFields.designation = parsed.data.designation;

  try {
    await dbConnect();
    const user = await User.findById(session.user.id).lean();
    if (!user) return { error: "User not found" };

    const isFirstTimeSetup =
      user.status === "pending" && (!user.contactNumber || !user.address);

    const isRegionBranchChanged =
      (updateFields.region && updateFields.region !== user.region) ||
      (updateFields.branch && updateFields.branch !== user.branch);

    const shouldReverify =
      session.user.role !== "admin" &&
      user.status === "verified" &&
      isRegionBranchChanged;

    if (shouldReverify) {
      updateFields.status = "declined";
    }

    await User.findByIdAndUpdate(session.user.id, updateFields);

    // Trigger Verification Request Notification to Admins/SuperUsers ONLY if it's the first relevant setup
    // or if they are still pending verification (including just-de-verified).
    if (user.status === "pending" || shouldReverify) {
      const targetRegion = updateFields.region || user.region;
      const notificationAction = shouldReverify
        ? "Re-verification Request"
        : "Verification Request";

      // 1. Try to find Super Users in the same region first
      let recipients = await User.find({
        role: "super_user",
        region: targetRegion,
      })
        .select("_id")
        .lean();

      let recipientIds = recipients.map((r) => r._id.toString());
      let titlePrefix = "Regional Update";

      // 2. Fallback to Regional Administrators
      if (recipientIds.length === 0) {
        recipients = await User.find({
          role: "admin",
          region: targetRegion,
        })
          .select("_id")
          .lean();
        recipientIds = recipients.map((r) => r._id.toString());
      }

      // 3. Final Fallback to all Administrators
      if (recipientIds.length === 0) {
        recipients = await User.find({ role: "admin" }).select("_id").lean();
        recipientIds = recipients.map((r) => r._id.toString());
        titlePrefix = "User Management";
      }

      if (recipientIds.length > 0) {
        await sendNotificationToUsers({
          userIds: recipientIds,
          notification: {
            title: `${titlePrefix}: ${notificationAction}`,
            body: `${session.user.name} has ${
              shouldReverify
                ? "updated region/branch"
                : "requested verification"
            }`,
          },
          data: {
            type: "verification-request",
            userId: session.user.id,
            name: session.user.name,
            email: session.user.email,
            link: "/users",
          },
        });
      }
    }

    revalidatePath("/profile");
    revalidatePath("/setup");

    return { success: true };
  } catch (error) {
    return { error: `Failed to update profile: ${error.message}` };
  }
}

export async function changePassword(currentPassword, newPassword) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  try {
    await dbConnect();
    const user = await User.findById(session.user.id).select("+password");

    if (!user) return { error: "User not found" };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Incorrect current password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(session.user.id, { password: hashedPassword });

    return { success: true };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { error: "Failed to change password" };
  }
}

export async function updateAvatar(base64Image) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  try {
    await dbConnect();

    // Update User
    await User.findByIdAndUpdate(session.user.id, { image: base64Image });

    // Revalidate to update Navbar and Profile
    revalidatePath("/profile");
    revalidatePath("/", "layout"); // Revalidate all layouts to update Navbar

    return { success: true };
  } catch (error) {
    return { error: "Failed to update avatar" };
  }
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session) return null;
  try {
    await dbConnect();
    const user = await User.findById(session.user.id).select("role status").lean();
    return {
      role: user.role,
      status: user.status,
    };
  } catch (error) {
    return null;
  }
}

export async function toggleStamping(enabled) {
  const session = await auth();
  if (!session || session.user.role !== "super_user") {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  if (!userId) return { error: "User ID not found in session" };

  try {
    await dbConnect();
    const result = await User.updateOne(
      { _id: userId },
      { $set: { enableStamping: enabled } },
    );

    if (result.matchedCount === 0) {
      return { error: "User not found in database" };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Toggle Stamping Error:", error);
    return { error: `Failed to update stamping status: ${error.message}` };
  }
}
