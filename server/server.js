import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import router from "./src/api/route.js";

dotenv.config();

const app = express();  // ← ONE express instance
const port = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/', router);
app.get('/', (req, res) => res.send('Server is running!'));

// ONE listen call - LAST
app.listen(port, () => {
    console.log(`✅ Server: http://localhost:${port}`);
});
