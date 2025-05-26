import Comment from "../models/Comment.js";
import User from "../models/User.js";

const commentRepository = {
    /**
     * Creates a new comment.
     * @param {Object} commentData - The data for the new comment.
     * @return {Promise<Object>} The created comment object.
     */
    create: async (commentData) => {
        const comment = new Comment(commentData);
        return await comment.save();
    },

    /**
     * Finds all comments for a specific task.
     * @param {string} taskId - The ID of the task to find comments for.
     * @return {Promise<Array>} An array of comment objects.
     */
    findByTaskId: async (taskId) => {
        return await Comment.find({ taskId })
            .populate('userId', 'username')
            .sort({ createdAt: 1 });
    },

    /**
     * deletes a comment by its ID.
     * @param {string} id - The ID of the comment to delete.
     * @return {Promise<Object|null>} The deleted comment object, or null if not found.
     */
    delete: async (id) => {
        return await Comment.findByIdAndDelete(id);
    }
}

export default commentRepository;