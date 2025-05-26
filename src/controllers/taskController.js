// controllers/taskController.js
import taskService from '../services/taskService.js';
import subBoardService from '../services/subBoardService.js'; // Cần để xử lý subboards trong task
import commentService from '../services/commentService.js';   // Cần để xử lý comments trong task

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin only)
const createTask = async (req, res, next) => {

    console.log('1. Inside createTask controller');

    const { title, description, dueTime, documentLink, githubRepo, teamId } = req.body;
    const creatorId = req.user._id; // Người dùng đã xác thực là người tạo task


  console.log('Request Body:', req.body); // LOG TOÀN BỘ BODY NHẬN ĐƯỢC
  console.log('Creator ID:', creatorId); // LOG creatorId

    // Basic validation in controller
    if (!title || !dueTime || !teamId) {
        return res.status(400).json({
            success: false,
            message: 'Task title, due time, and team ID are required.',
            data: {}
        });
    }

    // DueTime validation (basic check if it's a valid date string)
    if (isNaN(new Date(dueTime).getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid due time format. Please provide a valid date/time.',
            data: {}
        });
    }

    try {

         console.log('2. Calling taskService.createTask');

        const newTask = await taskService.create(title, description, new Date(dueTime), documentLink, githubRepo, creatorId, teamId);
         console.log('3. taskService.createTask returned:', newTask ? newTask._id : 'null');
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask,
        });
    } catch (error) {

          console.error('Error in createTask controller:', error); // Log lỗi chi tiết

        // Middleware xử lý lỗi chung sẽ bắt các ValidationErrors từ Mongoose
        next(error);
    }
};

// @desc    Get all tasks with pagination
// @route   GET /api/tasks
// @access  Private (All authenticated users)
const getTasks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const teamId = req.query.teamId; // Optional: filter tasks by teamId

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pagination parameters: page and limit must be positive numbers.',
                data: {}
            });
        }

        const { tasks, totalDocs, totalPages, currentPage } = await taskService.getAllTask(page, limit, teamId);

        res.status(200).json({
            success: true,
            message: 'Get all tasks successfully',
            data: {
                tasks,
                total: totalDocs, // Sử dụng 'total' theo ví dụ response của bạn
                page: currentPage,
                limit: limit,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private (All authenticated users)
const getTaskById = async (req, res, next) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Get task successfully',
            data: task,
        });
    } catch (error) {
        const statusCode = error.message.includes('Task not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            data: {}
        });
    }
};

// @desc    Update task information
// @route   PATCH /api/tasks/:id
// @access  Private (Admin only)
const updateTask = async (req, res, next) => {
    const taskId = req.params.id;
    // Chỉ cho phép cập nhật các trường này
    const { title, description, dueTime, documentLink, githubRepo, teamId } = req.body;
    const updateData = { title, description, dueTime, documentLink, githubRepo, teamId };

    // Filter out undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // DueTime validation if present
    if (updateData.dueTime && isNaN(new Date(updateData.dueTime).getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid due time format. Please provide a valid date/time.',
            data: {}
        });
    }

    try {
        const updatedTask = await taskService.updateTask(taskId, updateData);
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask,
        });
    } catch (error) {
        const statusCode = error.message.includes('Task not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            data: {}
        });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
const deleteTask = async (req, res, next) => {
    const taskId = req.params.id;

    try {
        const deletedTask = await taskService.deleteTask(taskId);
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: deletedTask,
        });
    } catch (error) {
        const statusCode = error.message.includes('Task not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            data: {}
        });
    }
};

// @desc    Add a sub-board to a task
// @route   POST /api/tasks/:taskId/subboards
// @access  Private (Admin only)
const addSubBoardToTask = async (req, res, next) => {
    const { taskId } = req.params;
    const { name, background } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Sub-board name is required.', data: {} });
    }

    try {
        const newSubBoard = await subBoardService.createSubBoard(name, taskId, background);
        res.status(201).json({
            success: true,
            message: 'Sub-board added to task successfully',
            data: newSubBoard,
        });
    } catch (error) {
        const statusCode = error.message.includes('Task not found') || error.message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            data: {}
        });
    }
};

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private (All authenticated users)
const getCommentsForTask = async (req, res, next) => {
    const { taskId } = req.params;

    try {
        const comments = await commentService.getCommentsByTaskId(taskId);
        res.status(200).json({
            success: true,
            message: 'Comments fetched successfully',
            data: comments,
        });
    } catch (error) {
        const statusCode = error.message.includes('Task not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            data: {}
        });
    }
};

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private (All authenticated users)
const addCommentToTask = async (req, res, next) => {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Người dùng đã xác thực là người tạo comment

    if (!content) {
        return res.status(400).json({ success: false, message: 'Comment content is required.', data: {} });
    }

    try {
        const newComment = await commentService.createComment(content, taskId, userId);
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: newComment,
        });
    } catch (error) {
        const statusCode = error.message.includes('Task not found') || error.message.includes('User not found') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            data: {}
        });
    }
};


export {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addSubBoardToTask,
    getCommentsForTask,
    addCommentToTask,
};