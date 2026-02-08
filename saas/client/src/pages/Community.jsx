import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { getToken } = useAuth();

  const fetchCreations = async () => {
    try {
      const res = await axios.get("/api/user/get-published-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (res.data.success) {
        setCreations(res.data.creations);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, []);

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <h2 className="text-base font-semibold">Creations</h2>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading creations...</p>
      ) : creations.length === 0 ? (
        <p className="text-sm text-gray-500">No creations found yet.</p>
      ) : (
        <div className="flex flex-wrap gap-4 overflow-y-auto">
          {creations.map((creation, index) => (
            <div
              key={index}
              className="w-full max-w-xs border rounded p-2 bg-white flex flex-col gap-2 shadow-sm"
            >
              <img
                src={creation.content}
                alt="creation"
                className="w-full h-48 object-cover rounded"
              />
              <p className="text-sm text-gray-700">{creation.prompt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
