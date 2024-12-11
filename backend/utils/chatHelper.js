import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Specify the model
});

export const generateChatResponse = async (query) => {
  const prompt = `You are a helpful assistant. Based on the following user query, provide a relevant response and generate five distinct follow-up questions that the user could ask next:

User Query: "${query}"
only give the followup questions. not anything else. do not give numberings. just give line by line. also preserve the idea of the query. to make the thrid person know what are they talking about if they dont now the question like name of the person or thing pr what are thry refering too
Response and Follow-up Questions (at least five, clearly numbered):
1. 
2. 
3. 
4. 
5. 

`;

  try {
    // Generate response and follow-up questions using the Gemini API
    const result = await model.generateContent(prompt);
    
    // The result.response.text() contains the AI's response and follow-up questions
    const response = result.response.text();

    // Extract follow-up questions from the response (parsing logic)
    const followUpQuestions = extractFollowUpQuestions(response);

    // Return both the primary response and the follow-up questions
    return {
      primary_response: response,
      follow_up_questions: followUpQuestions
    };
  } catch (err) {
    console.error('Error in generateChatResponse:', err);
    throw new Error('Failed to generate AI response');
  }
};

// Helper function to extract follow-up questions from the AI's response
const extractFollowUpQuestions = (response) => {
  // Split the response by lines or a delimiter to get the follow-up questions
  // Assuming the AI's response is well-structured and follows the format:
  // 1. Question 1
  // 2. Question 2
  // ...
  
  const followUpQuestions = [];
  const lines = response.split('\n');

  // Extract the first 5 lines that represent follow-up questions
  for (let i = 0; i < 10; i++) {
    if (lines[i]) {
      followUpQuestions.push(lines[i].trim());
    }
  }

  // If there are not enough questions, return a default set
  while (followUpQuestions.length < 5) {
    followUpQuestions.push(`Could you explain more about the topic?`);
  }

  return followUpQuestions;
};
