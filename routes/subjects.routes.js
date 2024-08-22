const Router = require('express');

import { 
  getAllSubjects, 
  getSubjectById, 
  createSubject, 
  updateSubject, 
  deleteSubject } from "../controllers/subjects.controller.js";

const router = Router();

router.get('/', getAllSubjects);
router.post('/', createSubject);

router.get('/:idSubject', getSubjectById)
router.put('/:idSubject', updateSubject)
router.delete('/:idSubject', deleteSubject)

module.exports = router;