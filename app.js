require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose
  .connect(process.env.DBURI || "mongodb://127.0.0.1:27017/blog", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("listening on port " + process.env.PORT || 3000);
    });
  })
  .catch((error) => {
    console.log("Error while connecting to DB: ", error.message);
  });

/*
  --> Registering routes
*/
app.use("/auth", require("./routes/AuthRoutes"));

app.use("/user", require("./routes/UserRoutes"));

// Not found Urls
app.use("*", (req, res) => {
  res.status(404).json({ message: "Requested url is not found" });
});
