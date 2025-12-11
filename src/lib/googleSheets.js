import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");


    if (!email || !key) {
        console.warn("Google Sheets Credentials Missing");
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: email,
            private_key: key,
        },
        scopes: SCOPES,
    });

    return auth;
}

export async function appendEntryToSheet(entry) {
    const auth = await getAuth();
    if (!auth) return null;

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
        console.warn("GOOGLE_SHEET_ID missing");
        return null;
    }

    try {
        const range = "Entries!A:H"; // Adjust range based on columns
        // Columns: ID, User, Customer, Region, Branch, Status, StampIn, StampOut
        const values = [
            [
                entry._id.toString(),
                entry.userEmail || "", // Passed from action? Or fetch?
                entry.customerName,
                entry.region,
                entry.branch,
                entry.status,
                entry.stampIn?.time ? new Date(entry.stampIn.time).toISOString() : "",
                entry.stampOut?.time ? new Date(entry.stampOut.time).toISOString() : "",
            ],
        ];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            requestBody: { values },
        });

        // Return row number if possible to update later
        // response.data.updates.updatedRange gives range e.g. "Entries!A10:H10"
        // We can parse it.
        return response.data;
    } catch (error) {
        console.error("Sheet Append Error", error);
        return null;
    }
}

export async function updateEntryInSheet(entry) {
    // Complex without row ID. 
    // Strategy: Use Entry ID (Column A) to find row, then update.
    // Providing full sync logic might be overkill for this snippet without Keys.
    console.log("Mock Sync Update for:", entry._id);
}
