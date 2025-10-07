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

const getStudentsByGroupAndCategory = async (req, res) => {
  console.log('=== INICIO getStudentsByGroupAndCategory ===');
  
  // Verificar si req.body existe
  console.log('req.body es:', typeof req.body, req.body);
  console.log('req.query es:', typeof req.query, req.query);
  
  // Extraer directamente desde req.body (POST) o req.query (GET)
  const body = req.body || {};
  const query = req.query || {};
  const { grade, group, category } = { ...body, ...query };

  console.log('req.body:', req.body);
  console.log('req.query:', req.query);
  console.log('grade:', grade);
  console.log('group:', group);
  console.log('category:', category); 

  // Validar que los parámetros requeridos estén presentes
  if (!grade || !group || !category) {
    console.log('❌ Parámetros faltantes');
    return res.status(400).json({ 
      message: "Faltan parámetros requeridos", 
      required: ["grade", "group", "category"],
      received: { grade, group, category }
    });
  }

  console.log('✅ Parámetros validados correctamente');

  try {
    const currentYear = new Date().getFullYear();

// 1. Filtrar a los estudiantes registrados en el año actual
//    Asumo que el modelo 'student' tiene un campo como 'createdAt' o 'registrationDate'
const studentsThisYear = students.filter(student => {
  // Asegúrate de que el campo de fecha exista antes de intentar leerlo
  const registrationDate = student.createdAt || student.registrationDate;
  return registrationDate && new Date(registrationDate).getFullYear() === currentYear;
});

// 2. Filtrar las respuestas que fueron creadas en el año actual
const answersThisYear = answers.filter(ans => {
  return ans.createdAt && new Date(ans.createdAt).getFullYear() === currentYear;
});

// 3. Ahora, mapea sobre los estudiantes de este año y busca sus respuestas de este año
const result = studentsThisYear.map(student => {
  // Filtrar las respuestas asociadas al estudiante (ya están filtradas por año)
  const studentAnswers = answersThisYear.filter(ans => ans.userId.toString() === student._id.toString());

  // Encontrar la respuesta más reciente de este año
  const latestAnswer = studentAnswers.length > 0
    ? studentAnswers.reduce((latest, current) => {
        // No es necesario crear nuevos objetos Date en cada comparación si ya sabes que son válidos
        return new Date(latest.createdAt) > new Date(current.createdAt) ? latest : current;
      })
    : null;

  return {
    name: student.name,
    lastname: student.lastname,
    grade: student.grade,
    group: student.group,
    // Si no hay respuesta este año, se mostrará "Sin resultado"
    result: latestAnswer ? latestAnswer.result : "Sin resultado",
  };
});
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener estudiantes por grupo y categoría:", error);
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

module.exports = { createAnswer, getAnsweredTest, getTotalTest, getStudentsByGroupAndCategory };
