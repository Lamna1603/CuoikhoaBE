// services/commentService.js
import commentRepository from '../repositories/commentRepository.js';
import taskRepository from '../repositories/taskRepository.js'; // Để thêm comment vào task
import userRepository from '../repositories/userRepository.js'; // Để kiểm tra userId

const commentService = {
  /**
   * Creates a new comment and links it to a task.
   * @param {string} content - The content of the comment.
   * @param {string} taskId - The ID of the task this comment belongs to.
   * @param {string} userId - The ID of the user creating the comment.
   * @returns {Promise<Object>} The created comment object.
   * @throws {Error} If task or user not found.
   */
  createComment: async (content, taskId, userId) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const newComment = await commentRepository.create({ content, taskId, userId });
    // Thêm Comment ID vào mảng comments của Task
    await taskRepository.addCommentToTask(taskId, newComment._id);
    return newComment;
  },

  /**
   * Gets all comments for a specific task.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<Array>} An array of comment objects.
   * @throws {Error} If task not found.
   */
  getCommentsByTaskId: async (taskId) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }
    return await commentRepository.findByTaskId(taskId);
  },

  // DELETE comment (nếu cần, chỉ Admin hoặc người tạo comment)
  // Trong trường hợp này, yêu cầu API chỉ có "Thêm" và "Lấy tất cả", không có "Xóa" comment riêng biệt.
  // Nếu muốn thêm xóa, cần xem xét quyền hạn.
  // Tuy nhiên, khi Task bị xóa, các comment liên quan cũng sẽ bị xóa bởi deleteTask service.
};

export default commentService;