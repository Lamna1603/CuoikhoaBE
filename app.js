// app.js
import dotenv from 'dotenv';
import express from 'express';

import connectDB from './src/databases/database.connection.js';
import userRoutes from './src/routers/userRouters.js';
import taskRoutes from './src/routers/taskRoutes.js';
import subBoardRoutes from './src/routers/subBoardRoutes.js';
dotenv.config();



const app = express();
app.use(express.json());
// Middleware để log mọi request đến
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body); // Lưu ý: req.body có thể rỗng ở đây nếu express.json() chưa parse
  next();
});

const PORT = process.env.PORT || 5000;


// Middleware để parse JSON body


// Kết nối MongoDB

connectDB()
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));       
  
// Route kiểm tra cơ bản
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

// Sử dụng các route cho người dùng
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subBoards', subBoardRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID provided: ${err.value}`;
  }

  if (err.code === 11000) { // MongoDB duplicate key error code
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value: ${field} already exists.`;
  }

  // Handle specific errors for clarity
  if (message.includes('not authorized')) {
    statusCode = 403; // Forbidden
  } else if (message.includes('not found')) {
    statusCode = 404; // Not Found
  } else if (message.includes('Invalid') || message.includes('required') || message.includes('exists')) {
    statusCode = 400; // Bad Request
  }


  res.status(statusCode).json({
    success: false,
    message: message,
    data: {}
  });
}
);
// Lắng nghe cổng
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});