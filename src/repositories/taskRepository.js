import Task from "../models/Task.js";
import User from "../models/User.js";
import SubBoard from "../models/SubBoard.js";
import Comment from "../models/Comment.js";

const taskRepository = {
  /**
   * Creates a new task.
   * @param {Object} taskData - The data for the new task.
   * @returns {Promise<Object>} The created task object.
   */
  create: async (taskData) => {
    console.log("8. Inside taskRepository.create. taskData:", taskData);

    const task = new Task(taskData);

    console.log("9. New Task instance created. Calling save().");

    try {
      await task.save(); // Điểm quan trọng nhất!
      console.log("10. Task successfully saved to DB. ID:", task._id);
      return task;
    } catch (saveError) {
      console.error("Error saving task to DB:", saveError.message); // Log lỗi nếu save() thất bại
      throw saveError; // Ném lại lỗi để service bắt
    }
  },

  /**
   * Finds all tasks with pagination and optional filtering by teamId.
   * @param {Object} [options = {}] - The query parameters for filtering and pagination.
   * @param {number} [options.page = 1] - The page number for pagination.
   * @param {number} [options.limit = 10] - The number of tasks per page.
   * @param {string} [options.teamId] - The team ID to filter tasks by.
   * @return {Promise<{task: Array, totalDocs: number, totalPage: number, currentPage: number}>} An object containing the tasks and pagination info.
   */
  findAll: async (options = {}) => {
    const { page = 1, limit = 10, teamId, teamIds } = options;
    const skip = (page - 1) * limit;
    let query = {};
    if (teamId) {
      query.teamId = teamId;
    }

    // Thêm hỗ trợ lọc theo nhiều teamIds
    if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
      query.teamId = { $in: teamIds };
    }

    const totalDocs = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(limit)
      .populate("creator", "username")
      .populate({
        path: "subBoard",
        select: "name background",
      })
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "username",
        },
      })
      .populate("teamId", "name")
      .sort({ createdAt: -1 });
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      tasks,
      totalDocs,
      totalPages,
      currentPage: page,
    };
  },

  /**
   * Finds a task by its ID.
   * @param {string} id - The ID of the task to find.
   * @returns {Promise<Object|null>} The found task object, or null if not found.
   */
  findById: async (id) => {
    return await Task.findById(id)
      .populate("creator", "username")
      .populate({
        path: "subBoard",
        select: "name background",
      })
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "username",
        },
      })
      .populate("teamId", "name");
  },

  /**
   * Updates a task by its ID.
   * @param {string} id - The ID of the task to update.
   * @param {Object} updateData - The data to update the task with.
   * @returns {Promise<Object|null>} The updated task object, or null if not found.
   */
  update: async (id, updateData) => {
    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("creator", "username")
      .populate("subBoard", "name background")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username" },
      })
      .populate("teamId", "name");
    return task;
  },

  /**
   * Deletes a task by its ID.
   * @param {string} id - The ID of the task to delete.
   * @returns {Promise<Object|null>} The deleted task object, or null if not found.
   */
  delete: async (id) => {
    return await Task.findByIdAndDelete(id);
  },

  /**
   * Add a sub-board to a task
   * @param {string} taskId - The ID of the task to update.
   * @param {string} subBoardId - The data for the new sub-board.
   * @returns {Promise<Object|null>} The updated task object with the new sub-board, or null if not found.
   */
  addSubBoardToTask: async (taskId, subBoardId) => {
    const task = await Task.findById(taskId);
    if (!task) {
      return null; // Task not found
    }

    // Check if the sub-board already exists in the task's subBoard array
    if (!task.subBoard.includes(subBoardId)) {
      task.subBoard.push(subBoardId);
      await task.save();
    }

    // Add the sub-board to the task's subBoard array

    return await Task.findById(taskId)
      .populate("creator", "username")
      .populate("subBoard", "name background")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "username",
        },
      });
  },

  /**
   * Removes a sub-board from a task
   * @param {string} taskId - The ID of the task to update.
   * @param {string} subBoardId - The ID of the sub-board to remove.
   * @return {Promise<Object|null>} The updated task object with the sub-board removed, or null if not found.
   */
  removeSubBoardFromTask: async (taskId, subBoardId) => {
    const task = await Task.findById(taskId);
    if (!task) {
      return null; // Task not found
    }

    // Remove the sub-board from the task's subBoard array
    task.subBoard = task.subBoard.filter(
      (id) => id.toString() !== subBoardId
    );
    await task.save();

    return await Task.findById(taskId)
      .populate("creator", "username")
      .populate("subBoard", "name background")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "username",
        },
      });
  },

  /**
   * Adds a comment to a task.
   * @param {string} taskId - The ID of the task to add a comment to.
   * @param {string} commentId
   * @returns {Promise<Object|null>} - The content of the comment.
   */
  addCommentToTask: async (taskId, commentId) => {
    const task = await Task.findById(taskId);
    if (!task) {
      return null; // Task not found
    }

    // Check if the comment already exists in the task's comments array
    task.comments.push(commentId);
    await task.save();

    return await Task.findById(taskId)
      .populate("creator", "username")
      .populate("subBoard", "name background")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "username",
        },
      });
  },
};
export default taskRepository;
