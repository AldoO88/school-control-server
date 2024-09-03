const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    test:{
      type: String,
      required: true,
    },
    responses: [
      {
        questionNumber: {
          type: Number,
          required: true,
        },
        selectedOption: {
          type: String, 
          required: true,
        },
        selectedIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    result:{
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateCompleted: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
