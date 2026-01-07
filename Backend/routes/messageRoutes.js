import express from 'express';
import { imageMessageController, textMessageController } from '../controllers/messageControllers.js';
import { protect } from '../middlewares/auth.js';


const messageRouter = express.Router()

messageRouter.post('/text', textMessageController)
messageRouter.post('/image', protect, imageMessageController)

export default messageRouter;