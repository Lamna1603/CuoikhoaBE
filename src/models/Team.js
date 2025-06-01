// models/Team.js
import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    members: [{ // Các thành viên của team
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    admin: { // Người tạo/quản lý chính của team (có thể là một Admin user)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Team = mongoose.model('Team', TeamSchema);
export default Team;