import type { NextPage } from 'next';
import Layout from '../components/Layout';
import Link from 'next/link';

const Home: NextPage = () => {
  const subjects = [
    {
      id: 'english',
      name: 'English',
      description: 'Learn vocabulary, grammar, and reading skills',
      color: 'bg-green-500',
      icon: '📚'
    },
    {
      id: 'math',
      name: 'Math',
      description: 'Practice numbers, counting, and basic arithmetic',
      color: 'bg-blue-500',
      icon: '🔢'
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Discover the world around you with fun experiments',
      color: 'bg-purple-500',
      icon: '🔬'
    }
  ];

  return (
    <Layout>
      <div className="text-center mb-12">
        <h1 className="text-5xl animate-float">Welcome to Kids Learning Hub!</h1>
        <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
          A fun place for 7-year-olds to learn and practice different subjects with
          interactive exercises and games.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {subjects.map((subject) => (
          <Link 
            href={`/${subject.id}`} 
            key={subject.id}
          >
            <a className="transform transition-all duration-300 hover:scale-105">
              <div className={`card h-full flex flex-col items-center text-center p-8 border-t-8 ${subject.color} border-${subject.color}`}>
                <div className="text-6xl mb-4 animate-float">{subject.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{subject.name}</h2>
                <p className="text-gray-600 flex-grow">{subject.description}</p>
                <button className="btn-primary mt-6">Start Learning</button>
              </div>
            </a>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card flex flex-col items-center">
            <div className="text-4xl mb-4">1️⃣</div>
            <h3 className="text-xl font-bold mb-2">Choose a Subject</h3>
            <p>Select from English, Math, or Science to start your learning adventure</p>
          </div>
          <div className="card flex flex-col items-center">
            <div className="text-4xl mb-4">2️⃣</div>
            <h3 className="text-xl font-bold mb-2">Try Fun Exercises</h3>
            <p>Solve interactive problems and get hints when you need help</p>
          </div>
          <div className="card flex flex-col items-center">
            <div className="text-4xl mb-4">3️⃣</div>
            <h3 className="text-xl font-bold mb-2">Learn and Grow</h3>
            <p>Track your progress and celebrate your achievements</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 