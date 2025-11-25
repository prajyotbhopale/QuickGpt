

//Api controller for creating a new chat

import Chat from "../models/Chat.js"

export const createChat = async (req, res) =>{
    try{
        const userId = req.user._id

        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json({success:true, message:"chat created"})
    }catch (error){
        res.json({success:false, message:error.message})
    }
}


//Api Controller for getting all chats
export const getChat = async (req, res) =>{
    try{
        const userId = req.user._id
        // const chats = (await Chat.find({userId})).sort({ updatedAt: -1})
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

        res.json({success: true, chats})
        

    }catch (error){
        res.json({success:false, message:error.message})
    }
}

//Api controller for deleting chat
export const deleteChat = async (req, res) =>{
    try{
        const userId = req.user._id
        const {chatId} = req.body

        await Chat.deleteOne({_id: chatId, userId})

        res.json({success: true, message:"Chat Deleted"})
        

    }catch (error){
        res.json({success:false, message:error.message})
    }
}