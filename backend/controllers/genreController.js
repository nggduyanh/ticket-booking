import Genre from "../models/GenreEntity.js";

// Tạo thể loại phim mới
const createGenre = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên thể loại là bắt buộc",
      });
    }

    // Kiểm tra xem thể loại đã tồn tại chưa
    const existingGenre = await Genre.findOne({ name });
    if (existingGenre) {
      return res.status(400).json({
        success: false,
        message: "Thể loại phim đã tồn tại",
      });
    }

    const genre = new Genre({
      name,
      description,
    });

    await genre.save();

    res.status(201).json({
      success: true,
      message: "Tạo thể loại phim thành công",
      genre,
    });
  } catch (error) {
    console.error("Lỗi khi tạo thể loại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo thể loại phim",
    });
  }
};

// Lấy danh sách tất cả thể loại
const listGenres = async (req, res) => {
  try {
    const { page = 1, limit = 10, all } = req.query;

    // Nếu có cờ 'all', trả về tất cả không phân trang
    if (all === "true") {
      const genres = await Genre.find().sort({ name: 1 });
      return res.status(200).json({
        success: true,
        genres,
      });
    }

    // Phân trang bình thường
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const genres = await Genre.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Genre.countDocuments();

    res.status(200).json({
      success: true,
      genres,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thể loại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách thể loại",
    });
  }
};

// Lấy chi tiết một thể loại
const getGenreDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const genre = await Genre.findById(id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thể loại phim",
      });
    }

    res.status(200).json({
      success: true,
      genre,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết thể loại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết thể loại",
    });
  }
};

// Cập nhật thể loại
const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên thể loại là bắt buộc",
      });
    }

    // Kiểm tra xem tên mới có trùng với thể loại khác không
    const existingGenre = await Genre.findOne({ name, _id: { $ne: id } });
    if (existingGenre) {
      return res.status(400).json({
        success: false,
        message: "Tên thể loại đã tồn tại",
      });
    }

    const genre = await Genre.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thể loại phim",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thể loại phim thành công",
      genre,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thể loại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thể loại",
    });
  }
};

// Xóa thể loại
const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;

    const genre = await Genre.findByIdAndDelete(id);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thể loại phim",
      });
    }

    // Xóa tất cả phim có genreId này
    const Movie = (await import("../models/MovieEntity.js")).default;
    await Movie.deleteMany({ genreId: id });

    res.status(200).json({
      success: true,
      message: "Xóa thể loại phim và các phim liên quan thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa thể loại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa thể loại",
    });
  }
};

export { createGenre, listGenres, getGenreDetail, updateGenre, deleteGenre };
