import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import SpeechToText from "../components/SpeechToText";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState(null);
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (object.trim().split(" ").length > 1) {
      toast.error("Please enter only one object name");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object.trim());
      setContent("");

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data",
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

  const isInvalid = !input || object.trim().split(" ").length > 1;

  return (
    <div className="h-full p-4 flex flex-wrap gap-4 text-gray-800">
      {/* Left Form */}
      <form
        onSubmit={onSubmitHandler}
        encType="multipart/form-data"
        className="article-form article-card w-full max-w-lg p-6 border rounded-lg bg-white shadow-sm"
      >
        <h1 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Object Removal
        </h1>

        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setInput(e.target.files[0])}
          className="article-input w-full p-3 text-sm border rounded-lg outline-none mb-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mb-6">
          Supports JPG, PNG, and other image formats
        </p>

        <label className="block text-sm font-medium mb-2">
          Describe the object to remove
        </label>
        <div className="flex items-start gap-2 mb-2">
          <textarea
            value={object}
            onChange={(e) => setObject(e.target.value)}
            className="article-input flex-1 p-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., person, tree, dog"
            rows={3}
            required
          />
          <div className="pt-2">
            <SpeechToText
              onFinalTranscript={(text) => {
                const first = (text || '').trim().split(/\s+/)[0] || ''
                if (first) setObject(first)
              }}
            />
          </div>
        </div>
        {object.trim().split(" ").length > 1 && (
          <p className="text-xs text-red-500 mb-4 font-medium">
            ⚠️ Please enter only one object name.
          </p>
        )}

        <button
          disabled={loading || isInvalid}
          type="submit"
          className={`article-button w-full p-3 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all ${
            loading || isInvalid
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          }`}
        >
          {loading && (
            <span className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
          {loading ? "Removing..." : "🎯 Remove Object"}
        </button>
      </form>

      {/* Right Column */}
      <div className="article-output article-card w-full max-w-lg p-6 bg-white border rounded-lg shadow-sm flex flex-col">
        <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Generated Image
        </h2>
        {!content ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-600 min-h-[300px] pulse-animation">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="font-medium">Remove unwanted objects</p>
              <p className="text-xs mt-1">Upload an image to get started...</p>
            </div>
          </div>
        ) : (
          <div className="article-content mt-3 text-sm text-slate-600 flex justify-center">
            <img
              src={content}
              alt="Generated image"
              className="w-[600px] max-h-[500px] object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveObject;
