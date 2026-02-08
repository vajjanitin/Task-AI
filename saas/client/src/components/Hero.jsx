import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div
      className="hero-section px-4 sm:px-16 xl:px-24 relative inline-flex flex-col w-full justify-center bg-cover bg-no-repeat min-h-screen"
      style={{ backgroundImage: 'url(/gradientBackground.png)' }}
    >
      <div className="hero-content text-center mb-6">
        <h1 className="hero-title text-2xl sm:text-4xl md:text-5xl 2xl:text-6xl mx-auto leading-tight font-normal">
          Create amazing content <br /> with <span className="text-primary hero-highlight">AI tools</span>
        </h1>
        <p className="hero-subtitle mt-3 max-w-xs sm:max-w-lg 2xl:max-w-xl mx-auto max-sm:text-xs text-gray-700">
          Transform your content creation with our suite of premium AI tools.
          Write articles, generate images, and enhance your workflow.
        </p>
      </div>

      <div className="hero-buttons flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs">
        <button
          onClick={() => navigate('/ai')}
          className="hero-button-primary bg-primary text-white px-8 py-2 rounded cursor-pointer"
        >
          Start Creating Now
        </button>
        <button className="hero-button-secondary bg-white px-8 py-2 rounded border border-gray-300 cursor-pointer">
          Watch Demo
        </button>
      </div>
    </div>
  );
};

export default Hero;
