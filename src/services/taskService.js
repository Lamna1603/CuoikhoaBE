import taskRepository from "../repositories/taskRepository.js";
import userRepository from "../repositories/userRepository.js";
import subBoardRepository from "../repositories/subBoard.js";
import commentRepository from "../repositories/commentRepository.js";
import e from "express";
import teamRepository from "../repositories/teamRepository.js";

const taskService = {
  /**
   * Creates a new task.
   * @param {string} title - The title of the task.
   * @param {string} description - The description of the task.
   * @param {Date} dueTime - The due time of the task.
   * @param {string} documentLink - Optional document link.
   * @param {string} githubRepo - Optional GitHub repo link.
   * @param {string} creatorId - The ID of the user creating the task.
   * @param {string} teamId - The ID of the team the task belongs to.
   * @returns {Promise<Object>} The created task object.
   * @throws {Error} If creator not found.
   */
  create: async (
    title,
    description,
    dueTime,
    documentLink,
    githubRepo,
    creatorId,
    teamId
  ) => {
    console.log("4. Inside taskService.createTask. creatorId:", creatorId);

    const creator = await userRepository.findById(creatorId);
    if (!creator) {
      console.log("5. Creator user not found. Throwing error.");
      throw new Error("Creator not found");
    }

    const team = await teamRepository.findById(teamId);
    if (!team) {
      console.log("5. Team not found. Throwing error.");
      throw new Error("Team not found");
    }

    const memberTeam = team.members.find(
      (member) => member._id.toString() === creatorId.toString()
    );
    if (!memberTeam) {
      console.log("5. Creator is not a member of the team. Throwing error.");
      throw new Error("Creator is not a member of the team");
    }

    console.log("5. Creator found:", creator._id, "and team found:", team._id);

    console.log("6. Creator found. Calling taskRepository.create");

    const newTask = await taskRepository.create({
      title,
      description,
      dueTime,
      documentLink,
      githubRepo,
      creator: creatorId,
      teamId,
    });

    console.log("7. taskRepository.create returned:", newTask);

    return newTask;
  },

  /**
   * Gets all tasks with pagination and optional filtering by teamId.
   * @param {number} page - The current page number.
   * @param {number} limit - The number of tasks per page.
   * @param {string} [teamId] - Optional team ID to filter tasks by.
   * @returns {Promise<Object>} An object containing the tasks and pagination info.
   */
  getAllTask: async (page = 1, limit = 10, teamId = null, creatorId) => {
    const {teams:listTeam} = await teamRepository.findAll({ members: creatorId });
    if (!listTeam || listTeam.length === 0) {
      throw new Error("No teams found for the user");
    }
    // If teamId is provided, check if it exists in the user's teams
    if (
      teamId &&
      !listTeam.some((team) => team._id.toString() === teamId.toString())
    ) {
      throw new Error("Team not found for the user");
    }
    // If no teamId is provided, use the first team from the user's teams
    if (teamId) {
      // Lọc theo teamId cụ thể
      return await taskRepository.findAll({ page, limit, teamId });
    } else {
      // Lấy tất cả task thuộc các team mà user là thành viên
      const teamIds = listTeam.map((team) => team._id.toString());
      return await taskRepository.findAll({ page, limit, teamIds });
    }
  },

  /**
   * Gets a task by its ID.
   * @param {string} id - The ID of the task to find.
   * @returns {Promise<Object|null>} The found task object, or null if not found.
   */
  getTaskById: async (id,creatorId) => {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new Error("Task not found");
    }

    // Kiểm tra xem người dùng có quyền truy cập vào task này không
      const team = await teamRepository.findById(task.teamId);

    if (!team) {
      throw new Error("Team not found for this task");
    }
    const isMember = team.members.some(
      (member) => member._id.toString() === creatorId.toString()
    )
    if (!isMember) {
      throw new Error("You do not have permission to access this task");
    }

    return task;
  },

  /**
   * Updates a task by its ID.
   * @param {string} id - The ID of the task to update.
   * @param {Object} updateData - The data to update the task with.
   * @returns {Promise<Object>} The updated task object.
   * @throws {Error} If the task is not found.
   */
  updateTask: async (id, updateData,creatorId) => {

    const task = await taskRepository.findById(id);

    const team = await teamRepository.findById(task.teamId);
    if (!team) {
      throw new Error("Team not found for this task");
    }
    
    const isAdmin = team.admin._id.toString() === creatorId.toString();
    if (!isAdmin) {
        throw new Error("You do not have permission to update this task");
        }

    const updatedTask = await taskRepository.update(id, updateData);
    if (!updatedTask) {
      throw new Error("Task not found");
    }
    return updatedTask;
  },

  /**
   * Deletes a task by its ID.
   * @param {string} taskId - The ID of the task to delete.
   * @returns {Promise<Object>} The deleted task object.
   * @throws {Error} If the task is not found.
   */
  deleteTask: async (taskId,creatorId) => {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const team = await teamRepository.findById(task.teamId);
    if (!team) {
      throw new Error("Team not found for this task");
    }
    const isAdmin = team.admin._id.toString() === creatorId.toString();
    if (!isAdmin) {
      throw new Error("You do not have permission to delete this task");
    }

    // Delete associated comments
    for (const commentId of task.comments) {
      await commentRepository.delete(commentId);
    }
    // Delete associated sub-boards
    for (const subBoardId of task.subBoard) {
      await subBoardRepository.delete(subBoardId);
    }

    const deletedTask = await taskRepository.delete(taskId);
    if (!deletedTask) {
      throw new Error("Task not found");
    }
    return deletedTask;
  },

  /**
     * Creates a new sub-board and adds it to a task.
     * @param {string} name - The name of the sub-board.
     * @param {string} background - The background color/image URL of the sub-board.
     * @param {string} taskId - The ID of the task to add the sub-board to.
     * @param {string} userId - The ID of the user performing the action (for authorization).
     * @returns {Promise<Object>} The newly created sub-board object.
     * @throws {Error} If task or user not found, or not authorized.
     */
    addSubBoardToTask: async (name, background, taskId, userId) => {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }

        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const team = await teamRepository.findById(task.teamId);
        if (!team) {
            throw new Error("Team not found for this task");
        }

        // Quyền thêm sub-board: chỉ admin của team hoặc admin hệ thống
        const isSystemAdmin = user.role === 'Admin';
        const isTeamAdmin = team.admin._id.toString() === userId.toString();

        if (!isSystemAdmin && !isTeamAdmin) {
            throw new Error('Not authorized to add sub-boards to this task.');
        }

        // Kiểm tra xem sub-board với tên này đã tồn tại trong task này chưa
        // (Đây là logic cần thiết nếu bạn muốn tên sub-board là duy nhất cho mỗi task)
        const existingSubBoards = await subBoardRepository.findAllByTaskId(taskId);
        const nameExists = existingSubBoards.some(sb => sb.name.toLowerCase() === name.toLowerCase());

        if (nameExists) {
            throw new Error(`Sub-board with name '${name}' already exists in this task.`);
        }

        // 1. Tạo SubBoard mới
        // Truyền taskId vào đây vì SubBoard schema có required: true cho taskId
        const newSubBoard = await subBoardRepository.create({ name, background, taskId });

        if (!newSubBoard) {
            throw new Error("Failed to create sub-board.");
        }

        // 2. Gán ID của SubBoard mới vào Task (Task schema có subBoard là một mảng)
        // taskRepository.addSubBoardToTask sẽ tự động gọi save() và populate
        const updatedTask = await taskRepository.addSubBoardToTask(taskId, newSubBoard._id);

        if (!updatedTask) {
            // Trường hợp này có thể xảy ra nếu taskRepository.addSubBoardToTask trả về null
            // nhưng với cách implement hiện tại của taskRepository thì không.
            throw new Error("Failed to link sub-board to task.");
        }

        return newSubBoard; // Trả về SubBoard đã tạo
    },

    /**
     * Adds a comment to a specific task.
     * @param {string} content - The content of the comment.
     * @param {string} taskId - The ID of the task to add the comment to.
     * @param {string} userId - The ID of the user making the comment.
     * @returns {Promise<Object>} The newly created comment object.
     * @throws {Error} If task, user, or team not found, or not authorized.
     */
    addCommentToTask: async (content, taskId, userId) => {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error('Task not found');

        const team = await teamRepository.findById(task.teamId);
        if (!team) throw new Error('Team not found for this task');

        // Quyền thêm comment: member của team, admin team, hoặc admin hệ thống
        const isSystemAdmin = user.role === 'Admin';
        const isTeamAdmin = team.admin._id.toString() === userId.toString();
        const isTeamMember = team.members.some(member => member._id.toString() === userId.toString());

        if (!isSystemAdmin && !isTeamAdmin && !isTeamMember) {
            throw new Error('Not authorized to add comments to this task.');
        }

        // 1. Tạo Comment mới
        // Truyền taskId và userId vào đây vì Comment schema có required: true cho cả hai
        const newComment = await commentRepository.create({ content, userId, taskId });
        if (!newComment) {
            throw new Error("Failed to create comment.");
        }

        // 2. Gán ID của Comment mới vào Task (Task schema có comments là một mảng)
        // taskRepository.addCommentToTask sẽ tự động gọi save() và populate
        const updatedTask = await taskRepository.addCommentToTask(taskId, newComment._id);
        if (!updatedTask) {
            throw new Error("Failed to link comment to task.");
        }
        
        // Lấy lại comment để populate user (nếu cần hiển thị ngay sau khi tạo)
        // commentRepository.create đã trả về comment đã được populate user, nhưng nếu không, cần gọi lại findById
        return await commentRepository.findById(newComment._id); // Để đảm bảo trả về comment có user info
    },

    /**
     * Gets all comments for a specific task.
     * @param {string} taskId - The ID of the task.
     * @param {string} userId - The ID of the user requesting comments.
     * @returns {Promise<Array>} An array of comment objects.
     * @throws {Error} If task or user not found, or not authorized.
     */
    getCommentsForTask: async (taskId, userId) => {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error('Task not found');

        const team = await teamRepository.findById(task.teamId);
        if (!team) throw new Error('Team not found for this task');

        // Quyền xem comments: member của team, admin team, hoặc admin hệ thống
        const isSystemAdmin = user.role === 'Admin';
        const isTeamAdmin = team.admin._id.toString() === userId.toString();
        const isTeamMember = team.members.some(member => member._id.toString() === userId.toString());

        if (!isSystemAdmin && !isTeamAdmin && !isTeamMember) {
            throw new Error('Not authorized to view comments for this task.');
        }

        return await commentRepository.findByTaskId(taskId);
    },

};

export default taskService;
