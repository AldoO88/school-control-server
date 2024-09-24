const { Schema, model } =  require('mongoose');

const StudentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    lastname: {
      type: String,
      required: [true, 'Student lastname is required'],
      trim: true
    },
    grade: {
      type: String,
      required: [true, 'Student grade is required'],
      trim: true,
      enum: ['1RO', '2DO', '3RO']
    },
    group: {
      type: String,
      required: [true, 'Student group is required'],
      trim: true,
      enum: ['A', 'B', 'C', 'D']
    },
    /*email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    tutor:{
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    subjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject'
    }],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }*/
  },
  {
    timestamps: true 
  }
)

const Student = model('Student', StudentSchema)

module.exports = Student;