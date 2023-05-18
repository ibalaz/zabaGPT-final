const express = require("express");
const app = express();
const cors = require('cors'); 

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

//Routes
var codeReviewRoute = require("./src/routes/codeReview");
app.use("/api/codeReview", codeReviewRoute);

app.listen(3001, () => {
    console.log("Server is running...");
  });