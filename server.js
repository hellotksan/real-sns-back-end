const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const uploadRoute = require("./routes/upload");
const PORT = 5000;
const mongoose = require("mongoose");
const path = require("path");
const cors = require('cors');
require("dotenv").config();

app.use(cors());

// データベース接続
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((error) => {
    console.log("DB Connection Failed", error);
  });

// ミドルウェア
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);

app.get("/", (req, res) => {
  res.send("Hello Express!!!");
});

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
