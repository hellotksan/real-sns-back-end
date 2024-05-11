const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 投稿を作成
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// 投稿を更新する
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

// 投稿を削除する
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

// 投稿を取得する
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// 特定の投稿にいいねする
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
      return res.status(200).json("The post has been liked!");
    }
    // 投稿にすでにいいねが押されていた場合
    else {
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json("The post has been disliked!");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// プロフィール専用のタイムラインの取得
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// タイムラインの投稿を取得
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    // 自分がフォローしている友達の投稿内容をすべて取得する
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
