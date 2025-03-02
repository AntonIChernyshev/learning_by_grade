import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model options: claude-3-haiku-20240307 (fastest), claude-3-sonnet-20240229 (balanced), claude-3-opus-20240229 (most powerful)
// New model: claude-3-5-haiku-20241022 (latest and improved Haiku model)
const MODEL = 'claude-3-5-haiku-20241022';

type Data = {
  hint?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { exercise, answer, grade } = req.body;

    if (!exercise || !answer) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Use Anthropic's Claude to generate a hint
    const prompt = `You are an educational assistant helping grade ${grade} students with exercises. 
    For the exercise: "${exercise}" with the answer "${answer}", provide a helpful hint.
    
    The hint should:
    1. Guide the student toward the answer without giving it away completely
    2. Be age-appropriate and encouraging for a 7-year-old
    3. Be clear and concise (1-2 sentences)
    
    Format your response as a JSON object with exactly this field:
    {
      "hint": "Your hint here"
    }`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.7,
      system: "You are a helpful educational assistant that creates age-appropriate hints for children. Always respond with valid JSON that can be parsed.",
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the response content
    const responseContent = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    // Parse the JSON response
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);
      
      if (!result.hint) {
        throw new Error('Missing hint in response');
      }
      
      return res.status(200).json({
        hint: result.hint
      });
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Fallback to mock data if parsing fails
      let hint = '';

      if (exercise.includes('apples')) {
        hint = 'Try adding the numbers together. Remember, when you get more of something, you add!';
      } else if (exercise.includes('stickers')) {
        hint = 'When you give something away, you have less than before. Try subtracting!';
      } else if (exercise.includes('marbles')) {
        hint = 'Sharing equally means dividing. Try dividing the total number by the number of friends.';
      } else if (exercise.includes('opposite')) {
        hint = 'Think about how you feel on a very cold winter day versus a hot summer day.';
      } else if (exercise.includes('Unscramble')) {
        hint = 'This word is something you might do with a friend - you talk or have a conversation.';
      } else if (exercise.includes('blank')) {
        hint = 'Think about the position of the cat in relation to the table. If it jumped, where would it end up?';
      } else if (exercise.includes('planet')) {
        hint = 'It\'s the third planet from the sun and the only one known to have life.';
      } else if (exercise.includes('plants need')) {
        hint = 'Think about what you need to water your plants with, where you put them to get light, and what they grow in.';
      } else if (exercise.includes('water when it freezes')) {
        hint = 'Think about what happens when you put water in the freezer. What does it turn into?';
      } else {
        hint = 'Think carefully about the question and use what you\'ve learned in class!';
      }

      return res.status(200).json({ hint });
    }
  } catch (error) {
    console.error('Error generating hint:', error);
    return res.status(500).json({ error: 'Failed to generate hint' });
  }
} 