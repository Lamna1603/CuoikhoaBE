import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js'; 
import { authorize } from '../middlewares/authMiddleware.js';


const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.patch('/me', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);

export default router;