import { Types } from "mongoose";
import Movie from "../models/MovieEntity.js";

export const createMovie = async (req, res) => {
  try {
    const { title, image, description, runtime } = req.body;
    await Movie.create({ title, image, description, runtime });

    res
      .status(201)
      .json({ success: true, message: "Movie created successfully" });
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
        .json({ success: false, message: "Movie not found" });
    }
    const { title, image, description, runtime } = req.body;
    await Movie.updateOne(
      { _id: objectId },
      { $set: { title, image, description, runtime } }
    );

    res
      .status(200)
      .json({ success: true, message: "Movie updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listMovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const detailMovie = async (req, res) => {
  try {
    const id = req.params?.id;
    const objectId = new Types.ObjectId(id);
    const movie = await Movie.findById(objectId);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    res.status(200).json({ success: true, data: movie });
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
        .json({ success: false, message: "Movie not found" });
    }
    await Movie.deleteOne({ _id: objectId });
    res
      .status(200)
      .json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
