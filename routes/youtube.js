// routes/youtube.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

router.get("/", async (req, res) => {
  const { career } = req.query;
  if (!career) return res.status(400).json({ error: "Career is required" });

  try {
    const searchQuery = `${career} career skills tutorial`;
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: YOUTUBE_API_KEY,
        part: "snippet",
        q: searchQuery,
        type: "video",
        maxResults: 5
      }
    });

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      description: item.snippet.description,
      videoId: item.id.videoId,
      channelTitle: item.snippet.channelTitle
    }));

    res.json(videos);
  } catch (err) {
    console.error("YouTube API error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
