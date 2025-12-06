import express from "express";
import {
  createGenre,
  listGenres,
  getGenreDetail,
  updateGenre,
  deleteGenre,
} from "../controllers/genreController.js";

const genreRouter = express.Router();

genreRouter.post("/create", createGenre);
genreRouter.get("/list", listGenres);
genreRouter.get("/:id", getGenreDetail);
genreRouter.put("/:id", updateGenre);
genreRouter.delete("/:id", deleteGenre);

export default genreRouter;
