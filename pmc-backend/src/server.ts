import express from "express";
import cors from "cors";
import config from "../config.json";
import bodyParser from "body-parser";

const app = express();
const port = config.general.port;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});