import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import paintingController from '../controllers/painting.controller';

// Import Middleware
import {authMiddleware}  from '../middleware/auth.middleware';

const AdminRouter = express.Router();

AdminRouter.post('/painting', paintingController.createPainting);

export default AdminRouter;