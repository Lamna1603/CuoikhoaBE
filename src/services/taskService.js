import taskRepository from "../repositories/taskRepository.js";
import userRepository from "../repositories/userRepository.js";
import subBoardRepository from "../repositories/subBoard.js";
import commentRepository from "../repositories/commentRepository.js";
import e from "express";
import teamRepository from '../repositories/teamRepository.js';


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
    create: async (title, description, dueTime, documentLink, githubRepo, creatorId, teamId) => {

        console.log('4. Inside taskService.createTask. creatorId:', creatorId);

        const creator = await userRepository.findById(creatorId);
        if (!creator) {
             console.log('5. Creator user not found. Throwing error.');
            throw new Error('Creator not found');
        }
        
         console.log('6. Creator found. Calling taskRepository.create');


        const newTask = await taskRepository.create({
            title,
            description,
            dueTime,
            documentLink,
            githubRepo,
            creator: creatorId,
            teamId,
        });

          console.log('7. taskRepository.create returned:', newTask);

        return newTask
    },

    /**
     * Gets all tasks with pagination and optional filtering by teamId.
     * @param {number} page - The current page number.
     * @param {number} limit - The number of tasks per page.
     * @param {string} [teamId] - Optional team ID to filter tasks by.
     * @returns {Promise<Object>} An object containing the tasks and pagination info.
     */
    getAllTask: async (page = 1, limit = 10, teamId = null) => {
        return await taskRepository.findAll({ page, limit, teamId });
    },

    /**
     * Gets a task by its ID.
     * @param {string} id - The ID of the task to find.
     * @returns {Promise<Object|null>} The found task object, or null if not found.
     */
    getTaskById: async (id) => {
        const task= await taskRepository.findById(id);
        if (!task) {
            throw new Error('Task not found');
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
    updateTask: async (id, updateData) => {
        const updatedTask = await taskRepository.update(id, updateData);
        if (!updatedTask) {
            throw new Error('Task not found');
        }
        return updatedTask;
    },

    /**
     * Deletes a task by its ID.
     * @param {string} taskId - The ID of the task to delete.
     * @returns {Promise<Object>} The deleted task object.
     * @throws {Error} If the task is not found.
     */
    deleteTask: async (taskId) => {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new Error('Task not found');
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
            throw new Error('Task not found');
        }
        return deletedTask;
    },
}

export default taskService;