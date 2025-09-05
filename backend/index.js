const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./models/User");
const seedDatabase = require('./seed');
const carRoutes = require('./routes/Cars');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB bağlı");
    seedDatabase(); 
  })
  .catch(err => console.error("MongoDB bağlantı hatası:", err));


app.get("/", (req, res) => {
  res.send("Backend çalışıyor");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username ve password gerekli" });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Kullanıcı zaten mevcut" });

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "Kayıt başarılı!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username ve password gerekli" });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı" });
    }

    const userResponse = {
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin
    };

    res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

const commentRoutes = require("./routes/Comments"); 
app.use("/comments", commentRoutes);

const userRoutes = require("./routes/Users");
app.use("/users", userRoutes);

app.use('/cars', carRoutes);

app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
