import express from "express";
import {
  createSeatType,
  listSeatTypes,
  getSeatTypeDetail,
  updateSeatType,
  deleteSeatType,
} from "../controllers/seatTypeController.js";

const seatTypeRouter = express.Router();

seatTypeRouter.post("/create", createSeatType);
seatTypeRouter.get("/list", listSeatTypes);
seatTypeRouter.get("/:id", getSeatTypeDetail);
seatTypeRouter.put("/:id", updateSeatType);
seatTypeRouter.delete("/:id", deleteSeatType);

export default seatTypeRouter;
