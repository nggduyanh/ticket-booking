import { Types } from "mongoose";
import Booking from "../models/BookingEntity.js";
import CryptoJS from "crypto-js";
import moment from "moment";
import qs from "qs";
import axios from "axios";
import Show from "../models/ShowEntity.js";

export const createPayment = async (bookingEntity, show, selectedSeats) => {
  try {
    console.log("CreatePayment call");
    const { _id: bookingId, amount, user: userId } = bookingEntity;
    const { occupiedSeats } = show;

    const transID = bookingId;
    const embed_data = {
      preferred_payment_method: [],
      redirecturl: process.env.CLIENT_DOMAIN + "/bookings",
      bookingId: bookingId,
      showId: show._id,
      selectedSeats: selectedSeats,
    };

    const booking = {
      app_id: Number(process.env.APP_ID),
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: userId,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify([occupiedSeats]),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: `Payment for the ticket #${transID}`,
      bank_code: "",
      callback_url: process.env.API_URL + "/api/payment/update-booking",
    };
    console.log("booking", booking);
    const data =
      Number(process.env.APP_ID) +
      "|" +
      booking.app_trans_id +
      "|" +
      booking.app_user +
      "|" +
      booking.amount +
      "|" +
      booking.app_time +
      "|" +
      booking.embed_data +
      "|" +
      booking.item;

    booking.mac = CryptoJS.HmacSHA256(data, process.env.KEY_1).toString();

    const result = await axios.post(
      process.env.END_POINT_CREATE_PAYMENT,
      null,
      {
        params: booking,
      }
    );
    if (result?.data?.return_code === 1) {
      console.log("First updateBookingInternal call");
      updateBookingInternal(booking.app_trans_id, transID, show, selectedSeats);
    }

    return result.data;
    // ,order:{app_trans_id:order.app_trans_id,app_time:order.app_time,orderInfo:embed_data.orderInfo}
  } catch (error) {
    console.log(error);
  }
};

export const updateBooking = async (req, res) => {
  const results = {};
  try {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    const mac = CryptoJS.HmacSHA256(dataStr, process.env.KEY_2).toString();
    if (reqMac == mac) {
      results.return_code = 1;
      results.return_message = "success";
      const { bookingId, showId, selectedSeats } = JSON.parse(
        JSON.parse(dataStr).embed_data
      );
      const bookingIdObjectId = new Types.ObjectId(bookingId);
      const showIdObjectId = new Types.ObjectId(showId);

      const show = await Show.findById(showIdObjectId);

      selectedSeats.forEach((seat) => {
        show.occupiedSeats[seat] = 1;
      });
      const booking = await Booking.findById(bookingIdObjectId);
      console.log("--------booking", booking);

      show.markModified("occupiedSeats");
      await show.save();
      await Booking.updateOne(
        { _id: bookingIdObjectId },
        { $set: { paidStatus: 1 } }
      );

      console.log("mac success");
    } else {
      results.return_code = -1;
      results.return_message = "invalid callback";
      console.log("mac invalid");
    }
  } catch (error) {
    results.return_code = 0;
    results.return_message = error.message;
    console.log(error);
  }
  return res.json(results);
};

const updateBookingInternal = async (
  app_trans_id,
  bookingId,
  show,
  selectedSeats
) => {
  console.log("updateBookingInternal call");
  try {
    const reqData = {
      app_id: Number(process.env.APP_ID),
      app_trans_id: app_trans_id,
    };

    const data =
      reqData.app_id + "|" + reqData.app_trans_id + "|" + process.env.KEY_1;
    reqData.mac = CryptoJS.HmacSHA256(data, process.env.KEY_1).toString();

    const reqConfig = {
      method: "post",
      url: process.env.END_POINT_PAYMENT_STATUS,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(reqData),
    };

    await new Promise((resovle) =>
      setTimeout(
        resovle,
        process.env.RECALL_UPDATE_BOOKING_STATUS_INTERNAL_TIME || 60000
      )
    );
    const paymentStatusResult = await axios(reqConfig);

    const returnCode = paymentStatusResult.data.return_code;
    if (returnCode === 3) {
      console.log(bookingId + ": return code = 3");
      await updateBookingInternal(app_trans_id, bookingId, show, selectedSeats);
    } else if (returnCode === 1) {
      selectedSeats.forEach((seat) => {
        show.occupiedSeats[seat] = 1;
      });
      show.markModified("occupiedSeats");
      await show.save();
      await Booking.updateOne({ _id: bookingId }, { $set: { paidStatus: 1 } });
      console.log(bookingId + ": return code = 1");
    } else {
      selectedSeats.forEach((seat) => {
        show.occupiedSeats[seat] = 2;
      });
      console.log("------second show,", show);

      show.markModified("occupiedSeats");
      await show.save();
      await Booking.updateOne({ _id: bookingId }, { $set: { paidStatus: 2 } });
      console.log(bookingId + ": return code = 2 ");
    }
  } catch (error) {
    console.log(error);
  }
};
