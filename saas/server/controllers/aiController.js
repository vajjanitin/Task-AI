import axios from "axios";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import fs from 'fs'
import pdf from "pdf-parse/lib/pdf-parse.js";
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';

const FREE_USAGE_LIMIT = 10;

const incrementFreeUsage = async (userId) => {
  const user = await clerkClient.users.getUser(userId);
  const currentUsage = user.privateMetadata?.free_usage || 0;

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...user.privateMetadata,
      free_usage: currentUsage + 1,
    },
  });
};

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const { plan, free_usage } = req;

    if (plan !== "premium" && free_usage >= FREE_USAGE_LIMIT) {
      return res.json({
        success: false,
        message: "Limit reached. Please upgrade to continue",
      });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Write an informative and well-structured article on the topic with 3 to 4 related images for : "${prompt}". It should be around ${length} words. and provide 3-4 images related to the article content.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const content =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!content) {
      return res.status(500).json({
        success: false,
        message: "Gemini returned no content.",
      });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await incrementFreeUsage(userId);
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};


export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const { plan } = req;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations(user_id, prompt, content, type, publish)
              VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Image Generation Error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.response?.data?.error?.message || error.message,
    });
  }
};


export const removeBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { plan } = req;
    const image = req.file;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }

    if (!image || !image.path) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [{ effect: "background_removal" }],
    });

    await sql`INSERT INTO creations(user_id, prompt, content, type)
              VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Image Background Removal Error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.response?.data?.error?.message || error.message,
    });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { plan } = req;
    const image = req.file;
    const { object } = req.body

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }

    if (!image || !image.path) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{
        effect: `gen_remove:${object}`
      }],
      resource_type: 'image'
    })

    await sql`INSERT INTO creations(user_id, prompt, content, type)
              VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content : imageUrl });
  } catch (error) {
    console.error("Image Background Removal Error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.response?.data?.error?.message || error.message,
    });
  }
};


export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { plan } = req;
    const resume = req.file;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "File size exceeds 5MB",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `
      Review the following resume and provide detailed, constructive feedback. 
      Highlight key strengths, weaknesses, and specific areas for improvement. 
      Suggest how the candidate can make their resume more impactful and professional.

      Resume Content:
      ${pdfData.text}
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const content =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!content) {
      return res.status(500).json({
        success: false,
        message: "Gemini returned no content.",
      });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.error("Resume Review Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

export const repurposeContent = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, targetFormats } = req.body;
    const { plan, free_usage } = req;

    if (plan !== "premium" && free_usage >= FREE_USAGE_LIMIT) {
      return res.json({
        success: false,
        message: "Limit reached. Please upgrade to continue",
      });
    }

    if (!content || !targetFormats || targetFormats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content and target formats are required",
      });
    }

    const repurposedContent = {};

    // Generate content for each requested format
    for (const format of targetFormats) {
      let prompt = "";
      
      switch (format) {
        case "twitter":
          prompt = `Convert the following content into an engaging Twitter thread (5-7 tweets). 
          Each tweet should be under 280 characters. Start with a hook tweet, provide value in the middle tweets, 
          and end with a call-to-action. Use emojis where appropriate. Number each tweet.
          
          Content: ${content}`;
          break;
          
        case "linkedin":
          prompt = `Repurpose the following content into a professional LinkedIn post. 
          Make it engaging with a strong hook, include relevant insights, and end with a question 
          or call-to-action to drive engagement. Use appropriate formatting with line breaks and emojis.
          Keep it between 150-300 words.
          
          Content: ${content}`;
          break;
          
        case "email":
          prompt = `Transform the following content into an email newsletter. 
          Include a catchy subject line, a warm greeting, well-structured body with clear sections, 
          and a compelling call-to-action. Make it conversational and valuable to readers.
          
          Content: ${content}`;
          break;
          
        case "instagram":
          prompt = `Adapt the following content for an Instagram caption. 
          Make it engaging with a hook in the first line, use relevant emojis, include 5-10 relevant hashtags 
          at the end, and add a call-to-action. Keep it under 2200 characters.
          
          Content: ${content}`;
          break;
          
        case "blog":
          prompt = `Expand the following content into a comprehensive blog post. 
          Include a catchy title, introduction, well-organized sections with headings, 
          key takeaways, and a conclusion. Make it SEO-friendly and engaging. Aim for 800-1200 words.
          
          Content: ${content}`;
          break;
          
        default:
          continue;
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const generatedContent =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

      if (generatedContent) {
        repurposedContent[format] = generatedContent;
      }
    }

    // Save to database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Repurposed content to: ${targetFormats.join(', ')}`}, ${JSON.stringify(repurposedContent)}, 'repurposed-content')
    `;

    if (plan !== "premium") {
      await incrementFreeUsage(userId);
    }

    res.json({ success: true, content: repurposedContent });
  } catch (error) {
    console.error("Content Repurpose Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

export const analyzeData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { plan, free_usage } = req;
    const file = req.file;

    if (plan !== "premium" && free_usage >= FREE_USAGE_LIMIT) {
      return res.json({
        success: false,
        message: "Limit reached. Please upgrade to continue",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    let data = [];
    const fileExtension = file.originalname.split('.').pop().toLowerCase();

    // Parse CSV or Excel file
    if (fileExtension === 'csv') {
      const fileContent = fs.readFileSync(file.path, 'utf-8');
      data = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file format. Please upload CSV or Excel files.",
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data found in the file",
      });
    }

    // Prepare data summary for AI analysis
    const columns = Object.keys(data[0]);
    const rowCount = data.length;
    const sampleData = data.slice(0, 5);
    
    // Calculate basic statistics
    const numericColumns = columns.filter(col => {
      return data.slice(0, 10).every(row => !isNaN(parseFloat(row[col])));
    });

    const stats = {};
    numericColumns.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      stats[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length
      };
    });

    const prompt = `Analyze this dataset and provide:
    1. **Key Insights** (3-5 main findings from the data)
    2. **Data Summary** (overview of what the data represents)
    3. **Recommended Visualizations** (suggest 3-4 chart types with specific column recommendations)
    4. **Trends & Patterns** (notable trends or correlations)
    5. **Actionable Recommendations** (business or analytical suggestions)

    Dataset Information:
    - Total Rows: ${rowCount}
    - Columns: ${columns.join(', ')}
    - Numeric Columns: ${numericColumns.join(', ')}
    
    Statistics:
    ${JSON.stringify(stats, null, 2)}
    
    Sample Data (first 5 rows):
    ${JSON.stringify(sampleData, null, 2)}
    
    Provide a clear, structured analysis in markdown format.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const analysis =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!analysis) {
      return res.status(500).json({
        success: false,
        message: "AI returned no analysis.",
      });
    }

    // Prepare chart data
    const chartData = {
      columns,
      numericColumns,
      stats,
      sampleData: data.slice(0, 20), // Send more samples for visualization
      rowCount
    };

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Analyzed data file: ${file.originalname}`}, ${JSON.stringify({ analysis, chartData })}, 'data-analysis')
    `;

    if (plan !== "premium") {
      await incrementFreeUsage(userId);
    }

    // Clean up uploaded file
    if (file && file.path) {
      fs.unlinkSync(file.path);
    }

    res.json({ 
      success: true, 
      analysis,
      chartData 
    });
  } catch (error) {
    console.error("Data Analysis Error:", error.response?.data || error.message);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("File cleanup error:", cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};



