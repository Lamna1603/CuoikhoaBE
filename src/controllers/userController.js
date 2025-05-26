import userService from "../services/userService.js";

//@desc Register a new user
//@route POST /api/users/register
//@access Public
    const registerUser = async (req, res, next) => {
        const { username, password,role } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required',
                data: {}
            });
        }

        try {
            const { user, token } = await userService.register(username, password,role);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { 
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }

//@desc Login a user
//@route POST /api/users/login
//@access Public
const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required',
            data: {}
        });
    }

    try {
        const { user, token } = await userService.login(username, password);
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: { 
                id: user._id,
                username: user.username,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
}

//@desc Get user profile
//@route GET /api/users/me
//@access Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await userService.getProfile(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: {}
            });
        }
        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: { 
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

//@desc Update user profile
//@route PATCH /api/users/me
const updateUserProfile = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username && !password) {
        return res.status(400).json({
            success: false,
            message: 'At least one field (username or password) is required to update',
            data: {}
        });
    }

    try {
        const updatedUser = await userService.updateProfile(req.user._id, { username, password });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: {}
            });
        }
        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            data: { 
                id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

//@desc Delete user profile
//@route DELETE /api/users/profile
const deleteUserProfile = async (req, res, next) => {
    try {
        const deletedUser = await userService.deleteProfile(req.user._id);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: {}
            });
        }
        res.status(200).json({
            success: true,
            message: 'User profile deleted successfully',
            data: { 
                id: deletedUser._id,
                username: deletedUser.username,
                role: deletedUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

export {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
};