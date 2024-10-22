const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ユーザ登録
router.post("/register", async (req, res) => {
  try {
    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword, // ハッシュ化したパスワードを保存
    });

    const user = await newUser.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// ログイン
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("ユーザーが見つかりません");
    }

    // ハッシュ化されたパスワードの比較
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json("パスワードが違います");
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
