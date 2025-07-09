import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-indigo-700 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Oops! This page doesn't exist.</h2>
        <p className="text-gray-600 mb-6">
          The page you’re looking for might have been removed or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-medium"
        >
          <ArrowLeftCircle size={18} /> Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
