import express from "express";
import { updateBooking } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/update-booking", updateBooking);

export default paymentRouter;
