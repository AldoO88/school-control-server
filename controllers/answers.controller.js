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
  try {
    const { grade, group, category } = req.query;

    // Validar parámetros requeridos
    if (!grade || !group || !category) {
      return res.status(400).json({ message: "Faltan parámetros requeridos (grade, group, category)." });
    }

    console.log("✅ Parámetros validados correctamente");

    // Definir el rango de fechas para el año actual
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    console.log("📅 Inicio del año:", startOfYear);
    console.log("📅 Fin del año:", endOfYear);

    // Obtener los estudiantes del grupo especificado
    const students = await Student.find({
      grade,
      group,
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    }).select("_id name lastname grade group createdAt")

    console.log("👥 Estudiantes encontrados:", students.length);

    const sortedStudents = students.sort((a, b) => {
      const lastnameA = a.lastname.trim().toLowerCase();
      const lastnameB = b.lastname.trim().toLowerCase();
      return lastnameA.localeCompare(lastnameB);
    });

    // Obtener los IDs de los estudiantes
    const studentIds = students.map(student => student._id);

    // Obtener las respuestas de los estudiantes filtradas por categoría y registradas este año
    const answers = await Answer.find({
      userId: { $in: studentIds },
      test: category,
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    }).select("userId result createdAt");

    console.log("📋 Respuestas encontradas:", answers.length);

    // Filtrar estudiantes que tienen respuestas relacionadas
    const studentsWithAnswers = students.filter(student =>
      answers.some(answer => answer.userId.toString() === student._id.toString())
    );

    console.log("👥 Estudiantes con respuestas:", studentsWithAnswers.length);

    // Mapear los resultados con los estudiantes
    const result = studentsWithAnswers.map(student => {
      // Filtrar todas las respuestas asociadas al estudiante
      const studentAnswers = answers.filter(ans => ans.userId.toString() === student._id.toString());

      // Si hay respuestas, seleccionar la más reciente
      const latestAnswer = studentAnswers.length > 0
        ? studentAnswers.reduce((latest, current) => {
            return new Date(latest.createdAt) > new Date(current.createdAt) ? latest : current;
          })
        : null;

      // Manejar el campo result
      let parsedResult;
      if (latestAnswer) {
        try {
          // Intentar parsear como JSON
          parsedResult = JSON.parse(latestAnswer.result);
        } catch (error) {
          // Si no es JSON, usar el valor directamente
          parsedResult = { score: "", interpretation:  latestAnswer.result };
        }
      } else {
        parsedResult = { score: "", interpretation: "Sin resultado" };
      }

      return {
        name: student.name.toUpperCase(),
        lastname: student.lastname.toUpperCase(),
        grade: student.grade,
        group: student.group,
        score: parsedResult.score,
        interpretation: (() => {
          // Depurar el valor original
          console.log("Interpretation original:", parsedResult.interpretation);
      
          // Normalizar y eliminar acentos
          const normalizedInterpretation = parsedResult.interpretation
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
      
          // Depurar el valor normalizado
          console.log("Interpretation normalizada:", normalizedInterpretation);
      
          // Comparar y corregir
          if (normalizedInterpretation === "KIENESTESICO") {
            console.log("Interpretation corregida: KINESTÉSICO");
            return "KINESTÉSICO";
          }
      
          // Si no coincide, devolver el valor original en mayúsculas
          console.log("Interpretation final:", parsedResult.interpretation.toUpperCase());
          return parsedResult.interpretation.toUpperCase();
        })(),
    };
    });
    console.log("Resultados finales:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error al obtener estudiantes con respuestas:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

const getStudentsByGrade = async (req, res) => {
  try {
    const { grade } = req.query;

    if (!grade) {
      return res.status(400).json({ message: "Falta el parámetro requerido: grade." });
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const students = await Student.find({
      grade,
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    }).select("_id name lastname grade group createdAt");

    const studentIds = students.map(student => student._id);

    const answers = await Answer.find({
      userId: { $in: studentIds },
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    }).select("userId test result createdAt");

    const categories = [
      "Beck1", "Beck", "Lynn", "Peter",
      "ofimatica-1RO", "ofimatica-2DO", "ofimatica-3RO",
    ];

    // Agrupar estudiantes duplicados por nombre + apellido + grado + grupo
    const mergedMap = new Map();

    students.forEach(student => {
      const key = `${student.name.trim().toLowerCase()}|${student.lastname.trim().toLowerCase()}|${student.grade}|${student.group}`;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, {
          name: student.name.trim().toUpperCase(),
          lastname: student.lastname.trim().toUpperCase(),
          grade: student.grade,
          group: student.group,
          ids: [student._id.toString()],
        });
      } else {
        mergedMap.get(key).ids.push(student._id.toString());
      }
    });

    const mergedStudents = Array.from(mergedMap.values());

    // Ordenar por grupo y apellido
    mergedStudents.sort((a, b) => {
      const groupCmp = a.group.localeCompare(b.group);
      if (groupCmp !== 0) return groupCmp;
      return a.lastname.localeCompare(b.lastname);
    });

    const result = mergedStudents.map(student => {
      // Recoger respuestas de TODOS los IDs duplicados de este estudiante
      const studentAnswers = answers.filter(
        ans => student.ids.includes(ans.userId.toString())
      );

      const categoryResults = {};
      categories.forEach(cat => {
        const catAnswers = studentAnswers.filter(a => a.test === cat);
        if (catAnswers.length === 0) {
          categoryResults[cat] = { score: "", interpretation: "Sin resultado" };
          return;
        }
        const latest = catAnswers.reduce((l, c) =>
          new Date(l.createdAt) > new Date(c.createdAt) ? l : c
        );
        let parsed;
        try {
          parsed = JSON.parse(latest.result);
        } catch {
          parsed = { score: "", interpretation: latest.result };
        }
        categoryResults[cat] = {
          score: parsed.score || "",
          interpretation: (parsed.interpretation || latest.result || "").toUpperCase(),
        };
      });

      return {
        name: student.name,
        lastname: student.lastname,
        grade: student.grade,
        group: student.group,
        ...categoryResults,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener estudiantes por grado:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

module.exports = { createAnswer, getAnsweredTest, getTotalTest, getStudentsByGroupAndCategory, getStudentsByGrade };
