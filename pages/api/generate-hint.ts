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
  debug?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('API endpoint called: generate-hint');
  console.log('Request method:', req.method);
  console.log('Request body:', JSON.stringify(req.body));
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length);
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { exercise, answer, grade, subject } = req.body;
    console.log('Extracted parameters:', { exercise, answer, grade, subject });

    if (!exercise || !answer) {
      console.log('Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Detect subject if not provided
    let detectedSubject = subject || '';
    if (!detectedSubject) {
      // Simple subject detection based on keywords
      const exerciseLower = exercise.toLowerCase();
      if (exerciseLower.includes('add') || 
          exerciseLower.includes('subtract') || 
          exerciseLower.includes('equal') || 
          exerciseLower.includes('number') ||
          exerciseLower.includes('count') ||
          exerciseLower.includes('how many')) {
        detectedSubject = 'math';
      } else if (exerciseLower.includes('word') || 
                exerciseLower.includes('letter') || 
                exerciseLower.includes('opposite') || 
                exerciseLower.includes('unscramble') ||
                exerciseLower.includes('spell') ||
                exerciseLower.includes('rhyme')) {
        detectedSubject = 'english';
      } else if (exerciseLower.includes('planet') || 
                exerciseLower.includes('animal') || 
                exerciseLower.includes('plant') || 
                exerciseLower.includes('water') ||
                exerciseLower.includes('weather') ||
                exerciseLower.includes('body')) {
        detectedSubject = 'science';
      } else {
        detectedSubject = 'general';
      }
    }
    
    console.log('Detected subject:', detectedSubject);

    // Create subject-specific prompts for hints
    let prompt = '';
    
    if (detectedSubject === 'math') {
      prompt = `You are an educational assistant helping grade ${grade} students with math exercises. 
      For the math exercise: "${exercise}" with the answer "${answer}", provide a helpful hint.
      
      The hint should:
      1. Guide the student toward the mathematical concept or operation needed (addition, subtraction, etc.)
      2. Not give away the numerical answer directly
      3. Be age-appropriate and encouraging for a grade ${grade} student
      4. Be clear and concise (1-2 sentences)
      
      Format your response as a JSON object with exactly this field:
      {
        "hint": "Your hint here"
      }`;
    } 
    else if (detectedSubject === 'english') {
      prompt = `You are an educational assistant helping grade ${grade} students with English language exercises. 
      For the English exercise: "${exercise}" with the answer "${answer}", provide a helpful hint.
      
      The hint should:
      1. Guide the student toward thinking about word meanings, spelling patterns, or language rules
      2. Not give away the exact answer
      3. Be age-appropriate and encouraging for a grade ${grade} student
      4. Be clear and concise (1-2 sentences)
      
      Format your response as a JSON object with exactly this field:
      {
        "hint": "Your hint here"
      }`;
    }
    else if (detectedSubject === 'science') {
      prompt = `You are an educational assistant helping grade ${grade} students with science exercises. 
      For the science exercise: "${exercise}" with the answer "${answer}", provide a helpful hint.
      
      The hint should:
      1. Guide the student toward the scientific concept or fact needed
      2. Relate to their everyday experiences when possible
      3. Be age-appropriate and encouraging for a grade ${grade} student
      4. Be clear and concise (1-2 sentences)
      
      Format your response as a JSON object with exactly this field:
      {
        "hint": "Your hint here"
      }`;
    }
    else {
      // Default prompt for other subjects
      prompt = `You are an educational assistant helping grade ${grade} students with exercises. 
      For the exercise: "${exercise}" with the answer "${answer}", provide a helpful hint.
      
      The hint should:
      1. Guide the student toward the answer without giving it away completely
      2. Be age-appropriate and encouraging for a grade ${grade} student
      3. Be clear and concise (1-2 sentences)
      
      Format your response as a JSON object with exactly this field:
      {
        "hint": "Your hint here"
      }`;
    }

    console.log('Sending request to Anthropic API with model:', MODEL);
    console.log('Prompt:', prompt);
    
    try {
      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1000,
        temperature: 0.7,
        system: "You are a helpful educational assistant that creates age-appropriate hints for children. Always respond with valid JSON that can be parsed. Your hints should guide without giving away the answer directly.",
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
        
        if (!result.hint) {
          console.log('Missing hint in response');
          throw new Error('Missing hint in response');
        }
        
        console.log('Successfully generated hint');
        return res.status(200).json({
          hint: result.hint
        });
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        console.log('Raw response:', responseContent);
        
        // Fallback to mock data if parsing fails
        console.log('Falling back to mock data');
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

        console.log('Returning mock hint:', hint);
        return res.status(200).json({ hint });
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
    console.error('Unhandled error in generate-hint:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Return detailed error information for debugging
    return res.status(500).json({ 
      error: 'Failed to generate hint', 
      debug: {
        message: error.message,
        name: error.name
      } 
    });
  }
} 