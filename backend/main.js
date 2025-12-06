import express from "express";
import cors from "cors";

import "dotenv/config.js";
import connectDB from "./db.js";

import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import movieRouter from "./routes/movieRoutes.js";
import showRouter from "./routes/showRoutes.js";
import genreRouter from "./routes/genreRoutes.js";
import seatTypeRouter from "./routes/seatTypeRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import { protectAdmin } from "./middleware/auth.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

await connectDB();
app.get("/", (req, res) => {
  res.send("Server is live!");
});
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/movies", movieRouter);
app.use("/api/shows", showRouter);
app.use("/api/genres", genreRouter);
app.use("/api/seat-types", seatTypeRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/payment", paymentRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
