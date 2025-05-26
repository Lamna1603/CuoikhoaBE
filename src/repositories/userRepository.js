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
    }
}
export default userRepository;