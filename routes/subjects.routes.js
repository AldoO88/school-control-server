const Router = require('express');

const { 
  getAllSubjects, 
  getSubjectById, 
  createSubject, 
  updateSubject, 
  deleteSubject } = require('../controllers/subjects.controller.js');

const router = Router();

router.get('/', getAllSubjects);
router.post('/', createSubject);

router.get('/:idSubject', getSubjectById)
router.put('/:idSubject', updateSubject)
router.delete('/:idSubject', deleteSubject)

module.exports = router;