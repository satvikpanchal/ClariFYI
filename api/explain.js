import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Simplicity level prompts
const simplicityPrompts = {
  0: "Explain this as if I'm 5 years old. Use very simple words, short sentences, and fun analogies. Make it super easy to understand.",
  1: "Explain this as if I'm 7 years old. Use simple explanations with easy words. Use comparisons to everyday things.",
  2: "Explain this as if I'm 10 years old. Use clear explanations with familiar concepts. Avoid jargon and technical terms.",
  3: "Explain this as if I'm 15 years old. Use straightforward explanations with some detail. Accessible to teenagers.",
  4: "Explain this as if I'm 18 years old. Use detailed explanations with context. Uses clear language suitable for adults.",
  5: "Explain this as if I'm 25 years old. Use comprehensive explanations with examples. Assumes some general knowledge.",
  6: "Explain this as if I'm a professional. Use professional explanations with structured information. Business-appropriate tone.",
  7: "Explain this as if I'm a graduate student. Use academic explanations with precise language. Suitable for graduate-level understanding.",
  8: "Explain this as if I'm an expert. Use expert-level explanations with technical depth. Assumes advanced knowledge."
};

// Tone prompts
const tonePrompts = {
  0: "Use a friendly, warm, and approachable tone. Be conversational and make it feel like talking to a friend.",
  1: "Use an educational, teacher-like tone. Be clear, structured, and helpful with step-by-step explanations.",
  2: "Use a funny, light-hearted, and meme-style tone. Add humor and make it entertaining while still being informative.",
  3: "Use a calm, poetic, and serene tone. Be gentle, thoughtful, and contemplative.",
  4: "Use a professional, business-focused tone. Be formal, concise, and authoritative.",
  5: "Use an enthusiastic, energetic, and excited tone. Be passionate, positive, and inspiring."
};

// Safety: Harmful content detection
function containsHarmfulContent(text) {
  const lowerText = text.toLowerCase();
  
  const harmfulPatterns = [
    /\b(suicide|self[-\s]?harm|cutting|self[-\s]?injury|ending[-\s]?life)\b/i,
    /\b(kill|murder|assassinate|violence|weapon|bomb|attack|hurt|harm)\b/i,
    /\b(sexual|explicit|porn|nsfw|adult[-\s]?content)\b/i,
    /\b(drug[-\s]?dealing|illegal[-\s]?drugs|hacking|fraud|scam)\b/i,
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(lowerText)) {
      return true;
    }
  }
  
  return false;
}

// Guardrails: Content validation
function validateInput(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: Text is required');
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Invalid input: Text cannot be empty');
  }
  
  if (trimmed.length > 10000) {
    throw new Error('Invalid input: Text is too long (max 10,000 characters)');
  }
  
  if (containsHarmfulContent(trimmed)) {
    throw new Error('Content appears to contain harmful or inappropriate material. Please provide different content.');
  }
  
  return trimmed;
}

// Check if input is a URL (more strict - must start with http:// or https://)
function isURL(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Fetch content from URL
async function fetchURLContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ELI5-Explainer/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    
    if (text.includes('<html') || text.includes('<!DOCTYPE')) {
      const cleaned = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleaned.length < 100) {
        throw new Error('Could not extract meaningful content from URL');
      }
      
      return cleaned.substring(0, 5000);
    }
    
    return text.substring(0, 5000);
  } catch (error) {
    throw new Error(`Error fetching URL content: ${error.message}`);
  }
}

