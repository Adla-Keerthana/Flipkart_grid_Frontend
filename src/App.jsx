import React from 'react';
import Home from './components/Home'; // Import the Home component

function App() {
  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="container mx-auto p-6 bg-gray-800 shadow-lg rounded-lg">
        <h1 className="text-4xl font-extrabold text-center text-neon-blue mb-6">
          Flipkart Grid 6.0 Robotics Interface
        </h1>
        <p className="text-center text-gray-400 mb-10">
          A robotics-driven solution for extracting and processing product data
        </p>
        <Home />
      </div>
    </div>
  );
}

export default App;
