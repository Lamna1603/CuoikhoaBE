// routes/teamRoutes.js
import express from 'express';
import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addMemberToTeam,
    removeMemberFromTeam,
} from '../controllers/teamController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize(['Admin']), createTeam) // Chỉ Admin mới được tạo team
    .get(protect, getTeams); // Tất cả user đã đăng nhập xem được team

router.route('/:id')
    .get(protect, getTeamById) // Tất cả user đã đăng nhập xem được team chi tiết
    .patch(protect, authorize(['Admin']), updateTeam) // Chỉ Admin mới được cập nhật team
    .delete(protect, authorize(['Admin']), deleteTeam); // Chỉ Admin mới được xóa team

router.route('/:teamId/members')
    .post(protect, authorize(['Admin']), addMemberToTeam) // Admin thêm thành viên
    .delete(protect, authorize(['Admin']), removeMemberFromTeam); // Admin xóa thành viên

export default router;