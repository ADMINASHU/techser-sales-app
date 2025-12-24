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

// Helper: Calculate distance between two coordinates in km (Haversine formula)
function calculateDistance(loc1, loc2) {
    if (!loc1?.lat || !loc1?.lng || !loc2?.lat || !loc2?.lng) return "";
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(loc2.lat - loc1.lat);
    const dLon = deg2rad(loc2.lng - loc1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(2); // Return as string with 2 decimals
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
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
        const range = "Entries!A:N"; // Adjusted range for more columns
        // Columns: 
        // A: Date | B: Status | C: Region | D: Branch | E: User Name 
        // F: Customer Name | G: Customer Address | H: Contact Person & Number | I: Purpose
        // J: StampIn Time | K: StampOut Time | L: StampIn Distance | M: StampOut Distance | N: ID
        
        // Prepare locations
        const customerLoc = entry.location; // { lat, lng }
        const stampInLoc = entry.stampIn?.location;
        const stampOutLoc = entry.stampOut?.location;

        const values = [
            [
                entry.entryDate ? new Date(entry.entryDate).toISOString() : new Date().toISOString(), // A: Date
                entry.status || "Not Started", // B: Status
                entry.userRegion || "", // C: Region
                entry.userBranch || "", // D: Branch
                entry.userName || "", // E: User Name
                entry.customerName || "", // F: Customer Name
                entry.customerAddress || "", // G: Customer Address
                `${entry.contactPerson || ""} ${entry.contactNumber || ""}`.trim(), // H: Contact Person & Number
                entry.purpose || "", // I: Purpose
                entry.stampIn?.time ? new Date(entry.stampIn.time).toISOString() : "", // J: StampIn Time
                entry.stampOut?.time ? new Date(entry.stampOut.time).toISOString() : "", // K: StampOut Time
                calculateDistance(customerLoc, stampInLoc), // L: StampIn Distance (km)
                calculateDistance(customerLoc, stampOutLoc), // M: StampOut Distance (km)
                entry._id.toString(), // N: ID (Keep for reference/updates)
            ],
        ];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            requestBody: { values },
        });

        // Return row number if possible to update later
        // response.data.updates.updatedRange gives range e.g. "Entries!A11:N11"
        const updatedRange = response.data.updates?.updatedRange;
        let rowId = null;
        if (updatedRange) {
            // Extract row number using regex
            const match = updatedRange.match(/!A(\d+):/);
            if (match && match[1]) {
                rowId = parseInt(match[1]);
            }
        }

        return { ...response.data, rowId };
    } catch (error) {
        console.error("Sheet Append Error", error);
        return null;
    }
}

export async function updateEntryInSheet(entry) {
    // If we don't have a row ID, we can't reliably update the specific row without scanning
    if (!entry.googleSheetRowId) {
        console.warn("Skipping sheet update: No googleSheetRowId for entry", entry._id);
        return null;
    }

    const auth = await getAuth();
    if (!auth) return null;

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) return null;

    try {
        const row = entry.googleSheetRowId;
        const range = `Entries!A${row}:N${row}`;
        
        // Prepare locations
        const customerLoc = entry.location; // { lat, lng }
        const stampInLoc = entry.stampIn?.location;
        const stampOutLoc = entry.stampOut?.location;

        const values = [
            [
                entry.entryDate ? new Date(entry.entryDate).toISOString() : new Date().toISOString(), // A: Date
                entry.status || "Not Started", // B: Status
                entry.userRegion || "", // C: Region
                entry.userBranch || "", // D: Branch
                entry.userName || "", // E: User Name
                entry.customerName || "", // F: Customer Name
                entry.customerAddress || "", // G: Customer Address
                `${entry.contactPerson || ""} ${entry.contactNumber || ""}`.trim(), // H: Contact Person & Number
                entry.purpose || "", // I: Purpose
                entry.stampIn?.time ? new Date(entry.stampIn.time).toISOString() : "", // J: StampIn Time
                entry.stampOut?.time ? new Date(entry.stampOut.time).toISOString() : "", // K: StampOut Time
                calculateDistance(customerLoc, stampInLoc), // L: StampIn Distance (km)
                calculateDistance(customerLoc, stampOutLoc), // M: StampOut Distance (km)
                entry._id.toString(), // N: ID
            ],
        ];

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            requestBody: { values },
        });

        return response.data;
    } catch (error) {
        console.error("Sheet Update Error", error);
        return null;
    }
}
