const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// Manually load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const [key, ...value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.join("=").trim().replace(/"/g, ""); // Basic parsing
    }
  });
} else {
  console.error("❌ .env.local not found!");
  process.exit(1);
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function verify() {
  console.log("🔍 Starting Google Sheets Verification...");

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Handle newlines in private key if they are escaped or not
  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (key) {
    key = key.replace(/\\n/g, "\n");
  }

  if (!email) {
    console.error("❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is missing.");
    return;
  }
  if (!key) {
    console.error("❌ GOOGLE_PRIVATE_KEY is missing.");
    return;
  }

  console.log(`📧 Service Account: ${email}`);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: key,
      },
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    console.log("✅ Auth Successful: Credentials appear valid.");

    const sheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.error("❌ GOOGLE_SHEET_ID is missing.");
      return;
    }

    console.log(`📄 Spreadsheet ID: ${spreadsheetId}`);

    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      console.log(
        `✅ Access Successful: Found Spreadsheet "${response.data.properties.title}"`
      );

      // Check for Entries tab
      const entriesSheet = response.data.sheets.find(
        (s) => s.properties.title === "Entries"
      );
      if (entriesSheet) {
        console.log("✅ Tab 'Entries' exists.");
      } else {
        console.warn(
          "⚠️ Tab 'Entries' NOT found. Please create a sheet named 'Entries'."
        );
        const sheetNames = response.data.sheets
          .map((s) => s.properties.title)
          .join(", ");
        console.log(`   Existing tabs: ${sheetNames}`);
      }
    } catch (err) {
      if (err.code === 403 || (err.message && err.message.includes("403"))) {
        console.error(
          "❌ PERMISSION DENIED: The service account does not have access to this sheet."
        );
        console.error(`👉 ACTION: Share the sheet with: ${email}`);
      } else if (err.code === 404) {
        console.error(
          "❌ NOT FOUND: The spreadsheet ID is incorrect or the sheet does not exist."
        );
      } else {
        console.error("❌ Access Failed:", err.message);
      }
    }
  } catch (error) {
    console.error("❌ Auth Failed:", error.message);
  }
}

verify();
