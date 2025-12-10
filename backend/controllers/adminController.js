import Booking from "../models/BookingEntity.js";
import Show from "../models/ShowEntity.js";
import User from "../models/UserEntity.js";
import Movie from "../models/MovieEntity.js";

export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

export const getDashBoardData = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({ paidStatus: 1 }).sort({
      createdAt: -1,
    });

    const filter = { showDateTime: { $gte: new Date() } };
    const activeShows = await Show.find(filter)
      .populate("movie")
      .sort({ createdAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActiveShows = await Show.countDocuments(filter);
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalEarnings: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUsers,
      totalMovies,
      totalActiveShows,
    };

    res.status(200).json({
      success: true,
      dashboardData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalActiveShows,
        totalPages: Math.ceil(totalActiveShows / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllShows = async (req, res) => {
  try {
    const { page = 1, limit = 10, all, movieId } = req.query;

    const filter = { showDateTime: { $gte: new Date() } };

    // Filter by movieId if provided
    if (movieId) {
      filter.movie = movieId;
    }

    // Nếu có cờ 'all', trả về tất cả không phân trang
    if (all === "true") {
      const shows = await Show.find(filter)
        .populate("movie")
        .sort({ createdAt: -1, updatedAt: -1 });

      return res.status(200).json({
        success: true,
        shows,
      });
    }

    // Phân trang bình thường
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const shows = await Show.find(filter)
      .populate("movie")
      .sort({ createdAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Show.countDocuments(filter);

    res.status(200).json({
      success: true,
      shows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, all } = req.query;

    // Nếu có cờ 'all', trả về tất cả không phân trang
    if (all === "true") {
      const bookings = await Booking.find({})
        .populate("user")
        .populate({ path: "show", populate: { path: "movie" } })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        bookings,
      });
    }

    // Phân trang bình thường
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find({})
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({});

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//     res.status(200).json({ success: true, bookings });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
