import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
const ReviewResume = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", input);
      setContent("");

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

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
        encType="multipart/form-data"
        className="article-form article-card w-full max-w-lg p-6 border rounded-lg bg-white shadow-sm"
      >
        <h1 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Resume Reviewer
        </h1>

        <label className="block text-sm font-medium mb-2">Upload Resume</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setInput(e.target.files[0])}
          className="article-input w-full p-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 font-light mb-6">
          Upload in PDF format only
        </p>
        <button
          disabled={loading || !input}
          type="submit"
          className={`article-button w-full p-3 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all ${
            loading || !input
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          }`}
        >
          {loading && (
            <span className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
          {loading ? "Reviewing..." : "📄 Review Resume"}
        </button>
      </form>

      {/* Right Column */}
      <div className="article-output article-card w-full max-w-lg p-6 bg-white border rounded-lg shadow-sm flex flex-col">
        <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Analysis Results
        </h2>
        {!content ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-600 pulse-animation">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">Get expert resume feedback</p>
              <p className="text-xs mt-1">Upload your resume to get started...</p>
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

export default ReviewResume;
