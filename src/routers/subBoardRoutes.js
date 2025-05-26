// routes/subBoardRoutes.js
import express from 'express';
import {
  updateSubBoard,
  deleteSubBoard,
  uploadSubBoardBackground,
} from '../controllers/subBoardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// SubBoard Management Routes (outside of task nesting)
router.route('/:id')
  .patch(protect, authorize(['Admin']), updateSubBoard) // Chỉ Admin mới cập nhật sub-board
  .delete(protect, authorize(['Admin']), deleteSubBoard); // Chỉ Admin mới xóa sub-board

router.route('/:id/upload-bg')
  .post(protect, authorize(['Admin', 'Member']), uploadSubBoardBackground); // Admin/Member có thể upload background

export default router;