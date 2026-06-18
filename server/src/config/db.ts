import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
//afedayo_db_user
//mZC3kcTTBZvivM9m
//mongodb+srv://afedayo_db_user:mZC3kcTTBZvivM9m@cluster0.o8ggmme.mongodb.net/?appName=Cluster0
