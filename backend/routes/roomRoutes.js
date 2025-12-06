import express from "express";
import {
  createRoom,
  listRooms,
  getRoomDetail,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.post("/create", createRoom);
roomRouter.get("/list", listRooms);
roomRouter.get("/:id", getRoomDetail);
roomRouter.put("/:id", updateRoom);
roomRouter.delete("/:id", deleteRoom);

export default roomRouter;
