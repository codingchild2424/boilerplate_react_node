import express from "express";
import mongoose from "./db";
const app = express();
const port = 3500;

app.get('/', (req, res) => res.send("Hello!"));

app.listen(port, () => console.log(`listening on port ${port} 🐳`));