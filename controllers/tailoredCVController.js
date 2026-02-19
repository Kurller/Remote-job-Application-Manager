import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db/index.js";
import { extractPdfText } from "../utils/pdfText.js";
import { generateTailoredPdf } from "../utils/pdfGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTailoredCV = async (req, res) => {
  try {
    console.log("📥 Incoming request body:", req.body);

    const userId = req.user?.id;
    const { baseCvId, jobTitle, jobDescription } = req.body;

    /* ------------------ VALIDATION ------------------ */
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!baseCvId) {
      return res.status(400).json({ message: "Base CV ID is required" });
    }

    if (!jobTitle || !jobTitle.trim()) {
      return res.status(400).json({ message: "Job title is required" });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: "Job description is required" });
    }

    /* ------------------ FETCH BASE CV ------------------ */
    const cvResult = await pool.query(
      `SELECT file_url FROM cvs WHERE id = $1 AND user_id = $2`,
      [baseCvId, userId]
    );

    if (!cvResult.rows.length) {
      return res.status(404).json({ message: "Base CV not found" });
    }

    const baseCvUrl = cvResult.rows[0].file_url;

    /* ------------------ DOWNLOAD BASE CV ------------------ */
    let response;
    try {
      response = await axios.get(baseCvUrl, { responseType: "arraybuffer" });
    } catch (err) {
      console.error("❌ Failed to fetch base CV PDF:", err.message);
      return res.status(500).json({ message: "Failed to fetch base CV PDF" });
    }

    const tempDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const tempPdfPath = path.join(tempDir, `base_cv_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, response.data);

    /* ------------------ EXTRACT TEXT ------------------ */
    const baseText = await extractPdfText(tempPdfPath);
    fs.unlinkSync(tempPdfPath);

    if (!baseText || !baseText.trim()) {
      return res.status(400).json({
        message: "Failed to extract text from base CV"
      });
    }

    /* ------------------ AI SUMMARY ------------------ */
    let aiSummary = null;

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY missing in production");
    } else {
      try {
        const aiResponse = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a professional CV writer."
              },
              {
                role: "user",
                content: `
Generate a professional CV summary tailored for the role below.

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Candidate CV:
${baseText}

Keep it concise and impactful.
                `
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        aiSummary =
          aiResponse.data?.choices?.[0]?.message?.content?.trim() || null;
      } catch (err) {
        console.error("⚠️ AI summary generation failed:", err.message);
      }
    }

    /* ------------------ PDF GENERATION ------------------ */
    const pdfFilename = `tailored_cv_${userId}_${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, "../uploads/tailored-cvs");

    if (!fs.existsSync(pdfPath)) fs.mkdirSync(pdfPath, { recursive: true });

    const finalPdfPath = path.join(pdfPath, pdfFilename);

    await generateTailoredPdf({
      outputPath: finalPdfPath,
      jobTitle,
      aiSummary: aiSummary || "Professional summary not generated.",
      baseText
    });

    /* ------------------ SAVE TO DB ------------------ */
    const insertResult = await pool.query(
      `
      INSERT INTO tailored_cvs (user_id, base_cv_id, job_title, file_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, file_url
      `,
      [
        userId,
        baseCvId,
        jobTitle,
        `${process.env.BASE_URL}/uploads/tailored-cvs/${pdfFilename}`
      ]
    );

    /* ------------------ SUCCESS ------------------ */
    return res.status(201).json({
      message: "Tailored CV generated successfully",
      tailoredCv: insertResult.rows[0]
    });
  } catch (error) {
    console.error("🔥 Fatal error creating tailored CV:", error);
    return res.status(500).json({
      message: "Failed to generate tailored CV"
    });
  }
};




// GET all Tailored CVs for the logged-in user
export const getUserCVs = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         t.id AS tailoredcvid,
         
         t.file_url,
         t.cv_id,
         t.job_id,
         t.ai_summary,
         t.ai_generated,
         t.regenerated_at,
         j.title AS jobtitle
       FROM tailored_cvs t
       JOIN jobs j ON t.job_id = j.id
       WHERE t.user_id = $1
       ORDER BY t.id DESC`,
      [userId]
    );

    res.json(result.rows.map(row => ({
  tailoredCVId: row.tailoredcvid,
  file_url: row.file_url,
  cv_id: row.cv_id,
  job_id: row.job_id,
  jobTitle: row.jobtitle,
  ai_summary: row.ai_summary,
  ai_generated: row.ai_generated,
  regenerated_at: row.regenerated_at
})));

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tailored CVs" });
  }
};

// Download a tailored CV


export const downloadTailoredCV = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      "SELECT filename, file_url FROM tailored_cvs WHERE id=$1 AND user_id=$2",
      [id, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Tailored CV not found" });
    }

    const { filename, file_url } = result.rows[0];

    const response = await axios.get(file_url, {
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Failed to download tailored CV" });
  }
};
