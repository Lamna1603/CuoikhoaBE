import SubBoard from "../models/SubBoard.js";

const subBoardRepository = {
  /**
   * Creates a new sub-board.
   * @param {Object} subBoardData - The data for the new sub-board.
   * @returns {Promise<Object>} The created sub-board object.
   */
  create: async (subBoardData) => {
    const subBoard = new SubBoard(subBoardData);
    return await subBoard.save();
  },

  /**
   * Finds a sub-board by its ID.
   * @param {string} id - The ID of the sub-board to find.
   * @return {Promise<Object|null>} The found sub-board object, or null if not found.
   */
  findById: async (id) => {
    return await SubBoard.findById(id).populate("tasksId", "title");
  },

  /**
   * Finds all sub-boards for a specific task.
   * @param {string} taskId - The ID of the task to find sub-boards for.
   * @return {Promise<Array>} An array of sub-board objects.
   */
  findAllByTaskId: async (taskId) => {
    return await SubBoard.find({ tasksId: taskId });
  },

  /**
   * Updates a sub-board by its ID.
   * @param {string} id - The ID of the sub-board to update.
   * @param {Object} updateData - The data to update the sub-board with.
   * @return {Promise<Object|null>} The updated sub-board object, or null if not found.
   */
  update: async (id, updateData) => {
    const subBoard = await SubBoard.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return subBoard ? await subBoard.populate("tasksId", "title") : null;
  },

  /**
   * Deletes a sub-board by its ID.
   * @param {string} id - The ID of the sub-board to delete.
   * @return {Promise<Object|null>} The deleted sub-board object, or null if not found.
   */
  delete: async (id) => {
    return await SubBoard.findByIdAndDelete(id);
  },
};

export default subBoardRepository;
