import userModel from "@/models/user/index.model";
import database_connection from "@/services/database";
import { NextResponse } from "next/server";

database_connection().then(() => console.log("Connected successfully"));

export async function GET(request) {
    try {
        const emails = await User.aggregate([
            { $match: {} }, // Empty filter to match all documents
            { $project: { 
                _id: 0, 
                ChannelType: "EMAIL",
                Address: "$google.email"
            }},
        ]);

        function jsonToCSV(data){
            // Assuming the array variable is named "data"
            const csvHeader = `"ChannelType","Address"\n`; // Header row

            const csvRows = data.map(item => `"${item.ChannelType}","${item.Address}"\n`); // Map each object to a CSV row

            const csvContent = csvHeader + csvRows.join(""); // Combine header and rows

            return csvContent; // Return the CSV content as a string.
        }

        const csv = jsonToCSV(emails);
        // return NextResponse.json(csv, { status: 200 });
        return NextResponse.json({emails: "emails is working"}, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching an entry:", error);

        return NextResponse.json(
            { message: "Internal Server Error" },
            {
                status: 500
            }
        );
    }
}
