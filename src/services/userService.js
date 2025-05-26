import userRepository from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';

const userService = {
    /**
     * Registers a new user.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @return {Promise<{user: Object, token: string}>}
     * @throws {Error} The created user object.
     */
    register: async (username, password,role) => {
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const user = await userRepository.create({
             username, 
             password,
            role, // Default role is Member
        });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const userWithoutPassword = await userRepository.findById(user._id) // Remove password from user object
        return { user: userWithoutPassword, token };
    },

    /**
     * Authenticates a user and returns a Jwt
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @return {Promise<{user: Object, token: string}>}
     * @throws {Error} If the user does not exist or password is incorrect.
     */

    login: async (username, password) => {
        const user = await userRepository.findByUsername(username);
        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid username or password');
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const userWithoutPassword = await userRepository.findById(user._id) // Remove password from user object
        return { user: userWithoutPassword, token };
    },

    /**
     * Retrieves a user by their ID.
     * @param {string} userId - The ID of the user.
     * @return {Promise<Object>} The user object without password.
     */
    getProfile: async (userId) => {
        return await userRepository.findById(userId);
    },

    /**
     * Updates a user's profile.
     * @param {string} userId - The ID of the user.
     * @param {Object} updateData - The data to update.
     * @return {Promise<Object>} The updated user object without password.
     */
    updateProfile: async (userId, updateData) => {
        return await userRepository.updateById(userId,updateData); // Return user without password
    },
}

export default userService;