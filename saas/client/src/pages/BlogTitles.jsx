import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import SpeechToText from "../components/SpeechToText";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  const [selectedCategory, setSelectedCategory] = useState("General"); // fixed name
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate a blog title for the keyword ${input} in the category ${selectedCategory}`;
      setContent("");
      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        { prompt },
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
    <div className="h-full p-4 flex flex-wrap gap-4 text-gray-800">
      {/* Left Form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 border rounded bg-white"
      >
  {/* Title removed as requested */}

        <label className="block text-sm mb-1">Keyword</label>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 text-sm border rounded outline-none"
            placeholder="Write here..."
            required
          />
          <SpeechToText
            onFinalTranscript={(text) => {
              setInput((prev) => (prev && prev.trim() ? prev + ' ' + text : text))
            }}
          />
        </div>

        <label className="block text-sm mb-1">Category</label>
        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedCategory(item)} // fixed name
              className={`px-3 py-1 rounded-full border text-xs cursor-pointer ${
                selectedCategory === item
                  ? "bg-gray-200 text-black border-gray-300"
                  : "text-gray-600 border-gray-400"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          disabled={loading || !input.trim()}
          type="submit"
          className={`w-full p-2 text-sm border rounded flex justify-center items-center gap-2 transition-all 
    ${
      loading || !input.trim()
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-gray-100"
    }`}
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></span>
          )}
          {loading ? "Generating..." : "Generate Title"}
        </button>
      </form>

      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white border rounded flex flex-col">
        <h2 className="text-base mb-4">Generated Titles</h2>
        {!content ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-600">
            <p>Enter a topic and click generate to get started...</p>
          </div>
        ) : (
          <div className="mt-3 h-134 overflow-y-auto text-sm text-slate-600">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
