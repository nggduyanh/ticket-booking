import Room from "../models/RoomEntity.js";

// Tạo phòng chiếu mới
const createRoom = async (req, res) => {
  try {
    const { name, rows, seatsPerRow, seatLayout } = req.body;

    if (!name || !rows || !seatsPerRow || !seatLayout) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin phòng chiếu",
      });
    }

    // Kiểm tra phòng đã tồn tại
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Phòng chiếu đã tồn tại",
      });
    }

    const totalSeats = Object.keys(seatLayout).length;

    const room = new Room({
      name,
      totalSeats,
      rows: Number(rows),
      seatsPerRow: Number(seatsPerRow),
      seatLayout,
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: "Tạo phòng chiếu thành công",
      room,
    });
  } catch (error) {
    console.error("Lỗi khi tạo phòng chiếu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo phòng chiếu",
    });
  }
};

// Lấy danh sách phòng chiếu
const listRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, all, search } = req.query;

    const filter = {};

    // Search by name if provided
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Nếu có cờ 'all', trả về tất cả không phân trang
    if (all === "true") {
      const rooms = await Room.find(filter).sort({ name: 1 });
      return res.status(200).json({
        success: true,
        rooms,
      });
    }

    // Phân trang bình thường
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const rooms = await Room.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Room.countDocuments(filter);

    res.status(200).json({
      success: true,
      rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng chiếu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phòng chiếu",
    });
  }
};

// Lấy chi tiết phòng chiếu
const getRoomDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng chiếu",
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phòng chiếu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết phòng chiếu",
    });
  }
};

// Cập nhật phòng chiếu
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rows, seatsPerRow, seatLayout } = req.body;

    if (!name || !rows || !seatsPerRow || !seatLayout) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin phòng chiếu",
      });
    }

    // Kiểm tra trùng tên
    const existingRoom = await Room.findOne({ name, _id: { $ne: id } });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Tên phòng chiếu đã tồn tại",
      });
    }

    const totalSeats = Object.keys(seatLayout).length;

    const room = await Room.findByIdAndUpdate(
      id,
      {
        name,
        totalSeats,
        rows: Number(rows),
        seatsPerRow: Number(seatsPerRow),
        seatLayout,
      },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng chiếu",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật phòng chiếu thành công",
      room,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng chiếu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật phòng chiếu",
    });
  }
};

// Xóa phòng chiếu
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng chiếu",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa phòng chiếu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa phòng chiếu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa phòng chiếu",
    });
  }
};

export { createRoom, listRooms, getRoomDetail, updateRoom, deleteRoom };
