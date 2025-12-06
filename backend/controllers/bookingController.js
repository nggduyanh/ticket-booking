import { Types } from "mongoose";
import Show from "../models/ShowEntity.js";
import Room from "../models/RoomEntity.js";
import SeatType from "../models/SeatTypeEntity.js";
import Booking from "../models/BookingEntity.js";
import { createPayment } from "./paymentController.js";

const checkIsSeatAvailable = async (showId, selectedSeats) => {
  const showObjectId = new Types.ObjectId(showId);
  const show = await Show.findById(showObjectId);
  if (!show) {
    return false;
  }
  const occupiedSeats = show?.occupiedSeats || {};
  console.log("-------selectedSeats", selectedSeats);
  console.log("------occupiedSeats", occupiedSeats);

  const isSeatTaken = selectedSeats?.some(
    (selectedSeat) =>
      occupiedSeats[selectedSeat] === 1 || occupiedSeats[selectedSeat] === 3
  );
  console.log("---------isSeatTaken", isSeatTaken);

  return !isSeatTaken;
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;

    const isSeatAvailable = await checkIsSeatAvailable(showId, selectedSeats);

    if (!isSeatAvailable) {
      return res.json({
        success: false,
        message: "Một hoặc nhiều ghế đã được đặt trước đó",
      });
    }

    const show = await Show.findById(new Types.ObjectId(showId))
      .populate("movie")
      .populate("room");

    if (!show || !show.room) {
      return res.json({
        success: false,
        message: "Không tìm thấy thông tin suất chiếu hoặc phòng chiếu",
      });
    }

    // Tính tổng tiền dựa trên loại ghế
    let totalAmount = 0;
    const room = show.room;
    const seatLayout = room.seatLayout || {};

    // Lấy thông tin tất cả seat types một lần
    const seatTypeIds = [...new Set(Object.values(seatLayout))];
    const seatTypes = await SeatType.find({ _id: { $in: seatTypeIds } });
    const seatTypeMap = {};
    seatTypes.forEach((st) => {
      seatTypeMap[st._id.toString()] = st;
    });

    for (const seat of selectedSeats) {
      const seatTypeId = seatLayout[seat];
      if (seatTypeId) {
        const seatType = seatTypeMap[seatTypeId.toString()];
        const priceMultiplier = seatType ? seatType.priceMultiplier : 1.0;
        // Làm tròn giá vé cho từng ghế thành số nguyên
        totalAmount += Math.round(show.showPrice * priceMultiplier);
      } else {
        // Nếu không có seatType, dùng giá gốc
        totalAmount += show.showPrice;
      }
    }

    // Đảm bảo tổng tiền là số nguyên
    totalAmount = Math.round(totalAmount);

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: totalAmount,
      bookedSeats: selectedSeats,
    });

    selectedSeats.forEach((seat) => {
      show.occupiedSeats[seat] = 3;
    });
    show.markModified("occupiedSeats");
    await show.save();
    console.log("------first show,", show);

    const paymentResult = await createPayment(booking, show, selectedSeats);
    console.log("-----paymentResult", paymentResult);

    if (paymentResult && paymentResult.return_code === 1) {
      booking.paymentLink = paymentResult.order_url;
      await booking.save();
    } else {
      await Booking.deleteOne({ _id: booking._id });

      selectedSeats.forEach((seat) => {
        show.occupiedSeats[seat] = 2;
      });
      show.markModified("occupiedSeats");
      await show.save();

      console.log("Tạo giao dịch thanh toán thất bại");
      return res.json({
        success: false,
        message: "Tạo giao dịch thanh toán thất bại",
      });
    }

    res
      .status(201)
      .json({ success: true, paymentResult, message: "Đặt vé thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const showId = req?.params?.showId;

    const showObjectId = new Types.ObjectId(showId);
    const show = await Show.findById(showObjectId);
    if (!show) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy suất chiếu" });
    }

    const occupiedSeats = Object.entries(show?.occupiedSeats || {})
      .filter(([key, value]) => value === 1 || value === 3)
      .map(([key]) => key);

    res.status(200).json({ success: true, occupiedSeats: occupiedSeats || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
