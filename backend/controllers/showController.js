import { Types } from "mongoose";
import Movie from "../models/MovieEntity.js";
import Show from "../models/ShowEntity.js";

export const createShow = async (req, res) => {
  try {
    const { movieId, roomId, showInputs, showPrice } = req.body;

    if (!movieId) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim" });
    }

    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, message: "Phòng chiếu là bắt buộc" });
    }

    // Đảm bảo showPrice là số nguyên dương
    const priceInteger = Math.round(Number(showPrice) || 0);
    if (priceInteger <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giá vé phải là số nguyên dương" });
    }

    const movieIdObjectId = new Types.ObjectId(movieId);
    const movie = await Movie.findById(movieIdObjectId);

    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim" });
    }

    const shows = [];
    showInputs?.forEach((showInput) => {
      const showDate = showInput.date;
      showInput?.time?.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        shows.push({
          movie: movieId,
          room: roomId,
          showDateTime: new Date(dateTimeString),
          showPrice: priceInteger,
          occupiedSeats: {},
        });
      });
    });
    if (shows && shows.length > 0) {
      await Show.insertMany(shows);
    }
    res
      .status(201)
      .json({ success: true, message: "Tạo thành công giờ chiếu" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listShows = async (req, res) => {
  try {
    const { search, genreId, page = 1, limit = 10 } = req.query;

    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate({
        path: "movie",
        populate: { path: "genreId", model: "Genre" },
      })
      .sort({ createdAt: -1, updatedAt: -1 });

    // Lấy unique movies từ shows
    const uniqueMoviesMap = new Map();
    shows.forEach((show) => {
      if (show.movie && !uniqueMoviesMap.has(show.movie._id.toString())) {
        uniqueMoviesMap.set(show.movie._id.toString(), show.movie);
      }
    });

    let movies = Array.from(uniqueMoviesMap.values());

    // Filter by search term (title)
    if (search) {
      movies = movies.filter((movie) =>
        movie.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by genre
    if (genreId) {
      movies = movies.filter((movie) => movie.genreId === genreId);
    }

    // Apply pagination
    const total = movies.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMovies = movies.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      shows: paginatedMovies,
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

export const detailShow = async (req, res) => {
  try {
    const movieId = req?.params?.movieId;
    const { roomId } = req.query; // Thêm query param roomId

    const filter = {
      movie: movieId,
      showDateTime: { $gte: new Date() },
    };

    // Nếu có roomId thì filter thêm
    if (roomId) {
      filter.room = roomId;
    }

    const shows = await Show.find(filter).populate("room");
    const movieObjectId = new Types.ObjectId(movieId);
    const movie = await Movie.findById(movieObjectId).populate("genreId");
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phim" });
    }
    const dateTime = {};

    shows?.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      // Đếm số ghế đã bị chiếm (status = 1 hoặc 3)
      const occupiedCount = Object.values(show.occupiedSeats || {}).filter(
        (status) => status === 1 || status === 3
      ).length;

      dateTime[date].push({
        showId: show._id,
        time: show.showDateTime,
        showPrice: show.showPrice,
        room: show.room, // Thêm room info
        occupiedCount, // Số ghế đã chiếm
      });
    });
    res.status(200).json({ success: true, show: { movie, dateTime } });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleShow = async (req, res) => {
  try {
    const showId = req?.params?.showId;
    const show = await Show.findById(showId).populate("movie").populate("room");

    if (!show) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy suất chiếu" });
    }

    res.status(200).json({ success: true, show });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
