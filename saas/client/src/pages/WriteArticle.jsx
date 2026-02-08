import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import SpeechToText from "../components/SpeechToText";
import AIVisualMoodboard from "../components/AIVisualMoodboard";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Write an article about ${input} in ${selectedLength.text}`;
      setContent("");
      const { data } = await axios.post(
        "/api/ai/generate-article",
        { prompt, length: selectedLength.length },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-full p-4 flex flex-wrap gap-4 text-gray-800 bg-gray-100">
      {/* Left Form */}
      <form
        onSubmit={onSubmitHandler}
        className="article-form article-card w-full max-w-lg p-6 border rounded-lg bg-white shadow-sm"
      >
        <h1 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Article Configuration
        </h1>

        <label className="block text-sm font-medium mb-2">Article Topic</label>
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="article-input flex-1 p-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your article topic..."
            required
          />    
          <SpeechToText
            onFinalTranscript={(text) => {
              setInput((prev) => (prev && prev.trim() ? prev + ' ' + text : text))
            }}
          />
        </div>

        <label className="block text-sm font-medium mb-2">Article Length</label>
        <div className="flex flex-wrap gap-2 mb-6 text-sm">
          {articleLength.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedLength(item)}
              className={`article-length-option px-4 py-2 rounded-full border text-xs cursor-pointer font-medium ${
                selectedLength.text === item.text
                  ? "selected bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-md"
                  : "text-gray-600 border-gray-400 hover:border-purple-400"
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>

        <button
          disabled={loading || !input.trim()}
          type="submit"
          className={`article-button w-full p-3 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all 
    ${
      loading || !input.trim()
        ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
        : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
    }`}
        >
          {loading && (
            <span className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
          {loading ? "Generating..." : "✨ Generate Article"}
        </button>
      </form>

      {/* Right Column */}
      <div className="article-output article-card w-full max-w-lg p-6 bg-white border rounded-lg shadow-sm flex flex-col">
        <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Generated Article
        </h2>
        {!content ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-600 pulse-animation">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">Ready to create amazing content</p>
              <p className="text-xs mt-1">Enter a topic and click generate to get started...</p>
            </div>
          </div>
        ) : (
          <div className="article-content article-scroll mt-3 h-134 overflow-y-auto text-sm text-slate-600 pr-2">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
