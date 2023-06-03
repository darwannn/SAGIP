const mongoose = require("mongoose");
mongoose.pluralize(null);

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notifications: [
      {
        title: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        dateSent: {
          type: Date,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
