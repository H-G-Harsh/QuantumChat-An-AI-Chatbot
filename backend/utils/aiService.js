import axios from "axios";

export const callAIModel = async (prompt) => {
  try {
    const response = await axios.post(
      process.env.AI_API_URL, // Replace with your AI API endpoint
      {
        prompt,
        max_tokens: 1000, // Adjust based on your needs
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`, // API key from environment variables
        },
      }
    );

    return response.data.choices[0].text.trim(); // Adjust parsing based on API response structure
  } catch (error) {
    console.error("Error calling AI model:", error);
    throw new Error("AI model invocation failed.");
  }
};
