import mongoose from "mongoose";

const seatTypeSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true, unique: true }, // VIP, Standard, Couple
    priceMultiplier: { type: Number, required: true, default: 1.0 }, // 1.0 = giá gốc, 1.5 = +50%, 2.0 = +100%
    description: { type: String, required: false },
    color: { type: String, required: false, default: "#3b82f6" }, // Màu hiển thị trên UI
  },
  { timestamps: true }
);

const SeatType = mongoose.model("SeatType", seatTypeSchema);
export default SeatType;
