// routes/taskRoutes.js
import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addSubBoardToTask,
  getCommentsForTask,
  addCommentToTask,
} from "../controllers/taskController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

console.log('Task routes loaded and ready.');

// Task Management Routes
router
  .route("/")
   .post(protect, authorize(["Admin"]), createTask) // Chỉ Admin mới tạo task
  .get(protect, getTasks); // Tất cả user đã đăng nhập đều xem được task (có thể filter theo teamId)

router
  .route("/:id")
  .get(protect, getTaskById) // Tất cả user đã đăng nhập đều xem được task chi tiết
  .patch(protect, authorize(["Admin"]), updateTask) // Chỉ Admin mới cập nhật task
  .delete(protect, authorize(["Admin"]), deleteTask); // Chỉ Admin mới xóa task

// SubBoard Management within a Task (CREATE only, PATCH/DELETE SubBoard riêng)
router
  .route("/:taskId/subboards")
  .post(protect, authorize(["Admin"]), addSubBoardToTask); // Chỉ Admin mới thêm sub-board vào task

// Comment on Task Routes
router
  .route("/:taskId/comments")
  .get(protect, getCommentsForTask) // Tất cả user đã đăng nhập đều xem được comments
  .post(protect, addCommentToTask); // Tất cả user đã đăng nhập đều thêm được comment (Member có thể comment)

export default router;
