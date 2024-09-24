const mongoose = require("mongoose");
const Student = require("../models/Student.model");

const createStudent = async (req, res, next) => {
  const { name, lastname, grade, group } = req.body;
  try {
    const newStudent = await Student.create({
      name,
      lastname,
      grade,
      group,
    });

    if(name === '' || lastname === '' || grade === '' || group === ''){
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createStudent };