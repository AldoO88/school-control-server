const express = require("express");
const router = express.Router();
const { isAuthenticated } = require('../middleware/jwt.middleware');
const subjectRouter = require("./subjects.routes.js");
const answerRouter = require("./answers.routes.js");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.use("/subjects", isAuthenticated, subjectRouter);
router.use("/tests", isAuthenticated, answerRouter)

module.exports = router;
