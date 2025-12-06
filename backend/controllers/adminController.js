import Booking from "../models/BookingEntity.js";
import Show from "../models/ShowEntity.js";
import User from "../models/UserEntity.js";
import Movie from "../models/MovieEntity.js";

export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

export const getDashBoardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ paidStatus: 1 });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const dashboardData = {
      totalBookings: bookings.length,
      totalEarnings: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUsers,
      totalMovies,
    };

    res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.status(200).json({ success: true, shows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