// Generate explanation using Gemini
async function generateExplanation(text, simplicity, tone, files = []) {
  try {
    const textTrimmed = text ? text.trim() : '';
    if (!textTrimmed && files.length === 0) {
      throw new Error('Invalid input: Text or files are required');
    }
    
    if (textTrimmed) {
      validateInput(text);
    }
    
    if (simplicity < 0 || simplicity > 8) {
      throw new Error('Invalid simplicity level');
    }
    
    let tonePrompt;
    if (typeof tone === 'string' && tone.trim()) {
      const customTone = tone.trim();
      tonePrompt = `Use a ${customTone.toLowerCase()} tone. Be creative, authentic, and match the requested style exactly. If the tone is "${customTone}", embody that tone throughout the explanation.`;
    } else {
      if (tone < 0 || tone > 5) {
        throw new Error('Invalid tone level');
      }
      tonePrompt = tonePrompts[tone];
    }
    
    let processedText = textTrimmed;
    if (textTrimmed && isURL(textTrimmed)) {
      try {
        processedText = await fetchURLContent(textTrimmed);
      } catch (urlError) {
        console.warn('⚠️  URL fetch failed, treating URL as text:', urlError.message);
        processedText = textTrimmed;
      }
    }
    
    const simplicityPrompt = simplicityPrompts[simplicity];
    
    const contentParts = [];
    
    if (processedText) {
      contentParts.push({ text: processedText });
    }
    
    for (const file of files) {
      let mimeType = file.mimeType;
      
      if (!mimeType) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
          mimeType = 'application/pdf';
        } else if (['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif'].includes(ext)) {
          mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        } else {
          mimeType = 'application/octet-stream';
        }
      }
      
      const filePart = {
        inlineData: {
          mimeType: mimeType,
          data: file.data
        }
      };
      
      contentParts.push(filePart);
    }
    
    let promptText;
    
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      
      promptText = `You are an expert at explaining complex concepts in simple terms. 

CRITICAL INSTRUCTION: You have been provided with ${files.length} file(s): ${fileNames}. 

YOUR PRIMARY TASK: Read and analyze the CONTENT of these files. Extract information from the files and explain what they contain. 

${files.some(f => f.mimeType?.includes('pdf') || f.name.toLowerCase().endsWith('.pdf')) ? `For PDF files: Extract all text content, read the document, and explain what it says. Summarize the key information and main points found in the PDF.` : ''}
${files.some(f => f.isImage) ? `For image files: Look at the image carefully, describe what you see, and explain the visual content.` : ''}

${processedText ? `\nNote: The user also provided this text: "${processedText}". Use this as context or additional instruction, but the PRIMARY focus should be analyzing and explaining the FILE CONTENT.` : ''}

CRITICAL SAFETY GUIDELINES:
- NEVER explain, promote, or provide instructions for self-harm, suicide, violence, or illegal activities
- NEVER generate explicit, sexual, or adult content
- NEVER provide medical advice, treatment recommendations, or diagnoses
- NEVER create content that could cause harm to individuals or groups
- If the content contains harmful material, politely decline

CONTENT GUIDELINES:
- ${simplicityPrompt}
- ${tonePrompt}
- Keep it to exactly 2-3 sentences
- Make it easy to understand
- Focus on the main idea from the FILE CONTENT
- Do not include any URLs or external references
- Maintain a safe, educational, and appropriate tone

YOUR RESPONSE: Explain what you found in the attached file(s) in 2-3 simple sentences. Base your explanation on the actual content of the files, not on the user's question. If the content is inappropriate or harmful, politely decline.`;
    } else {
      promptText = `You are an expert at explaining complex concepts in simple terms. Your task is to explain the given content in exactly 2-3 sentences.

CRITICAL SAFETY GUIDELINES:
- NEVER explain, promote, or provide instructions for self-harm, suicide, violence, or illegal activities
- NEVER generate explicit, sexual, or adult content
- NEVER provide medical advice, treatment recommendations, or diagnoses
- NEVER create content that could cause harm to individuals or groups
- If the input contains harmful content, politely decline and suggest the user seek appropriate professional help or resources
- Focus only on educational, informative, and safe explanations

CONTENT GUIDELINES:
- ${simplicityPrompt}
- ${tonePrompt}
- Keep it to exactly 2-3 sentences
- Make it easy to understand
- Focus on the main idea
- Do not include any URLs or external references
- Maintain a safe, educational, and appropriate tone

Text to explain: ${processedText}

Provide your explanation in 2-3 simple sentences. If the content is inappropriate or harmful, politely decline.`;
    }
    
    const prompt = promptText;
    
    if (contentParts.length === 0) {
      throw new Error('No content to explain. Please provide text or files.');
    }
    
    let allParts;
    
    if (files.length > 0) {
      allParts = [
        ...contentParts,
        { text: prompt }
      ];
    } else {
      allParts = [
        { text: prompt },
        ...contentParts
      ];
    }
    
    const contents = allParts;

    const safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: contents,
      safetySettings: safetySettings,
    });

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      if (candidate.safetyRatings && candidate.safetyRatings.length > 0) {
        const blockedRatings = candidate.safetyRatings.filter(
          rating => rating.probability === 'HIGH' || rating.probability === 'MEDIUM'
        );
        
        if (blockedRatings.length > 0) {
          throw new Error('Content was blocked due to safety concerns. Please try different content.');
        }
      }
      
      if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
        throw new Error('Content was blocked due to safety settings. Please try different content.');
      }
    }
    
    const explanation = response.text?.trim();
    
    if (!explanation) {
      throw new Error('No explanation generated');
    }
    
    if (containsHarmfulContent(explanation)) {
      throw new Error('Generated content was filtered for safety. Please try different content.');
    }
    
    if (explanation.length > 1000) {
      return explanation.substring(0, 1000) + '...';
    }
    
    return explanation;
  } catch (error) {
    if (error.message?.includes('API key') || error.message?.includes('401')) {
      throw new Error('Invalid API key. Please check your configuration.');
    }
    
    if (error.message?.includes('safety') || 
        error.message?.includes('blocked') || 
        error.message?.includes('SAFETY') ||
        error.message?.includes('filtered')) {
      throw new Error('Content was blocked due to safety settings. Please try different content.');
    }
    
    if (error.message?.includes('API') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    
    throw new Error(`Failed to generate explanation: ${error.message || 'Unknown error'}`);
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set' });
    return;
  }
  
  try {
    const { text, simplicity, tone, files } = req.body;
    
    const explanation = await generateExplanation(text, simplicity, tone, files || []);
    
    res.status(200).json({ explanation });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

