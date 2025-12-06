import SeatType from "../models/SeatTypeEntity.js";

// Tạo loại ghế mới
const createSeatType = async (req, res) => {
  try {
    const { name, priceMultiplier, description, color } = req.body;

    if (!name || !priceMultiplier) {
      return res.status(400).json({
        success: false,
        message: "Tên và hệ số giá là bắt buộc",
      });
    }

    // Kiểm tra loại ghế đã tồn tại
    const existingSeatType = await SeatType.findOne({ name });
    if (existingSeatType) {
      return res.status(400).json({
        success: false,
        message: "Loại ghế đã tồn tại",
      });
    }

    const seatType = new SeatType({
      name,
      priceMultiplier: Number(priceMultiplier),
      description,
      color: color || "#3b82f6",
    });

    await seatType.save();

    res.status(201).json({
      success: true,
      message: "Tạo loại ghế thành công",
      seatType,
    });
  } catch (error) {
    console.error("Lỗi khi tạo loại ghế:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo loại ghế",
    });
  }
};

// Lấy danh sách loại ghế
const listSeatTypes = async (req, res) => {
  try {
    const seatTypes = await SeatType.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      seatTypes,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại ghế:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách loại ghế",
    });
  }
};

// Lấy chi tiết loại ghế
const getSeatTypeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const seatType = await SeatType.findById(id);

    if (!seatType) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy loại ghế",
      });
    }

    res.status(200).json({
      success: true,
      seatType,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết loại ghế:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết loại ghế",
    });
  }
};

// Cập nhật loại ghế
const updateSeatType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, priceMultiplier, description, color } = req.body;

    if (!name || !priceMultiplier) {
      return res.status(400).json({
        success: false,
        message: "Tên và hệ số giá là bắt buộc",
      });
    }

    // Kiểm tra trùng tên
    const existingSeatType = await SeatType.findOne({ name, _id: { $ne: id } });
    if (existingSeatType) {
      return res.status(400).json({
        success: false,
        message: "Tên loại ghế đã tồn tại",
      });
    }

    const seatType = await SeatType.findByIdAndUpdate(
      id,
      {
        name,
        priceMultiplier: Number(priceMultiplier),
        description,
        color,
      },
      { new: true, runValidators: true }
    );

    if (!seatType) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy loại ghế",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật loại ghế thành công",
      seatType,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật loại ghế:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật loại ghế",
    });
  }
};

// Xóa loại ghế
const deleteSeatType = async (req, res) => {
  try {
    const { id } = req.params;

    const seatType = await SeatType.findByIdAndDelete(id);

    if (!seatType) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy loại ghế",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa loại ghế thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa loại ghế:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa loại ghế",
    });
  }
};

export {
  createSeatType,
  listSeatTypes,
  getSeatTypeDetail,
  updateSeatType,
  deleteSeatType,
};
