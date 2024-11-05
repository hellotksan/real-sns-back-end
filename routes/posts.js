const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 投稿順に投稿を取得するAPI
// 一度のフェッチで最大取得件数は10件
// router.get("/all", async (req, res) => {
//   const { page = 1 } = req.query;
//   const limit = 10;

//   try {
//     const posts = await Post.find()
//       .sort({ updatedAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     res.json(posts);
//   } catch (error) {
//     res.status(500).json({ message: "投稿を取得できませんでした。" });
//   }
// });

// 投稿順に投稿を取得するAPI
// 一度のフェッチで最大取得件数は10件
router.get("/all", async (req, res) => {
  const { cursor } = req.query;
  const limit = 20;

  try {
    const query = cursor ? { _id: { $lt: cursor } } : {};
    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // 新しい投稿から取得
      .limit(Number(limit));

    // 次のカーソルを設定
    const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

    res.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

// 指定されたIDの投稿を取得するAPI
// パラメーターからIDを取得する
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// 投稿を作成するAPI
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// 投稿を更新するAPI
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("User has update post!");
    } else {
      return res.status(403).json("User dont have access to update post!");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// 投稿を削除するAPI
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne({
        $set: req.body,
      });
      return res.status(200).json("User has delete post!");
    } else {
      return res.status(403).json("User dont have access to delete post!");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// 特定の投稿にいいねするAPI
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // まだ投稿にいいねが押されていなかった場合
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json("The Post Has Been Liked.");
    }
    // 投稿にすでにいいねが押されていた場合
    else {
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json("The Post Has Been Disliked.");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// プロフィール専用のタイムラインの取得するAPI
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// タイムラインの投稿を取得するAPI
router.get("/timeline/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { cursor } = req.query; // クエリからカーソルを取得

    // ユーザー情報の取得
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // フォローしているユーザーと自身のIDを含む配列を作成
    const userIds = [
      ...currentUser.followings.map((id) => id.toString()),
      userId,
    ];

    // カーソルの条件（カーソルがなければ最新の投稿から取得）
    const cursorCondition = cursor ? { _id: { $lt: cursor } } : {};

    // 自分とフォローしているユーザーの投稿を取得
    const posts = await Post.find({
      ...cursorCondition,
      userId: { $in: userIds },
    })
      .sort({ createdAt: -1 }) // 作成日時で降順ソート
      .limit(100);

    // 次のカーソル（取得した投稿の最後のID）を計算
    const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
