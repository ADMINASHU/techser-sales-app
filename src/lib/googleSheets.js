import { google } from "googleapis";
import { formatInIST } from "./utils";

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
        const range = "Entries!A:M"; // Adjusted range (Removed Purpose, total 13 cols)
        // Columns: 
        // A: Date | B: Status | C: Region | D: Branch | E: User Name 
        // F: Customer Name | G: Customer Address | H: Contact Person & Number
        // I: StampIn Time | J: StampOut Time | K: StampIn Distance | L: StampOut Distance | M: ID
        
        // Prepare locations (Source from populated customerId)
        const customerLoc = entry.customerId?.location || entry.location; 
        const stampInLoc = entry.stampIn?.location;
        const stampOutLoc = entry.stampOut?.location;

        // Helper to get data from Entry or populated Customer
        const getVal = (key) => entry[key] || entry.customerId?.[key] || "";

        const values = [
            [
                entry.entryDate ? formatInIST(entry.entryDate, "dd/MM/yyyy") : formatInIST(new Date(), "dd/MM/yyyy"), // A: Date
                entry.status || "Not Started", // B: Status
                entry.userRegion || "", // C: Region
                entry.userBranch || "", // D: Branch
                entry.userName || "", // E: User Name
                getVal("customerName") || getVal("name"), // F: Customer Name
                getVal("customerAddress"), // G: Customer Address
                `${getVal("contactPerson")} ${getVal("contactNumber")}`.trim(), // H: Contact Person & Number
                // Removed Purpose
                entry.stampIn?.time ? formatInIST(entry.stampIn.time, "dd/MM/yyyy HH:mm:ss") : "", // I: StampIn Time
                entry.stampOut?.time ? formatInIST(entry.stampOut.time, "dd/MM/yyyy HH:mm:ss") : "", // J: StampOut Time
                calculateDistance(customerLoc, stampInLoc), // K: StampIn Distance (km)
                calculateDistance(customerLoc, stampOutLoc), // L: StampOut Distance (km)
                entry._id.toString(), // M: ID
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
        const range = `Entries!A${row}:M${row}`;
        
        // Prepare locations
        const customerLoc = entry.customerId?.location || entry.location; 
        const stampInLoc = entry.stampIn?.location;
        const stampOutLoc = entry.stampOut?.location;

        const getVal = (key) => entry[key] || entry.customerId?.[key] || "";

        const values = [
            [
                entry.entryDate ? formatInIST(entry.entryDate, "dd/MM/yyyy HH:mm:ss") : formatInIST(new Date(), "dd/MM/yyyy HH:mm:ss"), // A: Date
                entry.status || "Not Started", // B: Status
                entry.userRegion || "", // C: Region
                entry.userBranch || "", // D: Branch
                entry.userName || "", // E: User Name
                getVal("customerName") || getVal("name"), // F: Customer Name
                getVal("customerAddress"), // G: Customer Address
                `${getVal("contactPerson")} ${getVal("contactNumber")}`.trim(), // H: Contact Person & Number
                // Removed Purpose
                entry.stampIn?.time ? formatInIST(entry.stampIn.time, "dd/MM/yyyy HH:mm:ss") : "", // I: StampIn Time
                entry.stampOut?.time ? formatInIST(entry.stampOut.time, "dd/MM/yyyy HH:mm:ss") : "", // J: StampOut Time
                calculateDistance(customerLoc, stampInLoc), // K: StampIn Distance (km)
                calculateDistance(customerLoc, stampOutLoc), // L: StampOut Distance (km)
                entry._id.toString(), // M: ID
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

export async function clearSheet() {
    const auth = await getAuth();
    if (!auth) return null;

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) return null;

    try {
        // Clear everything starting from A2 (keep headers)
        const range = "Entries!A2:M";
        
        const response = await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range,
        });

        return response.data;
    } catch (error) {
        console.error("Sheet Clear Error", error);
        return null;
    }
}
