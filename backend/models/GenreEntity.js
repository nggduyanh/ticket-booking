import mongoose from "mongoose";

const genreSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

const Genre = mongoose.model("Genre", genreSchema);
export default Genre;
