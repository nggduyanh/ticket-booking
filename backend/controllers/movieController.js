import { Types } from "mongoose";
import Movie from "../models/MovieEntity.js";
import cloudinary from "../config/cloudinary.js";

export const createMovie = async (req, res) => {
  try {
    const { title, description, runtime, genreId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng tải lên ảnh phim",
      });
    }

    // Upload ảnh lên Cloudinary từ buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "movies",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const movie = await Movie.create({
      title,
      image: uploadResult.secure_url, // Lưu URL từ Cloudinary
      description,
      runtime: Number(runtime),
      genreId: genreId || null,
    });

    res
      .status(201)
      .json({ success: true, movie, message: "Tạo thành công phim" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const id = req.params?.id;
    const objectId = new Types.ObjectId(id);
    const movie = await Movie.findById(objectId);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim" });
    }

    const { title, description, runtime, genreId } = req.body;
    const updateData = {
      title,
      description,
      runtime: Number(runtime),
      genreId: genreId || null,
    };

    // Nếu có file mới được upload, upload lên Cloudinary
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "movies",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      updateData.image = uploadResult.secure_url;
    }

    await Movie.updateOne({ _id: objectId }, { $set: updateData });

    res
      .status(200)
      .json({ success: true, message: "Cập nhật phim thành công" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listMovies = async (req, res) => {
  try {
    const { search, genreId, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query filter
    const filter = {};

    // Search by title
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // Filter by genre
    if (genreId) {
      filter.genreId = genreId;
    }

    const movies = await Movie.find(filter)
      .populate("genreId", "name")
      .sort({ createdAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(filter);

    res.status(200).json({
      success: true,
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const detailMovie = async (req, res) => {
  try {
    const id = req.params?.id;
    const objectId = new Types.ObjectId(id);
    const movie = await Movie.findById(objectId).populate("genreId");
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim" });
    }
    res.status(200).json({ success: true, movie });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const id = req.params?.id;
    const objectId = new Types.ObjectId(id);
    const movie = await Movie.findById(objectId);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim" });
    }
    await Movie.deleteOne({ _id: objectId });
    res.status(200).json({ success: true, message: "Xóa phim thành công" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
