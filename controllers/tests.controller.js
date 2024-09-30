const mongoose = require("mongoose");
const Answer = require("../models/Answer.model");
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
  const { userId } = req.params;
  
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "wrong id entrando al endpoint incorrecto" });
      console.log("Estamos entrando al getAnswerdTest por id de estudiante, marca el error: wrong id");
      return;
    }
    const testAnswered = await Answer.find({ userId: userId });

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

const getTotalTest = async (req, res, next) => {
 
  try {
    console.log("Obteniendo estadísticas generales...");
    // Obtenemos los estudiantes agrupados por grado y grupo
    const studentsByGroup = await Student.aggregate([
      {
        $group: {
          _id: { grade: "$grade", group: "$group" }, // Agrupamos por grado y grupo
          students: { $push: "$_id" }, // Guardamos los IDs de los estudiantes
        },
      },
    ]);

    // Inicializamos el resultado final
    const result = [];

    // Iteramos sobre cada grupo de estudiantes
    for (let group of studentsByGroup) {
      const { grade, group: groupName } = group._id;

      // Obtenemos todas las respuestas de los estudiantes del grupo actual
      const answers = await Answer.find({ userId: { $in: group.students } });

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

      // Iteramos sobre las respuestas para clasificar los estilos de aprendizaje
      answers.forEach((answer) => {
        answer.responses.forEach((response) => {
          // Clasificación de los estilos de aprendizaje según la respuesta
          if (response.result === 'AUDITIVO') styles.auditory++;
          if (response.result === 'VISUAL') styles.visual++;
          if (response.result === 'KIENESTÉSICO') styles.kinesthetic++;
          if (response.result === 'MIXTO') styles.kinesthetic++;
          if (response.result === 'ACTIVO') styles.active++;
          if (response.result === 'REFLEXIVO') styles.reflexive++;
          if (response.result === 'TEÓRICO') styles.theoretical++;
          if (response.result === 'PRAGMÁTICO') styles.pragmatic++;
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

    // Mostramos el resultado final
    res.status(200).json(result);
  } catch (error) {
    console.error("Error obteniendo las estadísticas:", error);
  }
};

module.exports = { createTest, getAnsweredTest, getTotalTest };