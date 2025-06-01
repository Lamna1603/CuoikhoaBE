// controllers/teamController.js
import teamService from '../services/teamService.js';

const createTeam = async (req, res, next) => {
    // const errors = validationResult(req); // Nếu dùng validator
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ success: false, message: errors.array(), data: {} });
    // }

    const { name, description } = req.body;
    const adminId = req.user._id; // Lấy adminId từ token đã xác thực

    if (!name) {
        return res.status(400).json({ success: false, message: 'Team name is required.', data: {} });
    }

    try {
        const newTeam = await teamService.createTeam(name, description, adminId);
        res.status(201).json({ success: true, message: 'Team created successfully', data: newTeam });
    } catch (error) {
        console.error('Error creating team:', error.message);
        next(error);
    }
};

const getTeams = async (req, res, next) => {
    try {
        const teams = await teamService.getTeams(req.query);
        res.status(200).json({ success: true, message: 'Teams fetched successfully', data: teams });
    } catch (error) {
        console.error('Error fetching teams:', error.message);
        next(error);
    }
};

const getTeamById = async (req, res, next) => {
    try {
        const team = await teamService.getTeamById(req.params.id);
        res.status(200).json({ success: true, message: 'Team fetched successfully', data: team });
    } catch (error) {
        console.error('Error fetching team by ID:', error.message);
        next(error);
    }
};

const updateTeam = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id; // Người thực hiện update

     console.log('--- Inside updateTeam controller ---');
    console.log('Team ID from params:', id);
    console.log('Update Data:', updateData);
    console.log('User ID from token (req.user._id):', userId)

    try {
        const updatedTeam = await teamService.updateTeam(id, updateData, userId);
        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: 'Team not found', data: {} });
        }
        res.status(200).json({ success: true, message: 'Team updated successfully', data: updatedTeam });
    } catch (error) {
        console.error('Error updating team:', error.message);
        next(error);
    }
};

const deleteTeam = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id; // Người thực hiện xóa

    try {
        await teamService.deleteTeam(id, userId);
        res.status(200).json({ success: true, message: 'Team deleted successfully', data: {} });
    } catch (error) {
        console.error('Error deleting team:', error.message);
        next(error);
    }
};

const addMemberToTeam = async (req, res, next) => {
    const { teamId } = req.params;
    const { memberId } = req.body; // ID của user muốn thêm vào team
    const adminId = req.user._id; // Admin thực hiện thao tác

    try {
        const updatedTeam = await teamService.addMemberToTeam(teamId, memberId, adminId);
        res.status(200).json({ success: true, message: 'Member added to team successfully', data: updatedTeam });
    } catch (error) {
        console.error('Error adding member to team:', error.message);
        next(error);
    }
};

const removeMemberFromTeam = async (req, res, next) => {
    const { teamId } = req.params;
    const { memberId } = req.body; // ID của user muốn xóa khỏi team
    const adminId = req.user._id; // Admin thực hiện thao tác

    try {
        const updatedTeam = await teamService.removeMemberFromTeam(teamId, memberId, adminId);
        res.status(200).json({ success: true, message: 'Member removed from team successfully', data: updatedTeam });
    } catch (error) {
        console.error('Error removing member from team:', error.message);
        next(error);
    }
};

export {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addMemberToTeam,
    removeMemberFromTeam,
};