import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import { Upload, FileSpreadsheet, BarChart3, TrendingUp, Download } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const DataVisualizer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [chartData, setChartData] = useState(null);
  const [selectedChart, setSelectedChart] = useState("bar");

  const { getToken } = useAuth();

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        toast.error("Please upload a CSV or Excel file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setAnalysis("");
      setChartData(null);

      const formData = new FormData();
      formData.append("datafile", file);

      const { data } = await axios.post(
        "/api/ai/analyze-data",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setAnalysis(data.analysis);
        setChartData(data.chartData);
        toast.success("Data analyzed successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    setLoading(false);
  };

  const generateChartData = () => {
    if (!chartData || !chartData.numericColumns.length) return null;

    const column = chartData.numericColumns[0];
    const labels = chartData.sampleData.map((row, idx) => `Row ${idx + 1}`);
    const values = chartData.sampleData.map(row => parseFloat(row[column]) || 0);

    return {
      labels,
      datasets: [
        {
          label: column,
          data: values,
          backgroundColor: [
            'rgba(80, 68, 229, 0.6)',
            'rgba(139, 122, 255, 0.6)',
            'rgba(90, 144, 255, 0.6)',
            'rgba(123, 104, 238, 0.6)',
            'rgba(106, 90, 205, 0.6)',
          ],
          borderColor: [
            'rgba(80, 68, 229, 1)',
            'rgba(139, 122, 255, 1)',
            'rgba(90, 144, 255, 1)',
            'rgba(123, 104, 238, 1)',
            'rgba(106, 90, 205, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartData?.numericColumns[0] || 'Data Visualization',
      },
    },
  };

  return (
    <div className="w-full min-h-full p-4 flex flex-wrap gap-4 text-gray-800 bg-gray-100">
      {/* Left Form Section */}
      <form
        onSubmit={onSubmitHandler}
        className="article-form article-card w-full max-w-lg p-6 border rounded-lg bg-white shadow-sm h-fit"
      >
        <h1 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Data Visualizer
        </h1>

        <label className="block text-sm font-medium mb-2">Upload Your Data</label>
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-all">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-purple-500 mb-3" />
              <p className="text-sm font-medium mb-1">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">
                CSV or Excel files (XLSX, XLS)
              </p>
            </label>
          </div>
        </div>

        {file && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          disabled={loading || !file}
          type="submit"
          className={`article-button w-full p-3 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all ${
            loading || !file
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          }`}
        >
          {loading && (
            <span className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
          {loading ? "Analyzing..." : "📊 Analyze Data"}
        </button>
      </form>

      {/* Right Output Section */}
      <div className="article-output article-card w-full max-w-lg p-6 bg-white border rounded-lg shadow-sm flex flex-col min-h-[600px]">
        <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Analysis & Insights
        </h2>

        {!analysis && !chartData ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-600 pulse-animation">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <p className="font-medium">Ready to Analyze Your Data</p>
              <p className="text-xs mt-1">Upload a spreadsheet to get started...</p>
            </div>
          </div>
        ) : (
          <div className="article-content article-scroll overflow-y-auto flex-1 space-y-4 pr-2">
            {/* AI Analysis */}
            {analysis && (
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-600 to-blue-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <h3 className="text-sm font-semibold text-white">AI Insights</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-gray-50 to-white max-h-80 overflow-y-auto">
                  <div className="text-xs text-slate-700 leading-relaxed prose prose-sm max-w-none">
                    <Markdown>{analysis}</Markdown>
                  </div>
                </div>
              </div>
            )}

            {/* Data Visualization */}
            {chartData && chartData.numericColumns.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-white" />
                    <h3 className="text-sm font-semibold text-white">Data Visualization</h3>
                  </div>
                  <select
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value)}
                    className="text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/30"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
                <div className="p-4 bg-white" style={{ height: '300px' }}>
                  {selectedChart === 'bar' && <Bar data={generateChartData()} options={chartOptions} />}
                  {selectedChart === 'line' && <Line data={generateChartData()} options={chartOptions} />}
                  {selectedChart === 'pie' && <Pie data={generateChartData()} options={chartOptions} />}
                </div>
              </div>
            )}

            {/* Data Summary */}
            {chartData && (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-700">
                  <h3 className="text-sm font-semibold text-white">Data Summary</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-white rounded border">
                      <p className="text-gray-600">Total Rows</p>
                      <p className="text-lg font-bold text-purple-600">{chartData.rowCount}</p>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <p className="text-gray-600">Columns</p>
                      <p className="text-lg font-bold text-purple-600">{chartData.columns.length}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">Columns:</p>
                    <p className="text-xs font-medium">{chartData.columns.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizer;
