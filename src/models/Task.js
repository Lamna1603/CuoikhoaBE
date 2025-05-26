import mongoose from "mongoose";
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    dueTime: {
        type: Date,
        default: null, // Không bắt buộc, có thể để null nếu không có thời hạn
    },
    documentLink: { 
        type:String,
        validate: {
            validator: function(v) {
                return v ? /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- ./?%&=]*)?$/.test(v) : true; // Cho phép null hoặc chuỗi rỗng
            },
            message: props => `${props.value} is not a valid URL!`
        },
        default: null, // Không bắt buộc, có thể để null nếu không có liên kết
    },
    githubRepo:{
        type: String,
        validate: {
            validator: function(v) {
                return v ? /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-]+$/.test(v) : true; // Cho phép null hoặc chuỗi rỗng
            },
            message: props => `${props.value} is not a valid GitHub repository URL!`
        },
        default: null, // Không bắt buộc, có thể để null nếu không có liên kết
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    subBoards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubBoard",
    }],
    comments: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],

}, { timestamps: true });

const Task = mongoose.model("Task", TaskSchema);
export default Task;
