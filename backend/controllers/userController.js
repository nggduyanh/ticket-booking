import Booking from "../models/BookingEntity.js";

export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth().userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({ user })
      .populate({
        path: "show",
        populate: [{ path: "movie" }, { path: "room" }],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({ user });

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
