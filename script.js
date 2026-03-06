const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const app = express();
const port = 3000;

// Configure Cloudinary (use your own cloud_name, api_key, and api_secret)
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret'
});

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: 'Error uploading to Cloudinary' });
    }
    res.json({ public_id: result.public_id, url: result.secure_url });
  }).end(req.file.buffer);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
