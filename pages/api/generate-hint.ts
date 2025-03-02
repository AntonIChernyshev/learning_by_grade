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

    if (!exercise || !answer || !grade) {
      console.log('Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Add a random seed to ensure variety in hint generation
    const randomSeed = Math.floor(Math.random() * 10000);
    
    // Detect subject from exercise content if not provided
    let detectedSubject = subject || 'general';
    
    if (!subject) {
      console.log('Subject not provided, attempting to detect from exercise content');
      
      // Simple keyword-based subject detection
      const exerciseLower = exercise.toLowerCase();
      
      if (exerciseLower.includes('math') || 
          exerciseLower.includes('add') || 
          exerciseLower.includes('subtract') || 
          exerciseLower.includes('equal') ||
          exerciseLower.includes('number') ||
          exerciseLower.includes('count') ||
          exerciseLower.includes('+') ||
          exerciseLower.includes('-') ||
          exerciseLower.includes('=') ||
          exerciseLower.includes('sum') ||
          exerciseLower.includes('total') ||
          exerciseLower.includes('how many')) {
        detectedSubject = 'math';
      } 
      else if (exerciseLower.includes('word') || 
               exerciseLower.includes('sentence') || 
               exerciseLower.includes('opposite') ||
               exerciseLower.includes('spell') ||
               exerciseLower.includes('letter') ||
               exerciseLower.includes('rhyme') ||
               exerciseLower.includes('unscramble')) {
        detectedSubject = 'english';
      }
      else if (exerciseLower.includes('animal') || 
               exerciseLower.includes('plant') || 
               exerciseLower.includes('weather') ||
               exerciseLower.includes('body') ||
               exerciseLower.includes('planet') ||
               exerciseLower.includes('water') ||
               exerciseLower.includes('sun') ||
               exerciseLower.includes('earth') ||
               exerciseLower.includes('nature')) {
        detectedSubject = 'science';
      }
      
      console.log('Detected subject:', detectedSubject);
    }

    // Create subject-specific prompts for hints
    let prompt = '';
    
    if (detectedSubject === 'math') {
      prompt = `You are an educational assistant providing age-appropriate math hints for grade ${grade} students.
      
      The student is working on this math problem:
      "${exercise}"
      
      The correct answer is: "${answer}"
      
      Provide a helpful hint that guides the student toward the answer without giving it away directly.
      The hint should be age-appropriate for grade ${grade} students and encourage critical thinking.
      
      IMPORTANT: Be creative and generate a UNIQUE hint. Use random seed ${randomSeed} to inspire variety.
      Choose different approaches to hint at the solution than you might typically use.
      
      For example:
      - Point out a strategy they could use
      - Remind them of a relevant math concept
      - Break down the problem into smaller steps
      - Suggest drawing a picture or using objects to visualize
      
      Keep the hint concise, encouraging, and appropriate for a grade ${grade} student.
      Format your response as a simple text hint without any JSON formatting.`;
    } 
    else if (detectedSubject === 'english') {
      prompt = `You are an educational assistant providing age-appropriate English language hints for grade ${grade} students.
      
      The student is working on this English exercise:
      "${exercise}"
      
      The correct answer is: "${answer}"
      
      Provide a helpful hint that guides the student toward the answer without giving it away directly.
      The hint should be age-appropriate for grade ${grade} students and encourage thinking about language.
      
      IMPORTANT: Be creative and generate a UNIQUE hint. Use random seed ${randomSeed} to inspire variety.
      Choose different approaches to hint at the solution than you might typically use.
      
      For example:
      - Give a clue about the meaning
      - Suggest thinking about a similar word
      - Provide a partial example
      - Remind them of a language rule
      
      Keep the hint concise, encouraging, and appropriate for a grade ${grade} student.
      Format your response as a simple text hint without any JSON formatting.`;
    }
    else if (detectedSubject === 'science') {
      prompt = `You are an educational assistant providing age-appropriate science hints for grade ${grade} students.
      
      The student is working on this science question:
      "${exercise}"
      
      The correct answer is: "${answer}"
      
      Provide a helpful hint that guides the student toward the answer without giving it away directly.
      The hint should be age-appropriate for grade ${grade} students and encourage scientific thinking.
      
      IMPORTANT: Be creative and generate a UNIQUE hint. Use random seed ${randomSeed} to inspire variety.
      Choose different approaches to hint at the solution than you might typically use.
      
      For example:
      - Remind them of a scientific fact they've learned
      - Suggest an observation they could make
      - Connect to an everyday experience
      - Ask a guiding question that leads to the answer
      
      Keep the hint concise, encouraging, and appropriate for a grade ${grade} student.
      Format your response as a simple text hint without any JSON formatting.`;
    }
    else {
      // General hint prompt for other subjects
      prompt = `You are an educational assistant providing age-appropriate hints for grade ${grade} students.
      
      The student is working on this exercise:
      "${exercise}"
      
      The correct answer is: "${answer}"
      
      Provide a helpful hint that guides the student toward the answer without giving it away directly.
      The hint should be age-appropriate for grade ${grade} students and encourage critical thinking.
      
      IMPORTANT: Be creative and generate a UNIQUE hint. Use random seed ${randomSeed} to inspire variety.
      Choose different approaches to hint at the solution than you might typically use.
      
      Keep the hint concise, encouraging, and appropriate for a grade ${grade} student.
      Format your response as a simple text hint without any JSON formatting.`;
    }

    console.log('Sending request to Anthropic API with model:', MODEL);
    console.log('Prompt:', prompt);
    
    try {
      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 300,
        temperature: 0.9, // Increased temperature for more randomness
        system: "You are a helpful educational assistant that provides age-appropriate hints for children. Your hints should guide students toward the answer without giving it away directly. Be encouraging and supportive. Create unique, varied hints each time.",
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
      
      if (!responseContent) {
        console.log('Empty response from Anthropic API');
        throw new Error('Empty response from Anthropic API');
      }
      
      // Clean up the response - remove any JSON formatting if present
      let hint = responseContent.trim();
      
      // Remove JSON formatting if present
      if (hint.startsWith('{') && hint.endsWith('}')) {
        try {
          const jsonObj = JSON.parse(hint);
          hint = jsonObj.hint || jsonObj.message || jsonObj.response || hint;
        } catch (e) {
          // If parsing fails, keep the original hint
          console.log('Failed to parse JSON in hint, using raw text');
        }
      }
      
      console.log('Final hint:', hint);
      return res.status(200).json({ hint });
      
    } catch (apiError: any) {
      console.error('Error calling Anthropic API:', apiError);
      console.error('API Error details:', {
        message: apiError.message,
        name: apiError.name,
        status: apiError.status,
        stack: apiError.stack
      });
      
      // Fallback to mock hints if API call fails
      console.log('Falling back to mock hints');
      
      // Add more variety to fallback hints with randomization
      const randomFactor = Math.floor(Math.random() * 3); // 0, 1, or 2
      let hint = '';
      
      if (detectedSubject === 'math') {
        if (randomFactor === 0) {
          hint = "Try breaking down the problem into smaller steps. What operation do you need to use?";
        } else if (randomFactor === 1) {
          hint = "Drawing a picture might help you visualize this problem.";
        } else {
          hint = "Think about what the question is asking you to find. What information do you have?";
        }
      } else if (detectedSubject === 'english') {
        if (randomFactor === 0) {
          hint = "Think about words that have a similar meaning or the opposite meaning.";
        } else if (randomFactor === 1) {
          hint = "Try sounding out the letters or syllables one by one.";
        } else {
          hint = "Look for patterns in the words or letters.";
        }
      } else if (detectedSubject === 'science') {
        if (randomFactor === 0) {
          hint = "Think about what you've learned about this topic in class.";
        } else if (randomFactor === 1) {
          hint = "Consider how this works in the world around you.";
        } else {
          hint = "Remember the key parts or steps in this process.";
        }
      } else {
        if (randomFactor === 0) {
          hint = "Read the question carefully again and think about what it's asking.";
        } else if (randomFactor === 1) {
          hint = "Try to remember what you've learned about this topic.";
        } else {
          hint = "Break down the problem into smaller parts to make it easier.";
        }
      }
      
      console.log('Returning mock hint:', hint);
      return res.status(200).json({ hint });
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