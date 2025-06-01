import User from '../models/User.js';

const userRepository = {
    /**
   * Finds a user by their ID.
   * @param {string} id - The user's ID.
   * @returns {Promise<Object|null>} The user object without password, or null if not found.
   */
    findById: async (id) => {
        return await User.findById(id).select('-password');
    },

    /**
     * Finds a user by their username.
     * @param {string} username - The user's username.    
     * @return {Promise<Object|null>} The user object without password, or null if not found.
     */
    findByUsername: async (username) => {
        return await User.findOne({ username });
    },

    /**
     * Creates a new user. Password hashing is handled in the User model.
     * @param {Object} userData - The user data to create.
     * @return {Promise<Object>} The created user object.
     */
    create: async (userData) => {
        const user = new User(userData);
        return await user.save();
    },

    /**
     * Updates a user by their ID.
     * @param {string} id - The user's ID.
     * @param {Object} updateData - The data to update.
     * @return {Promise<Object>} The updated user object.
     */
    updateById: async (id, updateData) => {
        const user = await User.findById(id);
        if (user) {
            if(updateData.username) {
                user.username = updateData.username;
            }
            if(updateData.password) {
                user.password = updateData.password; // Password hashing is handled in the User model
            }
            await user.save();
            return user;
        }
        return null;
    },

    /**
     * Deletes a user by their ID.
     * @param {string} id - The user's ID.
     * @return {Promise<Object>} The deleted user object.
     */
    deleteById: async (id) => {
        const user = await User.findById(id);
        if (user) {
            await user.remove();
            return user;
        }
        return null;
    },

    /**
     * Get all users.
     * @return {Promise<Array>} An array of user objects without passwords.
     */
    getAll: async () => {
        return await User.find().select('-password');
    },

    /**
     * Add a team to a user.
     * @param {string} userId - The ID of the user. 
     * @param {string} teamId - The ID of the team to add.
     * @return {Promise<Object>} The updated user object.
     */
    addTeamToUser: async (userId, teamId) => {
        const user = await User.findById(userId);
        if (user) {
            if (!user.teams.includes(teamId)) {
                user.teams.push(teamId);
                await user.save();
            }
            return user;
        }
        return null;
    },

    /**
     * Remove a team from a user.
     * @param {string} userId - The ID of the user.
     * @param {string} teamId - The ID of the team to remove.
     * @return {Promise<Object>} The updated user object.
     */
    removeTeamFromUser: async (userId, teamId) => {
        const user = await User.findById(userId);
        if (user) {
            user.teams = user.teams.filter(team => team.toString() !== teamId.toString());
            await user.save();
            return user;
        }
        return null;
    },
}
export default userRepository;