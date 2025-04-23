import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import MongoStore from "connect-mongo";

import router from "./routes";

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

connectDB();

app.use(morgan("combined"));

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello, Lino Backend!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
