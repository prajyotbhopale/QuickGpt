import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"
import { callGemini } from "../configs/gemini.js";



export const textMessageController = async (req, res) => {
  try {
    const { prompt } = req.body;


    // ✅ Proper validation
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // ✅ Call Gemini (returns STRING)
    const aiText = await callGemini(prompt);

    // ✅ Convert STRING → MESSAGE OBJECT
    const reply = {
      role: "assistant",
      content: aiText,
      timestamp: Date.now(),
      isImage: false,
    };

    // ✅ Send correct shape
    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Gemini AI error",
    });
  }
};

//Image Generation Message Controller

export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        //check credits
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use theis feature" })
        }
        const { prompt, chatId, isPublished } = req.body

        //find chat
        const chat = await Chat.findOne({ userId, _id: chatId })

        //Push user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        //Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        //construct ImageKit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        //Trigger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })

        //Convert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

        //Upload to ImageKit Media Library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        })

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }

        res.json({ success: true, reply })

        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}