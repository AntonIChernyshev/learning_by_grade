import { useState } from 'react';
import Layout from '../components/Layout';
import type { NextPage } from 'next';

const English: NextPage = () => {
  const [exercise, setExercise] = useState('');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');

  const generateExercise = async () => {
    setIsLoading(true);
    setIsCorrect(null);
    setUserAnswer('');
    setHint('');
    
    try {
      const response = await fetch('/api/generate-exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subject: 'english',
          difficulty,
          grade: 2
        }),
      });
      
      const data = await response.json();
      
      if (data.exercise) {
        setExercise(data.exercise);
        setAnswer(data.answer);
      }
    } catch (error) {
      console.error('Error generating exercise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = () => {
    const isAnswerCorrect = userAnswer.trim().toLowerCase() === answer.trim().toLowerCase();
    setIsCorrect(isAnswerCorrect);
  };

  const getHint = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate-hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          exercise,
          answer,
          grade: 2
        }),
      });
      
      const data = await response.json();
      
      if (data.hint) {
        setHint(data.hint);
      }
    } catch (error) {
      console.error('Error generating hint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center">English Exercises</h1>
        
        <div className="card mb-8">
          <p className="text-lg mb-4">
            Welcome to the English section! Here you can practice vocabulary, spelling, and reading skills that are perfect for 2nd grade.
          </p>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Difficulty Level:</label>
            <div className="flex space-x-4">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-full capitalize ${
                    difficulty === level
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={generateExercise}
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate New English Exercise'}
          </button>
        </div>
        
        {exercise && (
          <div className="card mb-8">
            <h2 className="text-2xl mb-4 text-center">Your English Exercise</h2>
            <div className="bg-yellow-100 p-6 rounded-lg mb-6 text-center">
              <p className="text-xl font-comic">{exercise}</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="answer" className="block text-gray-700 mb-2">
                Your Answer:
              </label>
              <input
                type="text"
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Type your answer here..."
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={checkAnswer}
                className="btn-primary flex-1"
                disabled={!userAnswer.trim() || isLoading}
              >
                Check Answer
              </button>
              <button
                onClick={getHint}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                Get a Hint
              </button>
              <button
                onClick={() => setUserAnswer(answer)}
                className="btn-secondary flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                disabled={isLoading || !exercise}
              >
                Reveal Answer
              </button>
            </div>
            
            {isCorrect !== null && (
              <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="text-lg font-medium">
                  {isCorrect ? '🎉 Correct! Great job!' : '❌ Not quite right. Try again or get a hint!'}
                </p>
              </div>
            )}
            
            {hint && (
              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <h3 className="font-bold mb-2">Hint:</h3>
                <p>{hint}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="card bg-primary-50">
          <h2 className="text-xl mb-4">English Skills for 2nd Grade</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Reading simple stories and understanding them</li>
            <li>Learning common sight words</li>
            <li>Understanding basic grammar (nouns, verbs, adjectives)</li>
            <li>Writing simple sentences with correct punctuation</li>
            <li>Expanding vocabulary</li>
            <li>Spelling common words correctly</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default English; 