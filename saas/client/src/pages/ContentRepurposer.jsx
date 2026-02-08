import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import SpeechToText from "../components/SpeechToText";
import { Twitter, Linkedin, Mail, Instagram, FileText, Copy, Check } from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ContentRepurposer = () => {
  const formats = [
    { id: "twitter", name: "Twitter Thread", icon: Twitter, color: "from-blue-400 to-blue-600" },
    { id: "linkedin", name: "LinkedIn Post", icon: Linkedin, color: "from-blue-600 to-blue-800" },
    { id: "email", name: "Email Newsletter", icon: Mail, color: "from-purple-500 to-purple-700" },
    { id: "instagram", name: "Instagram Caption", icon: Instagram, color: "from-pink-500 to-orange-500" },
    { id: "blog", name: "Blog Post", icon: FileText, color: "from-green-500 to-green-700" },
  ];

  const [input, setInput] = useState("");
  const [selectedFormats, setSelectedFormats] = useState(["twitter", "linkedin", "email"]);
  const [loading, setLoading] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState({});
  const [copiedFormat, setCopiedFormat] = useState(null);

  const { getToken } = useAuth();

  const toggleFormat = (formatId) => {
    setSelectedFormats((prev) => {
      if (prev.includes(formatId)) {
        return prev.filter((id) => id !== formatId);
      } else {
        return [...prev, formatId];
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (selectedFormats.length === 0) {
      toast.error("Please select at least one format");
      return;
    }

    try {
      setLoading(true);
      setRepurposedContent({});
      
      const { data } = await axios.post(
        "/api/ai/repurpose-content",
        { content: input, targetFormats: selectedFormats },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      
      if (data.success) {
        setRepurposedContent(data.content);
        toast.success("Content repurposed successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    setLoading(false);
  };

  const copyToClipboard = async (format, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFormat(format);
      toast.success(`${formats.find(f => f.id === format)?.name} copied!`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="w-full min-h-full p-4 flex flex-wrap gap-4 text-gray-800 bg-gray-100">
      {/* Left Form Section */}
      <form
        onSubmit={onSubmitHandler}
        className="article-form article-card w-full max-w-lg p-6 border rounded-lg bg-white shadow-sm"
      >
        <h1 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Content Repurposer
        </h1>

        <label className="block text-sm font-medium mb-2">Original Content</label>
        <div className="flex items-start gap-2 mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="article-input flex-1 p-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Paste your blog post, article, or any content you want to repurpose..."
            rows={8}
            required
          />
          <div className="pt-2">
            <SpeechToText
              onFinalTranscript={(text) => {
                setInput((prev) => (prev && prev.trim() ? prev + ' ' + text : text))
              }}
            />
          </div>
        </div>

        <label className="block text-sm font-medium mb-3">Select Target Formats</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {formats.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormats.includes(format.id);
            
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => toggleFormat(format.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${format.color} text-white border-transparent shadow-md`
                    : "text-gray-600 border-gray-400 hover:border-purple-400 hover:shadow"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {format.name}
              </button>
            );
          })}
        </div>

        <button
          disabled={loading || !input.trim() || selectedFormats.length === 0}
          type="submit"
          className={`article-button w-full p-3 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all ${
            loading || !input.trim() || selectedFormats.length === 0
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          }`}
        >
          {loading && (
            <span className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
          {loading ? "Repurposing..." : "🎯 Repurpose Content"}
        </button>
      </form>

      {/* Right Output Section */}
      <div className="article-output article-card w-full max-w-lg p-6 bg-white border rounded-lg shadow-sm flex flex-col">
        <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Repurposed Content
        </h2>
        
        {Object.keys(repurposedContent).length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-600 pulse-animation">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <p className="font-medium">Ready to Repurpose Your Content</p>
              <p className="text-xs mt-1">Select formats and click generate...</p>
            </div>
          </div>
        ) : (
          <div className="article-content article-scroll overflow-y-auto flex-1 space-y-3 pr-2">
            {selectedFormats.map((formatId) => {
              const format = formats.find((f) => f.id === formatId);
              const content = repurposedContent[formatId];
              const Icon = format?.icon;
              
              if (!content) return null;

              return (
                <div
                  key={formatId}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-all bg-white"
                >
                  {/* Format Header */}
                  <div className={`flex items-center justify-between p-3 bg-gradient-to-r ${format.color}`}>
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white/20 backdrop-blur-sm">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">{format.name}</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(formatId, content)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
                      title="Copy to clipboard"
                    >
                      {copiedFormat === formatId ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  
                  {/* Format Content */}
                  <div className="p-4 max-h-80 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
                    <div className="text-xs text-slate-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-sm prose-headings:font-semibold prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <Markdown>{content}</Markdown>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentRepurposer;
