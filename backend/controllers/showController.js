import { Types } from "mongoose";
import Movie from "../models/MovieEntity.js";
import Show from "../models/ShowEntity.js";

export const createShow = async (req, res) => {
  try {
    const { movieId, showInputs, showPrice } = req.body;

    if (!movieId) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    const movieIdObjectId = new Types.ObjectId(movieId);
    const movie = await Movie.findById(movieIdObjectId);

    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    const shows = [];
    showInputs?.forEach((showInput) => {
      const showDate = showInput.date;
      showInput?.time?.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        shows.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });
    if (shows && shows.length > 0) {
      await Show.insertMany(shows);
    }
    res
      .status(201)
      .json({ success: true, message: "Shows created successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listShows = async (req, res) => {
  try {
    const shows = await Show.find().populate("movie");

    res.status(200).json({ success: true, data: shows });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
