import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model options: claude-3-haiku-20240307 (fastest), claude-3-sonnet-20240229 (balanced), claude-3-opus-20240229 (most powerful)
// New model: claude-3-5-haiku-20241022 (latest and improved Haiku model)
const MODEL = 'claude-3-7-sonnet-20250219';

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

    // Add a random seed to ensure variety in exercise generation
    const randomSeed = Math.floor(Math.random() * 10000);
    
    // Create subject-specific prompts
    let prompt = '';
    
    if (subject === 'math') {
      prompt = `You are an educational assistant creating age-appropriate math exercises for grade ${grade} students.
      Generate a ${difficulty} level math problem with a clear numerical or short text answer. 
      
      For ${difficulty} difficulty and grade ${grade}:
      - Easy: Simple addition, subtraction, or counting problems
      - Medium: Multi-step arithmetic, simple word problems
      - Hard: More complex word problems, beginning multiplication/division
      
      The exercise should be fun, engaging, and have a single correct answer.
      
      Before crafting your exercise pick one of these topics at random:
      - Addition and subtraction within 100
      - Understanding place value (ones, tens, hundreds)
      - Measuring length using standard units
      - Telling time to the nearest 5 minutes
      - Counting money (coins and bills)
      - Basic fractions (halves, thirds, fourths)
      
      Format your response as a JSON object with exactly these two fields:
      {
        "exercise": "The math problem here",
        "answer": "The numerical or short text answer here"
      }
      
      Make sure the exercise is appropriate for grade ${grade} students and the answer is clear and unambiguous.`;
    } 
    else if (subject === 'english') {
      prompt = `You are an educational assistant creating age-appropriate English language exercises for grade ${grade} students.
      Generate a ${difficulty} level English exercise with a clear, specific answer.
      
      For ${difficulty} difficulty and grade ${grade}, choose ONE of these exercise types:
      - Opposites: "What is the opposite of [word]?"
      - Fill-in-the-blank: "Complete the sentence: ___, pick one of these options: [options]"
      - Word unscramble: "Unscramble these letters to make a word: A-B-C-D"
      - Rhyming words: "What rhymes with [word] out of these options: [options]?"
      - Categorization: "Which word out of [options] belongs in the [category]?"
      
      IMPORTANT: Be creative and generate a UNIQUE exercise. Use random seed ${randomSeed} to inspire variety.
      Choose different words, sentences, and concepts than you might typically use.
      
      The exercise should have a single correct answer that is a word or short phrase.
      
      Format your response as a JSON object with exactly these two fields:
      {
        "exercise": "The English exercise here",
        "answer": "The single word or short phrase answer here"
      }
      
      Make sure the exercise is appropriate for grade ${grade} students and the answer is clear and unambiguous.`;
    }
    else if (subject === 'science') {
      prompt = `You are an educational assistant creating age-appropriate science exercises for grade ${grade} students.
      Generate a ${difficulty} level science question with a clear, specific answer.
      
      For ${difficulty} difficulty and grade ${grade}, focus on ONE of these topics:
      - Easy: 
        * Animals (habitats, characteristics, diet)
        * Plants (parts, growth, needs)
        * Weather (types, seasons, clothing)
        * Human body (parts, senses, basic functions)
      - Medium: 
        * Simple cause and effect relationships in nature
        * Basic environmental concepts
        * Food chains
      - Hard: 
        * Solar system (planets, sun, moon)
        * States of matter (solid, liquid, gas)
        * Life cycles (butterfly, frog, plant)
      
      IMPORTANT: Be creative and generate a UNIQUE exercise. Use random seed ${randomSeed} to inspire variety.
      Choose different scientific concepts and questions than you might typically use.
      
      The exercise should have a single correct answer that is a word, short phrase, or simple explanation.
      
      Format your response as a JSON object with exactly these two fields:
      {
        "exercise": "The science question here",
        "answer": "The word, short phrase, or simple explanation answer here"
      }
      
      Make sure the exercise is appropriate for grade ${grade} students and the answer is clear and unambiguous.`;
    }
    else {
      // Default prompt for other subjects
      prompt = `You are an educational assistant creating age-appropriate ${subject} exercises for grade ${grade} students. 
      Generate a ${difficulty} level problem with a clear answer. The exercise should be fun and engaging.
      
      Please create a ${difficulty} ${subject} exercise for a ${grade}nd grade student.
      
      IMPORTANT: Be creative and generate a UNIQUE exercise. Use random seed ${randomSeed} to inspire variety.
      
      Format your response as a JSON object with exactly these two fields:
      {
        "exercise": "The exercise question here",
        "answer": "The answer here"
      }
      
      Make sure the exercise is appropriate for grade ${grade} students and the answer is clear and unambiguous.`;
    }

    console.log('Sending request to Anthropic API with model:', MODEL);
    console.log('Prompt:', prompt);
    
    try {
      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 400,
        temperature: 1, // Increased temperature for more randomness
        system: "You are a helpful educational assistant that creates age-appropriate exercises for children. Always respond with valid JSON that can be parsed. Do not include additional info. Make sure exercises have clear, specific answers that fit the exercise-answer pair format. Create unique, varied exercises each time.",
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

        // Add more variety to fallback exercises with randomization
        const randomFactor = Math.floor(Math.random() * 3); // 0, 1, or 2
        
        if (subject === 'math') {
          switch (difficulty) {
            case 'easy':
              if (randomFactor === 0) {
                exercise = 'If you have 5 apples and your friend gives you 3 more apples, how many apples do you have now?';
                answer = '8';
              } else if (randomFactor === 1) {
                exercise = 'Count how many stars: ★ ★ ★ ★ ★ ★';
                answer = '6';
              } else {
                exercise = 'What is 4 + 5?';
                answer = '9';
              }
              break;
            case 'medium':
              if (randomFactor === 0) {
                exercise = 'Sarah has 15 stickers. She gives 7 stickers to her friend. How many stickers does Sarah have left?';
                answer = '8';
              } else if (randomFactor === 1) {
                exercise = 'You have 12 crayons and put them in boxes of 3. How many boxes do you need?';
                answer = '4';
              } else {
                exercise = 'What is 14 - 6?';
                answer = '8';
              }
              break;
            case 'hard':
              if (randomFactor === 0) {
                exercise = 'Tom has 24 marbles. He wants to share them equally among 4 friends. How many marbles will each friend get?';
                answer = '6';
              } else if (randomFactor === 1) {
                exercise = 'Lisa has 3 bags with 5 candies in each bag. How many candies does she have in total?';
                answer = '15';
              } else {
                exercise = 'There are 20 students in a class. If 12 are girls, how many are boys?';
                answer = '8';
              }
              break;
            default:
              exercise = 'Count from 1 to 10.';
              answer = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10';
          }
        } else if (subject === 'english') {
          switch (difficulty) {
            case 'easy':
              if (randomFactor === 0) {
                exercise = 'What is the opposite of "hot"?';
                answer = 'cold';
              } else if (randomFactor === 1) {
                exercise = 'What is the opposite of "big"?';
                answer = 'small';
              } else {
                exercise = 'What is the opposite of "day"?';
                answer = 'night';
              }
              break;
            case 'medium':
              if (randomFactor === 0) {
                exercise = 'Unscramble these letters to make a word: C-A-T-H';
                answer = 'chat';
              } else if (randomFactor === 1) {
                exercise = 'Unscramble these letters to make a word: G-D-O';
                answer = 'dog';
              } else {
                exercise = 'What rhymes with "cat"?';
                answer = 'hat, bat, rat, mat';
              }
              break;
            case 'hard':
              if (randomFactor === 0) {
                exercise = 'Fill in the blank: The cat jumped _____ the table.';
                answer = 'onto';
              } else if (randomFactor === 1) {
                exercise = 'Which word doesn\'t belong: apple, banana, carrot, orange';
                answer = 'carrot';
              } else {
                exercise = 'Fill in the blank: I _____ to school every day.';
                answer = 'go';
              }
              break;
            default:
              exercise = 'Name three animals that start with the letter "B".';
              answer = 'bear, bird, butterfly';
          }
        } else if (subject === 'science') {
          switch (difficulty) {
            case 'easy':
              if (randomFactor === 0) {
                exercise = 'Name the planet we live on.';
                answer = 'Earth';
              } else if (randomFactor === 1) {
                exercise = 'What do we call frozen water?';
                answer = 'Ice';
              } else {
                exercise = 'What animal says "moo"?';
                answer = 'Cow';
              }
              break;
            case 'medium':
              if (randomFactor === 0) {
                exercise = 'What do plants need to grow? Name three things.';
                answer = 'water, sunlight, soil';
              } else if (randomFactor === 1) {
                exercise = 'Name the four seasons.';
                answer = 'spring, summer, fall/autumn, winter';
              } else {
                exercise = 'What do we call animals that eat only plants?';
                answer = 'Herbivores';
              }
              break;
            case 'hard':
              if (randomFactor === 0) {
                exercise = 'What happens to water when it freezes?';
                answer = 'It turns into ice';
              } else if (randomFactor === 1) {
                exercise = 'What is the closest planet to the sun?';
                answer = 'Mercury';
              } else {
                exercise = 'What are the three states of matter?';
                answer = 'solid, liquid, gas';
              }
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