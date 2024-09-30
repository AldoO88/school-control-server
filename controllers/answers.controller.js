const mongoose = require("mongoose");
const Answer = require("../models/Answer.model");
const User = require("../models/User.model");
const Student = require("../models/Student.model");

const createAnswer = async (req, res, next) => {
  const { answers, result } = req.body;
  const { category, userId } = req.params;

  try {
    const responses = Object.keys(answers).map((questionNumber) => ({
      questionNumber: parseInt(questionNumber), // Convertimos el número de pregunta a un número entero
      selectedOption: answers[questionNumber].selectedOption, // Extraemos la opción seleccionada
      selectedIndex: answers[questionNumber].selectedIndex, // Extraemos el índice seleccionado
    }));
    const newAnswer = await Answer.create({
      test: category,
      responses,
      result,
      userId,
    });
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnsweredTest = async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "wrong id" });
      return;
    }
    const testAnswered = await Answer.find({ userId: userId });

    console.log(testAnswered);
    res.status(200).json(testAnswered);
  } catch (error) {
    console.log("Error al obtener respuestas para el usuario", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

const getTotalTest = async (req, res, next) => {
  try {
    console.log("Obteniendo estadísticas generales...");

    // Obtener los estudiantes agrupados por grado y grupo
    const studentsByGroup = await Student.aggregate([
      {
        $group: {
          _id: { grade: "$grade", group: "$group" }, // Agrupamos por grado y grupo
          students: { $push: "$_id" }, // Guardamos los IDs de los estudiantes
        },
      },
    ]);

    // Obtener todas las respuestas de todos los estudiantes
    const studentIds = studentsByGroup.flatMap(group => group.students);
    const allAnswers = await Answer.find({ userId: { $in: studentIds } });

    // Inicializamos el resultado final
    const result = [];

    // Iteramos sobre cada grupo de estudiantes
    for (let group of studentsByGroup) {
      const { grade, group: groupName } = group._id;

      // Filtrar las respuestas que pertenecen a los estudiantes de este grupo
      const groupAnswers = allAnswers.filter(answer => 
        group.students.includes(answer.userId.toString())
      );

      // Inicializamos los estilos de aprendizaje del grupo
      const styles = {
        auditory: 0,
        visual: 0,
        kinesthetic: 0,
        active: 0,
        reflexive: 0,
        theoretical: 0,
        pragmatic: 0,
      };

      // Clasificación de estilos de aprendizaje según las respuestas
      groupAnswers.forEach((answer) => {
        answer.responses.forEach((response) => {
          if (response.selectedOption === 'AUDITIVO') styles.auditory++;
          if (response.selectedOption === 'VISUAL') styles.visual++;
          if (response.selectedOption === 'KIENESTESICO') styles.kinesthetic++;
          if (response.selectedOption === 'ACTIVO') styles.active++;
          if (response.selectedOption === 'REFLEXIVO') styles.reflexive++;
          if (response.selectedOption === 'TEORICO') styles.theoretical++;
          if (response.selectedOption === 'PRAGMATICO') styles.pragmatic++;
        });
      });

      // Guardamos el resultado del grupo actual en el array final
      result.push({
        grade,
        group: groupName,
        auditory: styles.auditory,
        visual: styles.visual,
        kinesthetic: styles.kinesthetic,
        active: styles.active,
        reflexive: styles.reflexive,
        theoretical: styles.theoretical,
        pragmatic: styles.pragmatic,
      });
    }

    // Enviamos el resultado final
    res.status(200).json(result);
  } catch (error) {
    console.error("Error obteniendo las estadísticas:", error);
    res.status(500).json({ message: "Error obteniendo las estadísticas", error });
  }
};

module.exports = { createAnswer, getAnsweredTest, getTotalTest };
