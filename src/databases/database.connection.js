import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://user:password@127.0.0.1:27019/CKh?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    // Thoát process nếu kết nối thất bại
    process.exit(1);
  }
};

export default connectDB;