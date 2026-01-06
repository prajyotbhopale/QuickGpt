import express from "express";
import { createChat, deleteChat, getChat } from "../controllers/chatControllers.js";
import { protect } from "../middlewares/auth.js";

const chatRouter = express.Router();

chatRouter.post('/create', protect, createChat)
chatRouter.get('/get',protect, getChat)
chatRouter.delete('/:id', protect, deleteChat);


export default chatRouter