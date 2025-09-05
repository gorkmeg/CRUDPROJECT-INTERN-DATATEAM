const express = require("express");
const router = express.Router();
const User = require("../models/User"); 
const Comment = require("../models/Comment"); 
const Car = require("../models/Car");

router.get("/", async (req, res) => {
 try {
  const { userId } = req.query; 
  const user = await User.findById(userId);

  if (!user || !user.isAdmin) {
  return res.status(403).json({ message: "Bu işlem için admin yetkisi gereklidir" });
  }


  const comments = await Comment.find()
   .populate('carId', 'brand model')
   .populate('userId', 'username')
   .sort({ createdAt: -1 });
  res.json(comments);
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: "Yorumlar getirilemedi" });
 }
});

router.get("/:carId", async (req, res) => {
 try {
  const comments = await Comment.find({ carId: req.params.carId })
   .populate('userId', 'username')
   .sort({ createdAt: -1 });
  res.json(comments);
 } catch (err) {
  console.aerror(err);
  res.status(500).json({ message: "Yorumlar getirilemedi" });
 }
});

router.post("/", async (req, res) => {
 try {
  const { carId, userId, text } = req.body;
  if (!text || !carId || !userId) return res.status(400).json({ message: "Tüm alanlar gerekli" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

  const newComment = new Comment({ carId, userId, username: user.username, text });
  await newComment.save();

  res.status(201).json(newComment);
 } catch (err) {
  console.error(err);
  res.status(500).json({ message: "Yorum eklenemedi" });
 }
});

router.put("/:id", async (req, res) => {
 try {
  const { userId, text } = req.body;
  const comment = await Comment.findById(req.params.id);

  if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

  const user = await User.findById(userId);
  if (!user || (comment.userId.toString() !== userId && !user.isAdmin)) {
   return res.status(403).json({ message: "İzin yok" });
  }

  comment.text = text;
  await comment.save();

  res.json(comment);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

router.delete("/:id", async (req, res) => {
 try {
  const { userId } = req.query;
  const comment = await Comment.findById(req.params.id);

  if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });
  
  const user = await User.findById(userId);
  if (!user || (comment.userId.toString() !== userId && !user.isAdmin)) {
   return res.status(403).json({ message: "İzin yok" });
  }

  await comment.deleteOne();
  res.json({ message: "Silindi" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
});

router.get('/user/:userId', async (req, res) => {
 try {
   const comments = await Comment.find({ userId: req.params.userId })
    .populate('carId', 'brand model images')
    .sort({ createdAt: -1 });

   res.json(comments);
 } catch (err) {
   console.error("Yorumlar getirilirken hata oluştu:", err);
   res.status(500).json({ message: 'Yorumlar getirilirken hata oluştu.' });
 }
});

module.exports = router;