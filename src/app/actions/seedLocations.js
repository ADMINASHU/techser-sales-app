"use server";

import dbConnect from "@/lib/db";
import Location from "@/models/Location";

const initialData = [
    { region: "AP & TELANGANA", branch: "KAREEMNAGAR" },
    { region: "AP & TELANGANA", branch: "NALGONDA" },
    { region: "AP & TELANGANA", branch: "KHAMMAM" },
    { region: "AP & TELANGANA", branch: "ADILABAD" },
    { region: "AP & TELANGANA", branch: "NIZAMABAD" },
    { region: "AP & TELANGANA", branch: "MANCHIRIYAL" },
    { region: "AP & TELANGANA", branch: "MAHEBOOBNAGAR" },
    { region: "AP & TELANGANA", branch: "WARANGAL" },
    { region: "AP & TELANGANA", branch: "HYDERABAD" },
    { region: "AP & TELANGANA", branch: "VIJAYAWADA" },
    { region: "AP & TELANGANA", branch: "RAJAHMUNDRY" },
    { region: "AP & TELANGANA", branch: "VISAKHAPATNAM" },
    { region: "AP & TELANGANA", branch: "SRIKAKULAM" },
    { region: "AP & TELANGANA", branch: "ONGOLE" },
    { region: "AP & TELANGANA", branch: "GUNTUR" },
    { region: "AP & TELANGANA", branch: "NELLORE" },
    { region: "AP & TELANGANA", branch: "TIRUPATHI" },
    { region: "AP & TELANGANA", branch: "ANANTHAPUR" },
    { region: "AP & TELANGANA", branch: "KADAPA" },
    { region: "AP & TELANGANA", branch: "KURNOOL" },
    { region: "KALKA", branch: "PARWANOO" },
    { region: "KALKA", branch: "DELHI" },
    { region: "KALKA", branch: "LUCKNOW" },
    { region: "KALKA", branch: "PATNA" },
    { region: "KALKA", branch: "DEHRADUN" },
    { region: "KARNATAKA", branch: "BANGALORE" },
    { region: "KARNATAKA", branch: "MYSORE" },
    { region: "KARNATAKA", branch: "MANGALORE" },
    { region: "KARNATAKA", branch: "KUMTA" },
    { region: "KARNATAKA", branch: "SIRSI" },
    { region: "KARNATAKA", branch: "HUBLI" },
    { region: "KARNATAKA", branch: "BELGAUM" },
    { region: "KARNATAKA", branch: "VIJAYAPURA" },
    { region: "KARNATAKA", branch: "KALABURGI" },
    { region: "KARNATAKA", branch: "RAICHUR" },
    { region: "KARNATAKA", branch: "GADAG" },
    { region: "KARNATAKA", branch: "HOSPET" },
    { region: "KARNATAKA", branch: "BELLARY" },
    { region: "KARNATAKA", branch: "SHIVMOGA" },
    { region: "KARNATAKA", branch: "DAVANAGERE" },
    { region: "KARNATAKA", branch: "CHITRADURGA" },
    { region: "KARNATAKA", branch: "CHICKMAGALORE" },
    { region: "KARNATAKA", branch: "HASSAN" },
    { region: "KARNATAKA", branch: "TUMKUR" },
    { region: "MUMBAI", branch: "MUMBAI" },
    { region: "MUMBAI", branch: "AHMEDABAD" },
    { region: "AP & TELANGANA", branch: "NIRMAL" },
    { region: "GOA", branch: "GOA" },
    { region: "RAJASTHAN", branch: "JAIPUR" },
    { region: "RAJASTHAN", branch: "UDAIPUR" },
    { region: "RAJASTHAN", branch: "ALWAR" },
    { region: "RAJASTHAN", branch: "KOTA" },
    { region: "RAJASTHAN", branch: "JODHPUR" },
    { region: "RAJASTHAN", branch: "BIKANER" },
    { region: "TAMIL NADU", branch: "CHENNAI" },
    { region: "WEST BENGAL", branch: "Odisha" },
    { region: "WEST BENGAL", branch: "KOLKATA" },
    { region: "KERALA", branch: "COCHIN" },
    { region: "TAMIL NADU", branch: "PONDICHERRY" },
    { region: "CHATTISGARH", branch: "RAIPUR" },
    { region: "MADHYA PRADESH", branch: "BHOPAL" },
    { region: "KALKA", branch: "LUDHIANA" },
    { region: "TAMIL NADU", branch: "TIRUNELVELI" },
    { region: "TAMIL NADU", branch: "MADURAI" },
    { region: "TAMIL NADU", branch: "COIMBATORE" },
    { region: "TAMIL NADU", branch: "TRICHY" },
    { region: "TAMIL NADU", branch: "SALEM" },
    { region: "TAMIL NADU", branch: "VELLORE" },
    { region: "MADHYA PRADESH", branch: "JABALPUR" },
    { region: "MADHYA PRADESH", branch: "INDORE" },
    { region: "MADHYA PRADESH", branch: "GWALIOR" },
];

export async function seedLocations() {
    try {
        await dbConnect();

        // Group by Region
        const grouped = {};
        for (const item of initialData) {
            if (!item.branch || item.branch === "delete" || item.branch === "test") continue; // filtered users 'delete' and 'test' just in case
            if (!grouped[item.region]) {
                grouped[item.region] = new Set();
            }
            if (item.branch) grouped[item.region].add(item.branch);
        }

        for (const [regionName, branchesSet] of Object.entries(grouped)) {
            if (!regionName) continue;
            
            const branches = Array.from(branchesSet);
            
            await Location.findOneAndUpdate(
                { name: regionName },
                { 
                    $setOnInsert: { name: regionName },
                    $addToSet: { branches: { $each: branches } } 
                },
                { upsert: true, new: true }
            );
        }
        
        return { success: true, message: "Locations seeded successfully" };
    } catch (error) {
        return { error: error.message };
    }
}
