import express from "express";
import { createChat, deleteChat, getChat } from "../controllers/chatControllers.js";
import { protect } from "../middlewares/auth.js";

const chatRouter = express.Router();

chatRouter.get('/create', protect, createChat)
chatRouter.get('/get',protect, getChat)
chatRouter.post('/delete',protect, deleteChat)

export default chatRouter