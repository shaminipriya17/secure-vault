import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
  console.log("Testing MongoDB connection...");

  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log("SUCCESS");
  console.log(conn.connection.host);

  process.exit(0);
} catch (err) {
  console.error("FAILED");
  console.error(err);

  process.exit(1);
}
