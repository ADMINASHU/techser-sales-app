"use client";

import { useState } from "react";
import { updateProfile, changePassword } from "@/app/actions/userActions";
import { toast } from "sonner";

export function useUpdateProfile(user, onComplete) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checkReverification = (formData) => {
    const isRegionBranchChanged =
      formData.region !== (user.region || "") ||
      formData.branch !== (user.branch || "");

    return (
      user.role !== "admin" &&
      user.status === "verified" &&
      isRegionBranchChanged
    );
  };

  const handleUpdate = async (
    formData,
    passwordData,
    isPasswordSectionOpen,
  ) => {
    setLoading(true);
    try {
      // 1. Update Profile Details
      const profileFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        profileFormData.append(key, value),
      );

      const profileRes = await updateProfile(profileFormData);
      if (profileRes.error) throw new Error(profileRes.error);

      // 2. Change Password (if requested)
      if (isPasswordSectionOpen && passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error("New passwords do not match");
        }
        const passwordRes = await changePassword(
          passwordData.currentPassword,
          passwordData.newPassword,
        );
        if (passwordRes.error) throw new Error(passwordRes.error);
        toast.success("Password changed successfully");
      }

      const isRegionBranchChanged =
        formData.region !== (user.region || "") ||
        formData.branch !== (user.branch || "");

      if (
        user.role !== "admin" &&
        user.status === "verified" &&
        isRegionBranchChanged
      ) {
        toast.success("Profile updated. Redirecting for re-verification...");
        window.location.href = "/verification";
      } else {
        toast.success("Profile updated successfully");
        if (onComplete) onComplete();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return {
    loading,
    showConfirm,
    setShowConfirm,
    checkReverification,
    handleUpdate,
  };
}
