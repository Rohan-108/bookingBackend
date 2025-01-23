import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    releaseDate: {
      type: Date,
      required: [true, "Release Date is required"],
    },
    details: {
      type: String, //imdb url or any other url
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
