import React, { useState } from 'react';
import Markdown from 'react-markdown';

const CreationItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false)

  const getTypeColor = (type) => {
    const colors = {
      'image': 'from-purple-500 to-pink-500',
      'article': 'from-blue-500 to-cyan-500',
      'resume-review': 'from-green-500 to-teal-500',
      'default': 'from-gray-500 to-gray-600'
    }
    return colors[type] || colors.default
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'article':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'resume-review':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div 
      onClick={() => setExpanded(!expanded)} 
      className="article-card p-4 border rounded-lg cursor-pointer bg-white shadow-sm transition-all duration-300"
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{item.prompt}</h2>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="flex items-center gap-1">
              {getTypeIcon(item.type)}
              {item.type}
            </span>
            <span>•</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getTypeColor(item.type)} text-white shadow-sm`}>
            {item.type}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {
        expanded && (
          <div className="mt-4 pt-4 border-t article-content">
            {item.type === 'image' ? (
              <div className="flex justify-center">
                <img 
                  src={item.content} 
                  alt="Generated content" 
                  className='w-full max-w-md rounded-lg shadow-lg'
                />
              </div>
            ) : (
              <div className='article-scroll max-h-96 overflow-y-auto text-sm text-slate-700 pr-2'>
                <div className="reset-tw">
                  <Markdown>
                    {item.content}
                  </Markdown>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  );
};

export default CreationItem;
