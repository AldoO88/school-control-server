const mongoose = require('mongoose');
const Answer = require('../models/Answer.model');
const User = require('../models/User.model');

const createAnswer = async (req, res, next) => {
  const { answers, result } = req.body;
  const { category, userId } = req.params;

  try {
    const responses = Object.keys(answers).map(questionNumber => ({
      questionNumber: parseInt(questionNumber),  // Convertimos el número de pregunta a un número entero
      selectedOption: answers[questionNumber].selectedOption,  // Extraemos la opción seleccionada
      selectedIndex: answers[questionNumber].selectedIndex,  // Extraemos el índice seleccionado
    }));

    const newAnswer = await Answer.create({ test: category, responses, result, userId });
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getAnsweredTest = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const testAnswered = await User.findById({ userId })
    .populate({
      path: 'answers'
    });
    console.log(testAnswered.test);
    res.status(200).json(testAnswered.test);
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
}
    

module.exports = { createAnswer, getAnsweredTest }; 
