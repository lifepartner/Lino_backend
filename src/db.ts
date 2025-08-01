import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lino",
    );
    console.log(`MONGODB CONNECTED !!! ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
