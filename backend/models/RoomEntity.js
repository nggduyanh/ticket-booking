import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true, unique: true }, // Phòng 1, Phòng VIP, Cinema Hall A
    totalSeats: { type: Number, required: true }, // Tổng số ghế
    rows: { type: Number, required: true }, // Số hàng (A, B, C...)
    seatsPerRow: { type: Number, required: true }, // Số ghế mỗi hàng
    seatLayout: { type: Object, required: true }, // { "A1": "seatTypeId", "A2": "seatTypeId", ... }
  },
  { minimize: false, timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
