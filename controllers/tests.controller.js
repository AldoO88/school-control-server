const mongoose = require("mongoose");
const Test = require("../models/Test.model");
const Student = require("../models/Student.model");

const createTest = async (req, res, next) => {
  const { answers, result } = req.body;
  const { category, studentId } = req.params;

  try {
    const responses = Object.keys(answers).map((questionNumber) => ({
      questionNumber: parseInt(questionNumber), // Convertimos el número de pregunta a un número entero
      selectedOption: answers[questionNumber].selectedOption, // Extraemos la opción seleccionada
      selectedIndex: answers[questionNumber].selectedIndex, // Extraemos el índice seleccionado
    }));
    const newTest = await Test.create({
      test: category,
      responses,
      result,
      studentId,
    });
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnsweredTest = async (req, res, next) => {
  const { studentId } = req.params;
  console.log(studentId);
  try {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({ message: "wrong id" });
      return;
    }
    const testAnswered = await Test.find({ studentId: studentId });

    if(!testAnswered){
      res.status(404).json({ message: "No se encontraron respuestas para el usuario" });
      return;
    }

    console.log(testAnswered);
    res.status(200).json(testAnswered);
  } catch (error) {
    console.log("Error al obtener respuestas para el usuario", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

module.exports = { createTest, getAnsweredTest };