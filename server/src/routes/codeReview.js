const express = require("express");
const router = express.Router();
const controller = require('../controller/codeReviewController.js')

router.post("/review", controller.getReview)

module.exports = router;