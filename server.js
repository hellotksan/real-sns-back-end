const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const PORT = 5000;
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// CORS設定を信頼できるオリジンに限定
const corsOptions = {
  origin: ["https://nextsns-one.vercel.app", "http://localhost:3000"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// データベース接続
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((error) => {
    console.log(error);
  });

// ミドルウェア
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
