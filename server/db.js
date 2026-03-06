import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return NextResponse.json(
            { message: "MongoDB URI not found" },
            { status: 500 }
        )
    }

    const client = new MongoClient(uri);
    try{
        await client.connect();
        const database = client.db("cloudinary");
        const taskcollection = database.collection("uploads");
        
        const tasks = await taskcollection.find().toArray();
        return NextResponse.json({
            message: "Files fetched successfully",
            count: tasks.length,
            success: true,
            data: tasks
        })
    } catch(error){
        console.error('MongoDB connection error:', error);
        return NextResponse.json(
            { message: "Failed to fetch files and connect to MongoDB database", details: error.message },
            { status: 500 }
        )
    } finally {
        await client.close();
    }
}