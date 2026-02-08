import React from 'react';
import { AiToolsData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const AiTools = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="tools-section px-4 my-20">
      <div className="tools-header text-center mb-8">
        <h2 className="tools-title text-xl text-gray-800">Powerful AI Tools</h2>
        <p className="tools-subtitle text-sm text-gray-600 max-w-md mx-auto">
          Everything you need to create, enhance, and optimize your content with cutting-edge AI technology
        </p>
      </div>

      <div className="tools-grid flex flex-wrap justify-center">
        {AiToolsData.map((tool, index) => (
          <div
            key={index}
            className="tool-card p-4 m-3 w-64 border rounded cursor-pointer"
            onClick={() => user && navigate(tool.path)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="tool-icon-wrapper">
              <tool.Icon className="tool-icon w-8 h-8 mb-3" />
            </div>
            <h3 className="tool-card-title text-base mb-1">{tool.title}</h3>
            <p className="tool-card-description text-xs text-gray-500">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiTools;
