const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());

const port = 3000;

const text = fs.readFileSync("EDI.json");

const data = JSON.parse(text);

app.get("/", (req, res) => res.json(data));

app.listen(port);
