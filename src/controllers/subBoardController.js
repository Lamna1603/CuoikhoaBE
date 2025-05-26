// controllers/subBoardController.js
import subBoardService from '../services/subBoardService.js';

// @desc    Update sub-board information
// @route   PATCH /api/subboards/:id
// @access  Private (Admin only)
const updateSubBoard = async (req, res, next) => {
  const subBoardId = req.params.id;
  const { name, background } = req.body;
  const updateData = { name, background };

  // Filter out undefined values
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  // Basic validation if no fields are provided for update
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, message: 'No update data provided.', data: {} });
  }

  try {
    const updatedSubBoard = await subBoardService.updateSubBoard(subBoardId, updateData);
    res.status(200).json({
      success: true,
      message: 'Sub-board updated successfully',
      data: updatedSubBoard,
    });
  } catch (error) {
    const statusCode = error.message.includes('SubBoard not found') || error.message.includes('already exists') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
      data: {}
    });
  }
};

// @desc    Delete a sub-board
// @route   DELETE /api/subboards/:id
// @access  Private (Admin only)
const deleteSubBoard = async (req, res, next) => {
  const subBoardId = req.params.id;

  try {
    const deletedSubBoard = await subBoardService.deleteSubBoard(subBoardId);
    res.status(200).json({
      success: true,
      message: 'Sub-board deleted successfully',
      data: deletedSubBoard,
    });
  } catch (error) {
    const statusCode = error.message.includes('SubBoard not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
      data: {}
    });
  }
};

// @desc    Upload background image for a sub-board
// @route   POST /api/subboards/:id/upload-bg
// @access  Yes (All authenticated users - "Member" có thể upload)
const uploadSubBoardBackground = async (req, res, next) => {
    const subBoardId = req.params.id;
    // For simplicity, let's assume `req.body.imageUrl` contains the URL
    // In a real application, you'd use a file upload middleware (like multer)
    // and then save the file to a cloud storage (e.g., Cloudinary, S3)
    // and store the returned URL in the database.
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'Image URL is required.', data: {} });
    }

    try {
        const updatedSubBoard = await subBoardService.updateSubBoard(subBoardId, { background: imageUrl });
        res.status(200).json({
            success: true,
            message: 'Sub-board background uploaded successfully',
            data: updatedSubBoard,
        });
    } catch (error) {
        const statusCode = error.message.includes('SubBoard not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            data: {}
        });
    }
};

export {
  updateSubBoard,
  deleteSubBoard,
  uploadSubBoardBackground,
};