import axios from "axios";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function callGemini(prompt) {
  console.log("➡️ callGemini() called");
  console.log("Prompt received:", prompt);

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

  console.log("🟢 Raw Gemini API response:", response.data);

  const text =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  console.log("🟢 Extracted text:", text);

  return text;
}
