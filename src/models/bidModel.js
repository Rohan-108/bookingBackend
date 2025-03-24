import { Schema, model } from "mongoose";

const MIN_BID_AMOUNT = 0;
const MAX_BID_AMOUNT = 1000000;

//User schema (embedding the document)
const userSchema = {
  _id: {
    type: Schema.Types.ObjectId,
    index: true,
    required: [true, "Owner id is required"],
  },
  username: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  tel: {
    type: String,
    required: [true, "Tel is required"],
  },
  adhaar: {
    type: String,
    required: [true, "Adhaar is required"],
  },
  avatar: {
    type: String,
    required: [true, "Avatar is required"],
  },
};

//Vehicle model
const vehicleSchema = {
  _id: {
    type: Schema.Types.ObjectId,
    index: true,
    required: [true, "Car id is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  plateNumber: {
    type: String,
    required: [true, "Plate number is required"],
  },
  rentalPrice: {
    type: Number,
    required: [true, "Rental price is required"],
  },
  seats: {
    type: Number,
    required: [true, "Number of seats is required"],
  },
  rentalPriceOutStation: {
    type: Number,
    required: [true, "Rental price for outstation is required"],
  },
  ratePerKm: {
    type: Number,
    required: [true, "Rate per km is required"],
  },
  fixedKilometer: {
    type: Number,
    required: [true, "Fixed kilometer is required"],
  },
  owner: {
    type: userSchema,
    required: [true, "Owner is required"],
  },
};
const bidSchema = new Schema(
  {
    amount: {
      type: Number,
      min: [MIN_BID_AMOUNT, "Amount must be greater than 0"],
      max: [MAX_BID_AMOUNT, `Amount must be less than ${MAX_BID_AMOUNT}`],
      required: [true, "Amount is required"],
    },
    startDate: {
      type: Date, // "YYYY-MM-DD"
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date, // "YYYY-MM-DD"
      validate: {
        validator: function (v) {
          return new Date(v) > new Date(this.startDate);
        },
        message: "End date must be greater than start date",
      },
      required: [true, "End date is required"],
    },
    isOutStation: {
      type: Boolean,
      required: [true, "Is outstation is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    tripCompleted: {
      type: Boolean,
      default: false,
    },
    user: {
      type: userSchema,
      required: [true, "User is required"],
    },
    vehicle: {
      type: vehicleSchema,
      required: [true, "Car is required"],
    },
  },
  { timestamps: true }
);

const Bid = model("Bid", bidSchema);

export default Bid;
