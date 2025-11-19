import express from "express";
import {
  createMovie,
  deleteMovie,
  detailMovie,
  listMovies,
  updateMovie,
} from "../controllers/movieController.js";

const movieRouter = express.Router();

movieRouter.post("/create", createMovie);
movieRouter.put("/:id", updateMovie);
movieRouter.get("/list", listMovies);
movieRouter.get("/:id", detailMovie);
movieRouter.delete("/:id", deleteMovie);

export default movieRouter;
