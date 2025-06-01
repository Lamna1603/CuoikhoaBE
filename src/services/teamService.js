// services/teamService.js
import teamRepository from "../repositories/teamRepository.js";
import userRepository from "../repositories/userRepository.js";

const teamService = {
  createTeam: async (name, description, adminId) => {
    const existingTeam = await teamRepository.findByName(name);
    if (existingTeam) {
      throw new Error("Team with this name already exists.");
    }
    const newTeam = await teamRepository.create({
      name,
      description,
      admin: adminId,
      members: [adminId],
    });
    // Cập nhật user admin để thêm team vào danh sách teams của họ
    await userRepository.addTeamToUser(adminId, newTeam._id);
    return newTeam;
  },
  getTeams: async (queryOptions) => {
    return await teamRepository.findAll(queryOptions);
  },
  getTeamById: async (id) => {
    const team = await teamRepository.findById(id);
    if (!team) {
      throw new Error("Team not found.");
    }
    return team;
  },
  updateTeam: async (teamId, updateData, userId) => {
    // userId để kiểm tra quyền
    console.log("--- Inside teamService.updateTeam ---");
    console.log("Team ID received in service:", teamId);
    console.log("User ID received in service:", userId);
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error("Team not found.");
    }

    console.log("Found Team Admin ID:", team.admin.toString()); // <-- THÊM DÒNG NÀY
    console.log("User ID attempting to update:", userId.toString()); // <-- THÊM DÒNG NÀY

    if (team.admin._id.toString() !== userId.toString()) {
      console.log(
        "Authorization failed: User ID does not match Team Admin ID."
      );

      throw new Error("Not authorized to update this team.");
    }

    console.log(
      "Authorization passed: User is Team Admin. Proceeding with update."
    );

    const updatedTeam = await teamRepository.update(teamId, updateData);
    return updatedTeam;
  },
  deleteTeam: async (teamId, userId) => {
    // userId để kiểm tra quyền
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error("Team not found.");
    }
    // Chỉ admin của team mới được xóa
    if (team.admin.toString() !== userId.toString()) {
      throw new Error("Not authorized to delete this team.");
    }
    await teamRepository.delete(teamId);
    // Có thể cần logic xóa teamId khỏi tất cả user members và các task liên quan
  },
  addMemberToTeam: async (teamId, memberId, adminId) => {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found.");
    if (team.admin.toString() !== adminId.toString())
      throw new Error("Not authorized to add member to this team.");

    const member = await userRepository.findById(memberId);
    if (!member) throw new Error("Member user not found.");

    // Kiểm tra xem thành viên đã có trong team chưa
    if (team.members.includes(memberId)) {
      throw new Error("User is already a member of this team.");
    }
    const updatedTeam = await teamRepository.addMember(teamId, memberId);
    await userRepository.addTeamToUser(memberId, teamId); // Thêm team vào user
    return updatedTeam;
  },
  removeMemberFromTeam: async (teamId, memberId, adminId) => {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found.");
    if (team.admin.toString() !== adminId.toString())
      throw new Error("Not authorized to remove member from this team.");

    // Không cho phép xóa admin khỏi thành viên
    if (team.admin.toString() === memberId.toString()) {
      throw new Error("Cannot remove team admin from members.");
    }

    const updatedTeam = await teamRepository.removeMember(teamId, memberId);
    await userRepository.removeTeamFromUser(memberId, teamId); // Xóa team khỏi user
    return updatedTeam;
  },
};

export default teamService;
