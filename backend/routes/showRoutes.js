import express from "express";
import {
  createShow,
  detailShow,
  listShows,
  getSingleShow,
} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.post("/create", protectAdmin, createShow);
showRouter.get("/list", listShows);
showRouter.get("/detail/:showId", getSingleShow);
showRouter.get("/:movieId", detailShow);

export default showRouter;
