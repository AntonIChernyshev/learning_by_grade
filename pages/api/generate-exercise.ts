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
  exercise?: string;
  answer?: string;
  error?: string;
  debug?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('API endpoint called: generate-exercise');
  console.log('Request method:', req.method);
  console.log('Request body:', JSON.stringify(req.body));
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length);
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, difficulty, grade } = req.body;
    console.log('Extracted parameters:', { subject, difficulty, grade });

    if (!subject || !difficulty || !grade) {
      console.log('Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Use Anthropic's Claude to generate an exercise
    const prompt = `You are an educational assistant creating age-appropriate ${subject} exercises for grade ${grade} students. 
    Generate a ${difficulty} level problem with a clear answer. The exercise should be fun and engaging.
    
    Please create a ${difficulty} ${subject} exercise for a ${grade}nd grade student.
    
    Format your response as a JSON object with exactly these two fields:
    {
      "exercise": "The exercise question here",
      "answer": "The answer here"
    }
    
    Make sure the exercise is appropriate for grade ${grade} students and the answer is clear and unambiguous.`;

    console.log('Sending request to Anthropic API with model:', MODEL);
    console.log('Prompt:', prompt);
    
    try {
      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1000,
        temperature: 0.7,
        system: "You are a helpful educational assistant that creates age-appropriate exercises for children. Always respond with valid JSON that can be parsed.",
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      console.log('Received response from Anthropic API');
      console.log('Response content type:', message.content[0]?.type);
      
      // Extract the response content
      const responseContent = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';
      
      console.log('Response content:', responseContent);
      
      // Parse the JSON response
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.log('No JSON found in response');
          throw new Error('No JSON found in response');
        }
        
        const jsonStr = jsonMatch[0];
        console.log('Extracted JSON string:', jsonStr);
        
        const result = JSON.parse(jsonStr);
        console.log('Parsed result:', result);
        
        if (!result.exercise || !result.answer) {
          console.log('Missing exercise or answer in response');
          throw new Error('Missing exercise or answer in response');
        }
        
        console.log('Successfully generated exercise');
        return res.status(200).json({
          exercise: result.exercise,
          answer: result.answer
        });
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        console.log('Raw response:', responseContent);
        
        // Fallback to mock data if parsing fails
        console.log('Falling back to mock data');
        let exercise = '';
        let answer = '';

        if (subject === 'math') {
          switch (difficulty) {
            case 'easy':
              exercise = 'If you have 5 apples and your friend gives you 3 more apples, how many apples do you have now?';
              answer = '8';
              break;
            case 'medium':
              exercise = 'Sarah has 15 stickers. She gives 7 stickers to her friend. How many stickers does Sarah have left?';
              answer = '8';
              break;
            case 'hard':
              exercise = 'Tom has 24 marbles. He wants to share them equally among 4 friends. How many marbles will each friend get?';
              answer = '6';
              break;
            default:
              exercise = 'Count from 1 to 10.';
              answer = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10';
          }
        } else if (subject === 'english') {
          switch (difficulty) {
            case 'easy':
              exercise = 'What is the opposite of "hot"?';
              answer = 'cold';
              break;
            case 'medium':
              exercise = 'Unscramble these letters to make a word: C-A-T-H';
              answer = 'chat';
              break;
            case 'hard':
              exercise = 'Fill in the blank: The cat jumped _____ the table.';
              answer = 'onto';
              break;
            default:
              exercise = 'Name three animals that start with the letter "B".';
              answer = 'bear, bird, butterfly';
          }
        } else if (subject === 'science') {
          switch (difficulty) {
            case 'easy':
              exercise = 'Name the planet we live on.';
              answer = 'Earth';
              break;
            case 'medium':
              exercise = 'What do plants need to grow? Name three things.';
              answer = 'water, sunlight, soil';
              break;
            case 'hard':
              exercise = 'What happens to water when it freezes?';
              answer = 'It turns into ice';
              break;
            default:
              exercise = 'Name three states of matter.';
              answer = 'solid, liquid, gas';
          }
        }

        console.log('Returning mock data:', { exercise, answer });
        return res.status(200).json({ exercise, answer });
      }
    } catch (apiError: any) {
      console.error('Error calling Anthropic API:', apiError);
      console.error('API Error details:', {
        message: apiError.message,
        name: apiError.name,
        status: apiError.status,
        stack: apiError.stack
      });
      
      // Return detailed error information for debugging
      return res.status(500).json({ 
        error: 'Failed to call Anthropic API', 
        debug: {
          message: apiError.message,
          name: apiError.name,
          status: apiError.status
        } 
      });
    }
  } catch (error: any) {
    console.error('Unhandled error in generate-exercise:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Return detailed error information for debugging
    return res.status(500).json({ 
      error: 'Failed to generate exercise', 
      debug: {
        message: error.message,
        name: error.name
      } 
    });
  }
} 