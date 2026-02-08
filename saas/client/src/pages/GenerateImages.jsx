import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import SpeechToText from "../components/SpeechToText";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const ImageStyle = [
    "Realistic",
    "Ghibli Style",
    "Anime Style",
    "Cartoon Style",
    "Fantasy Style",
    "3D Style",
    "Portrait",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate an image of ${input} in the style ${selectedStyle}`;
      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt, publish },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        const newImage = {
          id: Date.now(),
          url: data.content,
          prompt: input,
          style: selectedStyle,
        };
        setImages((prev) => [newImage, ...prev]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const toggleImageSelection = (imageId, e) => {
    // If clicking with Ctrl/Cmd key, toggle selection
    if (e.ctrlKey || e.metaKey) {
      setSelectedImages((prev) => {
        if (prev.includes(imageId)) {
          return prev.filter((id) => id !== imageId);
        } else {
          return [...prev, imageId];
        }
      });
    } else {
      // Otherwise, zoom the image
      const image = images.find(img => img.id === imageId);
      setZoomedImage(image);
    }
  };

  const selectAllImages = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map((img) => img.id));
    }
  };

  const deleteSelectedImages = () => {
    setImages((prev) => prev.filter((img) => !selectedImages.includes(img.id)));
    setSelectedImages([]);
    toast.success(`Deleted ${selectedImages.length} image(s)`);
  };

  return (
    <div className="w-full min-h-full p-4 flex flex-wrap gap-4 text-gray-800 bg-gray-100">
      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-5xl max-h-[90vh] animate-zoomIn">
            <img
              src={zoomedImage.url}
              alt={zoomedImage.prompt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <p className="text-white font-semibold text-lg mb-1">{zoomedImage.prompt}</p>
              <p className="text-gray-300 text-sm">{zoomedImage.style}</p>
            </div>
          </div>
        </div>
      )}

      {/* Left Form */}
      <form
        onSubmit={onSubmitHandler}
        className="article-form article-card w-full max-w-lg p-6 border rounded-lg bg-white shadow-sm"
      >
        <h1 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Image Generator
        </h1>

        <label className="block text-sm font-medium mb-2">Describe your image</label>
        <div className="flex items-start gap-2 mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="article-input flex-1 p-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe the image you want to create..."
            rows={4}
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

        <label className="block text-sm font-medium mb-2">Style</label>
        <div className="flex flex-wrap gap-2 mb-6 text-sm">
          {ImageStyle.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedStyle(item)}
              className={`article-length-option px-4 py-2 rounded-full border text-xs cursor-pointer font-medium ${
                selectedStyle === item
                  ? "selected bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent shadow-md"
                  : "text-gray-600 border-gray-400 hover:border-purple-400"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="publish"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="w-4 h-4 accent-purple-600"
          />
          <label htmlFor="publish" className="text-sm font-medium">
            Make this image public
          </label>
        </div>

        <button
          disabled={loading || !input.trim()}
          type="submit"
          className={`article-button w-full p-3 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all ${
            loading || !input.trim()
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          }`}
        >
          {loading && (
            <span className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
          {loading ? "Generating..." : "🎨 Generate Image"}
        </button>
      </form>

      {/* Right Column */}
      <div className="article-output article-card w-full max-w-lg p-6 bg-white border rounded-lg shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Generated Images ({images.length})
          </h2>
          {images.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={selectAllImages}
                className="text-xs px-3 py-1 rounded-lg border border-purple-400 text-purple-600 hover:bg-purple-50 transition-all"
              >
                {selectedImages.length === images.length ? "Deselect All" : "Select All"}
              </button>
              {selectedImages.length > 0 && (
                <button
                  onClick={deleteSelectedImages}
                  className="text-xs px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  Delete ({selectedImages.length})
                </button>
              )}
            </div>
          )}
        </div>
        
        {images.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-600 pulse-animation">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">Ready to create stunning visuals</p>
              <p className="text-xs mt-1">Describe your image and click generate...</p>
            </div>
          </div>
        ) : (
          <div className="article-content article-scroll overflow-y-auto max-h-[500px] grid grid-cols-2 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative rounded-lg overflow-hidden transition-all group ${
                  selectedImages.includes(image.id)
                    ? "ring-4 ring-purple-500 ring-offset-2"
                    : "hover:ring-2 hover:ring-purple-300"
                }`}
              >
                <img
                  src={image.url}
                  alt={`${image.prompt} in ${image.style}`}
                  className="w-full h-40 object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                  onClick={(e) => toggleImageSelection(image.id, e)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium truncate">{image.style}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImages((prev) => {
                      if (prev.includes(image.id)) {
                        return prev.filter((id) => id !== image.id);
                      } else {
                        return [...prev, image.id];
                      }
                    });
                  }}
                  className={`absolute top-2 right-2 rounded-full p-1 transition-all ${
                    selectedImages.includes(image.id)
                      ? "bg-purple-500 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImages;
