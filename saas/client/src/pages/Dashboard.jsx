import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import CreationItem from "../components/CreationItem";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
      setLoading(false);
    
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="h-full p-4 overflow-y-auto article-scroll">
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-4">
        <div className="article-card article-form flex flex-col justify-center items-center w-64 p-6 border rounded-lg text-center bg-white shadow-sm">
          <svg className="w-12 h-12 mb-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p className="text-sm text-gray-600 font-medium mb-1">Total Creations</p>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {loading ? "..." : creations.length}
          </h2>
        </div>

        <div className="article-card article-output flex flex-col justify-center items-center w-64 p-6 border rounded-lg text-center bg-white shadow-sm">
          <svg className="w-12 h-12 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <p className="text-sm text-gray-600 font-medium mb-1">Active Plan</p>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Premium
          </h2>
        </div>
      </div>

      {/* Recent Creations */}
      {loading ? (
        <div className="mt-8 flex flex-col items-center justify-center pulse-animation">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500 font-medium">Loading your creations...</p>
        </div>
      ) : creations.length === 0 ? (
        <div className="article-card mt-8 p-12 border rounded-lg text-center bg-white shadow-sm">
          <svg className="w-20 h-20 mx-auto mb-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-semibold text-gray-700 mb-2">No creations yet</p>
          <p className="text-sm text-gray-500">Start creating amazing content with our AI tools!</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded"></div>
            <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Recent Creations
            </p>
          </div>
          <div className="space-y-3 article-content">
            {creations.map((item, index) => (
              <div key={item.id} style={{animationDelay: `${index * 0.1}s`}}>
                <CreationItem item={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
