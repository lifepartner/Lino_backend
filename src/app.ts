import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";
import sharp from "sharp";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import MongoStore from "connect-mongo";

import router from "./routes";
import adminRouter from './routes/admin.router';

import connectDB from "./db";

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(cookieParser(process.env.COOKIE_SECRET || "lino_cookie_secret"));

app.use(
  session({
    // store: MongoStore.create({
    //   mongoUrl: process.env.MONGODB_URI,
    // }),
    secret: process.env.SESSION_SECRET || "lino_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: false,
      sameSite: "none",
    },
  })
);

app.use(bodyParser.json({ limit: "15360mb", type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

connectDB(); // Enable MongoDB connection

app.use(morgan("combined"));

app.use("/api", router);
app.use('/api', adminRouter);

app.get("/", (req, res) => {
  res.send("Hello, Lino Backend!");
});

app.use('/uploads', express.static('uploads'));
var storagePhotos = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    // Ensure the directory exists  
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    console.log(file, "upload");
    var filetype = '';
    if (file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if (file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if (file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }
    if (file.fieldname === "avatar") {
      cb(null, 'avatar-' + uuidv4() + '.' + filetype);
    } else {
      cb(null, 'gallery-' + uuidv4() + '.' + filetype);
    }
  }
});

var uploadPhoto = multer({ storage: storagePhotos })


const cpUpload = uploadPhoto.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 5 }])

// Legacy upload endpoint - keeping for backward compatibility but should use /api/upload routes
app.post('/UploadPhoto', cpUpload,
  async (req, res) => {
    try {
      console.log("called uploadPhoto");
      console.log(req.body, "called uploadPhoto body");
      console.log((req as any).files || (req as any).file, "called uploadPhoto files");

      // This is a legacy endpoint - recommend using /api/upload/avatar/:userId instead
      res.status(200).json({ 
        message: "Legacy upload endpoint - use /api/upload routes for proper authentication",
        success: true 
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  })

app.listen(Number(port), '0.0.0.0', () => {
  console.log(uuidv4(), "df");
  console.log(`Server is running on port ${port}`);
  console.log(`Server accessible at http://localhost:${port}`);
});
