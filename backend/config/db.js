import mongoose from "mongoose";

const connectDB = async () => {
  const uri = "mongodb://shamini01711_db_user:shamnyynelson01711@ac-hvwc30n-shard-00-00.3zddmqq.mongodb.net:27017,ac-hvwc30n-shard-00-01.3zddmqq.mongodb.net:27017,ac-hvwc30n-shard-00-02.3zddmqq.mongodb.net:27017/securevault?ssl=true&replicaSet=atlas-ypl51v-shard-0&authSource=admin&retryWrites=true&w=majority";

  console.log("Trying direct connection to Atlas...");
  const conn = await mongoose.connect(uri);
  console.log(`✅ MongoDB Connected Successfully to ${conn.connection.host}`);
};

export default connectDB;