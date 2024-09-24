const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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

const Test = mongoose.model("Test", answerSchema);

module.exports = Test;