import mongoose from "mongoose";
const connectDB = async () => {
  try {
    mongoose.connection.once("connected", () => {
      console.log("MongoDB connected");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/ticketBooking`);
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDB;
