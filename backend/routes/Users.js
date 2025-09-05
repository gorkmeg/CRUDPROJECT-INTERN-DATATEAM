const express = require("express");
const router = express.Router();
const User = require("../models/User");


router.put("/:userId", async (req, res) => {
  try {
    const { username, isAdmin } = req.body;
    const { userId } = req.params;

    if (!username && isAdmin === undefined) {
      return res.status(400).json({ message: "En az bir alan değiştirilmeli" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (username) user.username = username;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();
    res.json({ message: "Kullanıcı bilgileri güncellendi", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Güncelleme hatası" });
  }
});

router.put('/change-password/:userId', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ message: 'Mevcut şifre yanlış.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Şifre başarıyla değiştirildi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});


router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Kullanıcı alınamadı" });
  }
});



module.exports = router;