const mongoose = require('mongoose');
const Subject =  require('../models/Subject.model');

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const createSubject = async (req, res) => {
  const { name, description, grade, hoursWeek, maxHoursDay } = req.body;
  try {
    const newSubject = await Subject.create({ name, description, grade, hoursWeek, maxHoursDay });
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getSubjectById = async (req, res) => {
  const { idSubject } = req.params;
  try {
    if(!mongoose.Types.ObjectId.isValid(idSubject)) return res.status(404).json({ message: `No subject with id: ${idSubject}` });

    const subject = await Subject.findById(idSubject)
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const updateSubject = async (req, res) => {
  const { idSubject } = req.params;
  try {
    if(!mongoose.Types.ObjectId.isValid(idSubject)) return res.status(404).json({ message: `No subject with id: ${idSubject}` });

    const updatedSubject = await Subject.findByIdAndUpdate(idSubject, req.body, { new: true });
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const deleteSubject = async (req, res) => {
  const { idSubject } = req.params;
  try {
    if(!mongoose.Types.ObjectId.isValid(idSubject)) return res.status(404).json({ message: `No subject with id: ${idSubject}` });
    const deletedSubject = await Subject.findByIdAndRemove(idSubject);
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports ={ 
  getAllSubjects, 
  createSubject, 
  getSubjectById, 
  updateSubject, 
  deleteSubject 
};