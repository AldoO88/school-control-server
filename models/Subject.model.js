import { Schema, model } from 'mongoose'

const SubjectSchema = new Schema({
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      unique: true,
      trim: true,
    },
    description:{
      type: String,
      trim: true
    },
    grade:{
      type: String
    },
    hoursWeek:{
        type: Number
    },
    maxHoursDay:{
        type: Number
    }
  },
  {
    timestamps: true
  }
)

const Subject = model('Subject', SubjectSchema)

export default Subject;
