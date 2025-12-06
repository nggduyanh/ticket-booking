import express from "express";
import {
  createMovie,
  deleteMovie,
  detailMovie,
  listMovies,
  updateMovie,
} from "../controllers/movieController.js";
import upload from "../middleware/upload.js";

const movieRouter = express.Router();

movieRouter.post("/create", upload.single("image"), createMovie);
movieRouter.put("/:id", upload.single("image"), updateMovie);
movieRouter.get("/list", listMovies);
movieRouter.get("/:id", detailMovie);
movieRouter.delete("/:id", deleteMovie);

export default movieRouter;
