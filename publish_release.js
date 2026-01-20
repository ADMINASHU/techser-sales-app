import { get, post } from "axios";
import { createInterface } from "readline";

// --- CONFIGURATION ---
const API_URL = "http://localhost:3000/api/mobile/release/latest";
const RELEASE_SECRET = process.env.RELEASE_SECRET || "techser-dev-secret";

// OPTIONAL: Set this to your constant Google Drive Link (if you use "Manage Versions" in Drive)
// If empty, the script will ask for the URL every time.
const FIXED_DOWNLOAD_URL =
  "https://drive.google.com/uc?id=1IZ-oAqAncqOEgwyT-W99qI1xWK9UBlBT&export=download";
// ^ Tip: Use a direct download link format if possible, or the standard view link.


const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Semantic Version Increment Helper
const incrementVersion = (ver) => {
  if (!ver) return "1.0.0";
  const parts = ver.split(".").map(Number);
  if (parts.length !== 3) return ver; // Fallback if non-standard
  parts[2] += 1; // Increment Patch
  return parts.join(".");
};

async function main() {
  console.log("--- 🚀 Auto-Publish Mobile Release ---");

  try {
    // 1. Get Current Version
    let currentVersion = "1.0.0";
    try {
      const check = await get(API_URL);
      if (check.data.success && check.data.release) {
        currentVersion = check.data.release.version;
        console.log(`\n📢 Current Latest Version: v${currentVersion}`);
      } else {
        console.log(
          `\n📢 No active releases found. Starting from v${currentVersion}`,
        );
      }
    } catch (e) {
      console.log(
        "\n⚠️  Could not fetch latest version (Server down?). assuming v1.0.0",
      );
    }

    // 2. Calculate Next Version
    const nextVersion = incrementVersion(currentVersion);
    console.log(`🔹 Next Version: v${nextVersion}`);

    // 3. Determine URL
    let url = FIXED_DOWNLOAD_URL;
    if (url.includes("YOUR_FILE_ID_HERE")) {
      // If user hasn't configured it, ask.
      console.log(
        "\n(Tip: Edit 'publish_release.js' to set FIXED_DOWNLOAD_URL and skip this step)",
      );
      url = await question(`Download URL (Enter for previous/empty): `);
    } else {
      console.log(`🔹 Using Fixed URL: ${url}`);
    }

    if (!url) throw new Error("Download URL is required!");

    // 4. Notes (Optional)
    const notesRaw = await question(
      "\n📝 Release Notes (comma separated) [Enter for 'Bug Fixes & Improvements']: ",
    );
    const releaseNotes = notesRaw
      ? notesRaw.split(",").map((s) => s.trim())
      : [
        "Enabled New User Login & Registration",
        "Added Profile Setup & Verification Flow",
        "Fixed Account Active Status Issues",
        "Improved Auth Stability",
      ];

    // 5. Final Confirmation
    console.log(`\n---------------------------------------`);
    console.log(`   Version: v${nextVersion}`);
    console.log(`   URL:     ${url}`);
    console.log(`   Notes:   ${releaseNotes.join(", ")}`);
    console.log(`---------------------------------------`);

    const confirm = await question(`\n✅ Publish this release? (Y/n): `);
    if (confirm.toLowerCase() === "n") {
      console.log("Cancelled.");
      process.exit(0);
    }

    console.log("\nPublishing...");

    // POST Request
    const response = await post(
      API_URL,
      {
        version: nextVersion,
        downloadUrl: url,
        releaseNotes,
        forceUpdate: false,
      },
      {
        headers: {
          "x-release-secret": RELEASE_SECRET,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.success) {
      console.log(`\n🎉 SUCCESS! v${nextVersion} is live.`);
    } else {
      console.error("\n❌ FAILED:", response.data);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

main();
