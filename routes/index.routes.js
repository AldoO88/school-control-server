const express = require("express");
const router = express.Router();
import subjectRouter from "./subjects.routes.js";

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.use("/subjects", subjectRouter);

module.exports = router;
