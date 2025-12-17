import Booking from "../models/BookingEntity.js";
import Show from "../models/ShowEntity.js";
import User from "../models/UserEntity.js";
import Movie from "../models/MovieEntity.js";

export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

export const getDashBoardData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      movieId,
      roomId,
      startDate,
      endDate,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({ paidStatus: 1 }).sort({
      createdAt: -1,
    });

    const filter = { showDateTime: { $gte: new Date() } };

    // Filter by movieId if provided
    if (movieId) {
      filter.movie = movieId;
    }

    // Filter by roomId if provided
    if (roomId) {
      filter.room = roomId;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.showDateTime = {};
      if (startDate) {
        filter.showDateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.showDateTime.$lte = endDateTime;
      }
    }

    const activeShows = await Show.find(filter)
      .populate("movie")
      .populate("room")
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
    const {
      page = 1,
      limit = 10,
      all,
      movieId,
      roomId,
      search,
      startDate,
      endDate,
    } = req.query;

    const filter = { showDateTime: { $gte: new Date() } };

    // Filter by movieId if provided
    if (movieId) {
      filter.movie = movieId;
    }

    // Filter by roomId if provided
    if (roomId) {
      filter.room = roomId;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.showDateTime = {};
      if (startDate) {
        filter.showDateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.showDateTime.$lte = endDateTime;
      }
    }

    // Nếu có cờ 'all', trả về tất cả không phân trang
    if (all === "true") {
      let shows = await Show.find(filter)
        .populate("movie")
        .populate("room")
        .sort({ createdAt: -1, updatedAt: -1 });

      // Search by movie title if provided
      if (search) {
        shows = shows.filter((show) =>
          show.movie.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      return res.status(200).json({
        success: true,
        shows,
      });
    }

    // Phân trang bình thường
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let shows = await Show.find(filter)
      .populate("movie")
      .populate("room")
      .sort({ createdAt: -1, updatedAt: -1 });

    // Search by movie title if provided
    if (search) {
      shows = shows.filter((show) =>
        show.movie.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = shows.length;
    shows = shows.slice(skip, skip + parseInt(limit));

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
    const { page = 1, limit = 10, all, search } = req.query;

    // Nếu có cờ 'all', trả về tất cả không phân trang
    if (all === "true") {
      let bookings = await Booking.find({})
        .populate("user")
        .populate({ path: "show", populate: { path: "movie" } })
        .sort({ createdAt: -1 });

      // Filter out invalid bookings (null user, show, or movie)
      bookings = bookings.filter(
        (booking) => booking.user && booking.show && booking.show.movie
      );

      // Search by user name or movie title
      if (search) {
        bookings = bookings.filter((booking) => {
          const userName = booking.user.name.toLowerCase();
          const movieTitle = booking.show.movie.title.toLowerCase();
          const searchLower = search.toLowerCase();
          return (
            userName.includes(searchLower) || movieTitle.includes(searchLower)
          );
        });
      }

      return res.status(200).json({
        success: true,
        bookings,
      });
    }

    // Phân trang bình thường
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let bookings = await Booking.find({})
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });

    // Filter out invalid bookings (null user, show, or movie)
    bookings = bookings.filter(
      (booking) => booking.user && booking.show && booking.show.movie
    );

    // Search by user name or movie title
    if (search) {
      bookings = bookings.filter((booking) => {
        const userName = booking.user.name.toLowerCase();
        const movieTitle = booking.show.movie.title.toLowerCase();
        const searchLower = search.toLowerCase();
        return (
          userName.includes(searchLower) || movieTitle.includes(searchLower)
        );
      });
    }

    const total = bookings.length;
    bookings = bookings.slice(skip, skip + parseInt(limit));

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
