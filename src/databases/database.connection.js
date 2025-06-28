import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUrl =
      process.env.MONGO_URL ||
      'mongodb://localhost:27017/mydb';

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Could not connect to MongoDB", err);
    // Thoát process nếu kết nối thất bại
    process.exit(1);
  }
};

export default connectDB;
