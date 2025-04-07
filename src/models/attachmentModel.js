import { Schema, model } from "mongoose";

const attachmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    refId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Attachment = model("Attachment", attachmentSchema);
export default Attachment;
