// repositories/teamRepository.js
import Team from '../models/Team.js';

const teamRepository = {
    create: async (teamData) => {
        const newTeam = new Team(teamData);
        await newTeam.save();
        return newTeam;
    },
    findById: async (id) => {
        return await Team.findById(id).populate('members', 'username').populate('admin', 'username');
    },
    findByName: async (name) => {
        return await Team.findOne({ name });
    },
    findAll: async ({ page = 1, limit = 10 }) => {
        const teams = await Team.find({})
            .populate('members', 'username')
            .populate('admin', 'username')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const total = await Team.countDocuments();
        return { teams, total, page, pages: Math.ceil(total / limit) };
    },
    update: async (id, updateData) => {
        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // runValidators để chạy các validation trong schema
        ).populate('members', 'username').populate('admin', 'username');
        return updatedTeam;
    },
    delete: async (id) => {
        await Team.findByIdAndDelete(id);
    },
    addMember: async (teamId, userId) => {
        const team = await Team.findById(teamId);
        if (team && !team.members.includes(userId)) {
            team.members.push(userId);
            await team.save();
            return await team.populate('members', 'username');
        }
        return team;
    },
    removeMember: async (teamId, userId) => {
        const team = await Team.findById(teamId);
        if (team) {
            team.members = team.members.filter(member => member.toString() !== userId.toString());
            await team.save();
            return await team.populate('members', 'username');
        }
        return team;
    }
};

export default teamRepository;