const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));   // 🔥 IMPORTANT
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GlowWell Backend is running 💗");
});

app.post("/api/journal", (req, res) => {
  console.log("Journal received 👉", req.body);

  res.json({
    success: true,
    data: req.body
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
