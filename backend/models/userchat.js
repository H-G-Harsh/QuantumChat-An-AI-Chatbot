import mongoose from "mongoose";

const userChatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    chats: [
      {
        _id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          required: true, // ensure it's always provided when creating
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.userchat || mongoose.model("userchat", userChatsSchema);
