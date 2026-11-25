
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

app.get("/", (req, res) => {
    res.send("Welcome to CodeNest Online Compiler!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`CodeNest server running on port ${PORT}`);
});
