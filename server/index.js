// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({ origin: "http://localhost:3000" })); // Allow requests from React dev server

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Sanitize user input
const sanitizeInput = (input) => {
  // Prevent prompt injection by escaping special characters
  return input.replace(/[\n\r"'\\<>&]/g, (char) => {
    switch (char) {
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case '"':
        return '\\"';
      case "'":
        return "\\'";
      case "\\":
        return "\\\\";
      case "<":
        return "\\<";
      case ">":
        return "\\>";
      case "&":
        return "\\&";
      default:
        return char;
    }
  });
};

// Safety settings (same as before)
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// Initialize model (with a valid model name)
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp", // Corrected model name
  safetySettings,
  tools: [
    {
      googleSearch: {},
    },
  ],
});

// Endpoint to handle streamed queries (initial response)
app.get("/api/stream", async (req, res) => {
  try {
    const rawQuery = req.query.query;
    const sanitizedQuery = sanitizeInput(rawQuery);

    const initialPrompt = `
      You are an AI conversational search assistant, like Perplexity. Your responses to user questions should be professional and well-structured. 
      Use markdown headers and bullet points to organize the content, making it easy to read and understand. 
      If the query involves a comparison, create a comparison table for clarity. 
      Incorporate numerical data to support your points, if applicable.
      Do not make the response unnecessarily large, only generate larger responses if asked, or required. 

      **Important: Respond only to the user query below. Do not include any other instructions or additional information.**

      User Query: ${sanitizedQuery}
    `;

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: initialPrompt }] }],
      generationConfig: {
        candidateCount: 1,
        maxOutputTokens: 4000,
      },
      safetySettings,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;

      // Send the text chunk immediately to the client
      res.write(
        `data: ${JSON.stringify({ type: "text", content: chunkText })}\n\n`
      );
    }

    // Extract grounding metadata (no change)
    const response = result.response;
    const groundingMetadata =
      response.candidates && response.candidates.length > 0
        ? response.candidates[0].groundingMetadata
        : null;

    const citationMetadata = groundingMetadata
      ? groundingMetadata.citationMetadata
      : null;

    const googleSearch =
      citationMetadata && citationMetadata.citationSources
        ? citationMetadata.citationSources
            .filter((source) => source.sourceCase === 2)
            .map((source) => ({
              googleSearchUrl: source.googleSearchResults.url,
              googleSearchTitle: source.googleSearchResults.title,
            }))
        : [];

    // Send metadata (no follow-up questions here)
    res.write(
      `data: ${JSON.stringify({
        type: "metadata",
        content: {
          groundingMetadata,
          citationMetadata,
          googleSearch,
        },
      })}\n\n`
    );

    // Store the full response in a temporary cache (you might want to use a more robust solution like Redis for production)
    // Assuming you have a simple in-memory cache for demonstration
    const cacheKey = `response:${req.query.query}`;
    cache.set(cacheKey, fullResponse);

    res.end();
  } catch (error) {
    console.error("Error streaming from Gemini API:", error);
    res.status(500).write(
      `data: ${JSON.stringify({
        type: "error",
        content: "Internal Server Error",
      })}\n\n`
    );
    res.end();
  }
});

// In-memory cache for demo purposes
const cache = new Map();

// Endpoint to generate follow-up questions
app.get("/api/followup", async (req, res) => {
  try {
    const originalQuery = req.query.originalQuery;
    const cacheKey = `response:${originalQuery}`;
    const cachedResponse = cache.get(cacheKey);

    if (!cachedResponse) {
      res.status(400).json({
        error: "Original response not found in cache.",
      });
      return;
    }

    const followUpPrompt = `
    Based on the following user query and the corresponding response, generate four relevant follow-up questions that users might be interested in.
    Format these questions as a numbered list using markdown, with each question on a new line.
    **Important: Only include the follow-up questions in your response. Do not include the original query, the response, or any other instructions or information.**

    User Query: ${originalQuery}

    Response:
    ${cachedResponse}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: followUpPrompt }] }],
      generationConfig: {
        candidateCount: 1,
        maxOutputTokens: 1000, // Adjust as needed
      },
      safetySettings,
    });

    const response = result.response;
    const followUpQuestionsText = response.text();

    const followUpRegex = /\n\d+\.\s(.*?)(?=\n\d+\.|$)/gs;
    const followUpMatches = [
      ...followUpQuestionsText.matchAll(followUpRegex),
    ];
    const followUpQuestions = followUpMatches.map((match) =>
      match[1].trim()
    );

    res.json({ followUpQuestions });
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});