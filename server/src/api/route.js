// src/api/route.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const router = express.Router();

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://first_project:bCddQEUEXJuEWhFH@first.ywmtccu.mongodb.net/";
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    return client.db("cloudinary").collection("uploads");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fixed multer with proper error handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'video/mp4', 'video/mov', 'video/avi'
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Send proper error response
      return cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("Upload request received:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "uploads",
        resource_type: "auto"
       },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        try {
          // Save to MongoDB
          const collection = await connectDB();
          const assetData = {
            public_id: result.public_id,
            secure_url: result.secure_url,
            version: result.version,
            signature: result.signature,
            created_at: result.created_at,
            type: result.type,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            original_filename: req.file.originalname,
            mimetype: req.file.mimetype,
            uploaded_at: new Date().toISOString()
          };

          const dbResult = await collection.insertOne(assetData);
          
          res.json({
            ...assetData,
            _id: dbResult.insertedId,
            message: "Asset uploaded and saved successfully"
          });
        } catch (dbError) {
          console.error("Database save error:", dbError);
          // Still return the Cloudinary result even if DB fails
          res.json({
            public_id: result.public_id,
            secure_url: result.secure_url,
            version: result.version,
            signature: result.signature,
            created_at: result.created_at,
            type: result.type,
            warning: "Uploaded to Cloudinary but failed to save to database"
          });
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/file/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;

    // Get file details from Cloudinary
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "upload"
    });

    res.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      version: result.version,
      signature: result.signature,
      created_at: result.created_at,
      type: result.type
    });
  } catch (error) {
    res.status(404).json({ error: "File not found or access denied", details: error.message });
  }
});

router.get("/files", async (req, res) => {
  try {
    const collection = await connectDB();
    const assets = await collection.find({}).sort({ uploaded_at: -1 }).toArray();
    
    res.json({
      resources: assets,
      count: assets.length
    });
  } catch (error) {
    console.error("Error fetching assets from database:", error);
    res.status(500).json({ 
      error: "Failed to fetch assets", 
      details: error.message 
    });
  }
});

// router.delete("/file/:publicId", async (req, res) => {
//   try {
//     const { publicId } = req.params;

//     // Delete from Cloudinary
//     const result = await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
    
//     if (result.result === 'ok') {
//       // Also delete from MongoDB
//       try {
//         const collection = await connectDB();
//         await collection.deleteOne({ public_id: publicId });
//       } catch (dbError) {
//         console.error("Failed to delete from database:", dbError);
//         // Still consider it successful since Cloudinary deletion worked
//       }
      
//       res.json({ 
//         success: true,
//         message: "Asset deleted successfully from Cloudinary and database",
//         publicId: publicId
//       });
//     } else {
//       res.status(400).json({ 
//         error: "Failed to delete asset from Cloudinary",
//         details: result
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to delete asset",
//       details: error.message
//     });
//   }
// });

export default router;
