import express from 'express';
import { createServer } from 'http';

import {connectToDatabase} from "./configs/db";

const app = express();
const httpServer = createServer(app);

connectToDatabase();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});