const Post = require("../models/Post");

// Get all posts (public - no auth required)
exports.getAllPosts = async (req, res) => {
  try {
    console.log("=== GET ALL POSTS ===");
    console.log("Session user:", req.session.userId || "Public user");

    const posts = await Post.find().sort({ createdAt: -1 });
    console.log(`Found ${posts.length} posts`);

    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
};

// Get single post (public - no auth required)
exports.getPostById = async (req, res) => {
  try {
    console.log("=== GET POST BY ID ===");
    console.log("Post ID:", req.params.id);
    console.log("Session user:", req.session.userId || "Public user");

    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("Post found:", post.title);
    res.json(post);
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    res.status(500).json({ message: "Server error fetching post" });
  }
};

// Create new post (REQUIRES AUTH)
exports.createPost = async (req, res) => {
  console.log("=== CREATE POST ATTEMPT ===");
  console.log("Session user ID:", req.session.userId);
  console.log("Session username:", req.session.username);
  console.log("Request body:", req.body);

  // Check authentication FIRST
  if (!req.session.userId) {
    console.log("❌ Unauthorized - No user ID in session");
    console.log("Full session:", req.session);
    return res.status(401).json({
      message: "You are not authorized. Please login.",
      requiresLogin: true,
    });
  }

  const { title, author, excerpt, content, imageUrl } = req.body;

  if (!title || !excerpt || !content) {
    console.log("❌ Missing required fields");
    return res.status(400).json({
      message:
        "Please fill in all the required fields: title, excerpt, content",
    });
  }

  try {
    console.log("Creating post with author:", author || req.session.username);

    const newPost = new Post({
      title,
      author: author || req.session.username, // Use session username if not provided
      excerpt,
      content,
      imageUrl: imageUrl || "",
      createdAt: new Date(),
      createdBy: req.session.userId, // Track who created the post
    });

    const savedPost = await newPost.save();

    console.log("✅ Post created successfully:", savedPost._id);
    console.log("Post title:", savedPost.title);

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({
      message: "Server error creating post",
      error: error.message,
    });
  }
};

// Delete post (REQUIRES AUTH)
exports.deletePost = async (req, res) => {
  console.log("=== DELETE POST ATTEMPT ===");
  console.log("Post ID to delete:", req.params.id);
  console.log("Session user ID:", req.session.userId);
  console.log("Session username:", req.session.username);

  // Check authentication FIRST
  if (!req.session.userId) {
    console.log("❌ Unauthorized - No user ID in session");
    return res.status(401).json({
      message: "You are not authorized. Please login.",
      requiresLogin: true,
    });
  }

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log("❌ Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    console.log("✅ Post deleted successfully:", req.params.id);
    console.log("Deleted post title:", deletedPost.title);

    res.json({
      message: "Post deleted successfully",
      postId: req.params.id,
    });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({
      message: "Server error deleting post",
      error: error.message,
    });
  }
};

// Update post (REQUIRES AUTH) - Optional but useful
exports.updatePost = async (req, res) => {
  console.log("=== UPDATE POST ATTEMPT ===");
  console.log("Post ID:", req.params.id);
  console.log("Session user ID:", req.session.userId);

  if (!req.session.userId) {
    console.log("❌ Unauthorized - No user ID in session");
    return res
      .status(401)
      .json({ message: "You are not authorized. Please login." });
  }

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (
      post.createdBy &&
      post.createdBy.toString() !== req.session.userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to update this post",
      });
    }

    const { title, author, excerpt, content, imageUrl } = req.body;

    // Update only provided fields
    if (title) post.title = title;
    if (author) post.author = author;
    if (excerpt) post.excerpt = excerpt;
    if (content) post.content = content;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;

    post.updatedAt = new Date();

    const updatedPost = await post.save();

    console.log("✅ Post updated successfully:", updatedPost._id);
    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("❌ Error updating post:", error);
    res.status(500).json({ message: "Server error updating post" });
  }
};
