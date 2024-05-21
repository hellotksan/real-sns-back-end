const router = require("express").Router();
const User = require("../models/User");

// CRUD操作
// ユーザ更新
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

// ユーザ削除
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted!");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

// ユーザ削除
// router.delete("/:id", async (req, res) => {
//   const userId = req.params.id;
//   const { userId: reqUserId, isAdmin } = req.body;

//   if (reqUserId === userId || isAdmin) {
//     try {
//       const user = await User.findByIdAndDelete(userId);
//       res.status(200).json("アカウントが削除されました！");
//     } catch (error) {
//       return res.status(500).json(error);
//     }
//   } else {
//     return res.status(403).json("自分のアカウントのみ削除できます！");
//   }
// });

// 全ユーザー情報を取得する
router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    const sanitizedUsers = users.map((user) => {
      const { password, updatedAt, ...other } = user._doc;
      return other;
    });
    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// ユーザ取得
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// クエリでユーザ情報を取得
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// ユーザのフォロー
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you already follow this user");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("you cant follow yourself");
  }
});

// ユーザのフォローを外す
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });
        res.status(200).json("user has been unfollowed!");
      } else {
        res.status(403).json("you already unfollow this user");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    return res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
