const express = require("express");
const router = express.Router();
import { isAuthenticated } from "../middleware/jwt.middleware.js";
import subjectRouter from "./subjects.routes.js";

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.use("/subjects", isAuthenticated, subjectRouter);

module.exports = router;
