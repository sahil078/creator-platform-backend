import { GoogleGenerativeAI } from "@google/generative-ai";
import Idea from "../models/Idea.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Structured fallbacks
const STRUCTURED_FALLBACKS = {
  "Technology": {
    reelIdea: "Demystifying AI in 60 Seconds",
    caption: "AI seems complex, but it's just math and data! Here's a quick breakdown 🤖 #TechExplained",
    hashtags: ["#AI", "#MachineLearning", "#TechTips", "#LearnToCode", "#DigitalTransformation"],
    hook: "You interact with AI 100+ times daily - here's how it works!"
  },
  // Add other niches as needed
};

export const generateIdea = async (req, res) => {
  const { topic, niche } = req.body;

  if (!topic || !niche) {
    return res.status(400).json({ 
      error: 'Both topic and niche are required' 
    });
  }

  try {
    // 1. Call Gemini API
    const prompt = `As a professional Instagram content strategist, generate JSON output for:
    - reelIdea: Creative concept about ${topic} for ${niche} niche (1 sentence)
    - caption: Engaging text (1-2 sentences with emojis)
    - hashtags: 5 relevant hashtags as array
    - hook: Scroll-stopping first line
    
    Output ONLY valid JSON in this exact structure:
    {
      "reelIdea": "...",
      "caption": "...",
      "hashtags": ["...", "...", "...", "...", "..."],
      "hook": "..."
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 2. Parse the response (Gemini sometimes adds markdown backticks)
    const cleanText = text.replace(/```json|```/g, '').trim();
    const content = JSON.parse(cleanText);

    // 3. Validate structure
    if (!content.reelIdea || !content.caption || !content.hashtags || !content.hook) {
      throw new Error('Invalid response structure from Gemini');
    }

    // 4. Save to database
    const idea = await Idea.create({
      topic,
      niche,
      ...content,
      createdBy: req.user.id,
      source: 'gemini'
    });

    return res.json(idea);

  } catch (err) {
    console.error('Gemini Error:', err.message);
    
    // Fallback logic
    const fallback = STRUCTURED_FALLBACKS[niche] || {
      reelIdea: `Quick ${topic} Tip`,
      caption: `This ${topic} insight will change your perspective! Try it and tag a friend 👀`,
      hashtags: [
        `#${niche.replace(/\s+/g, '')}`,
        `#${topic.replace(/\s+/g, '')}`,
        "#ExpertTips",
        "#LearnSomethingNew",
        "#DidYouKnow"
      ],
      hook: `I wish I knew this ${topic} trick sooner!`
    };

    const idea = await Idea.create({
      topic,
      niche,
      ...fallback,
      createdBy: req.user.id,
      source: 'fallback',
      warning: "Used fallback content due to API issues"
    });

    return res.json(idea);
  }
};