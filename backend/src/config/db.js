import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbName = process.env.DB_NAME || "glacy-store";

    const connectInstance = await mongoose.connect(process.env.MONGO_URI, {
      dbName: dbName,
    });

    console.log(
      `MongoDB connected to database '${dbName}' on: ${connectInstance.connection.host}`
    );
    console.log(
      `Connection ready state: ${mongoose.connection.readyState} ${connectInstance.connection.host}`
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
