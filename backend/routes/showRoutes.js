import express from "express";
import { createShow, listShows } from "../controllers/showController.js";

const showRouter = express.Router();

showRouter.post("/create", createShow);
showRouter.get("/list", listShows);

export default showRouter;
