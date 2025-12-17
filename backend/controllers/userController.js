import Booking from "../models/BookingEntity.js";

export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth().userId;
    const { page = 1, limit = 10, movieId, roomId, paidStatus } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { user };

    // Build filter for show query
    const showFilter = {};
    if (movieId) showFilter.movie = movieId;
    if (roomId) showFilter.room = roomId;

    // Filter by paidStatus if provided
    if (paidStatus) {
      filter.paidStatus = parseInt(paidStatus);
    }

    // Find bookings with populated show data
    let bookings = await Booking.find(filter)
      .populate({
        path: "show",
        populate: [{ path: "movie" }, { path: "room" }],
      })
      .sort({ createdAt: -1 });

    // Filter by show's movie or room if specified
    if (movieId || roomId) {
      bookings = bookings.filter((booking) => {
        if (!booking.show) return false;
        if (movieId && booking.show.movie?._id.toString() !== movieId)
          return false;
        if (roomId && booking.show.room?._id.toString() !== roomId)
          return false;
        return true;
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
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
