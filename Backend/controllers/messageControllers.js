import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"
// import openai from '../configs/openai.js'
// import { geminiModel } from "../configs/gemini.js";

//Text-based AI chat Messages Controller

// ✅ Gemini REST endpoint (STABLE)
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent";



// ===============================
// TEXT MESSAGE CONTROLLER
// ===============================
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    // 1️⃣ Credit check
    if (req.user.credits < 1) {
      return res.status(403).json({
        success: false,
        message: "You don't have enough credits",
      });
    }

    // 2️⃣ Prompt validation
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // 3️⃣ Chat ownership check
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // 4️⃣ Save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // 5️⃣ 🔥 GEMINI REST API CALL (WORKING)
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error("No response from Gemini");
    }

    // 6️⃣ Save AI reply
    const reply = {
      role: "assistant",
      content: aiText,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();

    // 7️⃣ Deduct credit
    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    );

    // 8️⃣ Send response
    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(
      "TEXT MESSAGE ERROR (GEMINI):",
      error.response?.data || error.message
    );

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