// services/subBoardService.js
import subBoardRepository from '../repositories/subBoard.js';
import taskRepository from '../repositories/taskRepository.js'; // Để thêm/xóa subBoard vào task

const subBoardService = {
    /**
     * Creates a new sub-board and links it to a task.
     * @param {string} name - The name of the sub-board.
     * @param {string} taskId - The ID of the task this sub-board belongs to.
     * @param {string} background - Optional background image URL.
     * @returns {Promise<Object>} The created sub-board object.
     * @throws {Error} If task not found or sub-board name already exists for the task.
     */
    createSubBoard: async (name, taskId, background) => {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new Error('Task not found.');
        }

        // Kiểm tra xem SubBoard với cùng tên đã tồn tại cho Task này chưa
        const existingSubBoards = await subBoardRepository.findByTaskId(taskId);
        const isNameTaken = existingSubBoards.some(sb => sb.name.toLowerCase() === name.toLowerCase());
        if (isNameTaken) {
            throw new Error(`SubBoard with name '${name}' already exists for this task.`);
        }

        const newSubBoard = await subBoardRepository.create({ name, taskId, background });
        // Thêm SubBoard ID vào mảng subBoards của Task
        await taskRepository.addSubBoardToTask(taskId, newSubBoard._id);
        return newSubBoard;
    },

    /**
     * Gets a single sub-board by ID.
     * @param {string} subBoardId - The ID of the sub-board.
     * @returns {Promise<Object|null>} The sub-board object, or null if not found.
     */
    getSubBoardById: async (subBoardId) => {
        const subBoard = await subBoardRepository.findById(subBoardId);
        if (!subBoard) {
            throw new Error('SubBoard not found.');
        }
        return subBoard;
    },

    /**
     * Gets all sub-boards for a specific task.
     * @param {string} taskId - The ID of the task.
     * @returns {Promise<Array>} An array of sub-board objects.
     */
    getSubBoardsByTaskId: async (taskId) => {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new Error('Task not found.');
        }
        return await subBoardRepository.findByTaskId(taskId);
    },

    /**
     * Updates a sub-board's information.
     * @param {string} subBoardId - The ID of the sub-board to update.
     * @param {Object} updateData - Data to update (name, background).
     * @returns {Promise<Object>} The updated sub-board object.
     * @throws {Error} If sub-board not found or update fails.
     */
    updateSubBoard: async (subBoardId, updateData) => {
        // Nếu có cập nhật tên, cần kiểm tra trùng tên trong cùng một task
        if (updateData.name) {
            const subBoard = await subBoardRepository.findById(subBoardId);
            if (!subBoard) throw new Error('SubBoard not found.');

            const existingSubBoards = await subBoardRepository.findByTaskId(subBoard.taskId.toString());
            const isNameTaken = existingSubBoards.some(sb =>
                sb.name.toLowerCase() === updateData.name.toLowerCase() && sb._id.toString() !== subBoardId
            );
            if (isNameTaken) {
                throw new Error(`SubBoard with name '${updateData.name}' already exists for this task.`);
            }
        }

        const updatedSubBoard = await subBoardRepository.update(subBoardId, updateData);
        if (!updatedSubBoard) {
            throw new Error('SubBoard not found or could not be updated.');
        }
        return updatedSubBoard;
    },

    /**
     * Deletes a sub-board.
     * @param {string} subBoardId - The ID of the sub-board to delete.
     * @returns {Promise<Object>} The deleted sub-board object.
     * @throws {Error} If sub-board not found or delete fails.
     */
    deleteSubBoard: async (subBoardId) => {
        const deletedSubBoard = await subBoardRepository.delete(subBoardId);
        if (!deletedSubBoard) {
            throw new Error('SubBoard not found or could not be deleted.');
        }
        // Xóa SubBoard ID khỏi mảng subBoards của Task tương ứng
        await taskRepository.removeSubBoardFromTask(deletedSubBoard.taskId.toString(), subBoardId);
        return deletedSubBoard;
    },
};

export default subBoardService;