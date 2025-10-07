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
    console.log('🔍 Buscando estudiantes...');
    // Obtener los estudiantes del grupo especificado
    const currentYear = 2025;
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`); // Inicio del año en UTC
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`); 

    // Filtrar estudiantes registrados en el año actual
    const students = await Student.find({
      grade,
      group,
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    }).select("_id name lastname grade group createdAt");
    students.forEach(student => { 
      console.log("👤 Estudiante encontrado:", student.name, student.lastname, "Registrado el:", student.createdAt);
    });

    // Obtener los IDs de los estudiantes
    const studentIds = students.map(student => student._id);
    console.log('👥 IDs de estudiantes:', studentIds);

// Obtener las respuestas de los estudiantes filtradas por categoría y registradas este año
const answers = await Answer.find({
  userId: { $in: studentIds },
  test: category,
  createdAt: { $gte: startOfYear, $lte: endOfYear }, // Filtrar respuestas de este año
}).select("userId result createdAt");

    console.log('📋 Respuestas encontradas:', answers.length);
    console.log('📋 Respuestas:', answers);
    answers.forEach(answer => {
      console.log("📋 Fecha de respuesta:", answer.createdAt);
    });

    // Mapear los resultados con los estudiantes
    const result = students.map(student => {
      const answer = answers.find(ans => ans.userId.toString() === student._id.toString());
      return {
        name: student.name,
        lastname: student.lastname,
        grade: student.grade,
        group: student.group,
        result: answer ? answer.result : "Sin resultado",
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
