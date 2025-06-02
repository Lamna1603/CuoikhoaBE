import mongoose from "mongoose";

const SubBoardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
   
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
    },
    background: {
        type: String,
        default: null, // Màu nền mặc định
    },
}, { timestamps: true });

SubBoardSchema.index({ name: 1, taskId: 1 }, { unique: true });
const SubBoard = mongoose.model("SubBoard", SubBoardSchema);
export default SubBoard;