import { pool } from "../config/db.js";
import path from "path";
import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import pdfParse from "pdf-parse";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();



export const createTailoredCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cv_id, job_id, force } = req.body;

    if (!cv_id || !job_id) {
      return res.status(400).json({ message: "cv_id and job_id are required" });
    }

    // 1️⃣ Fetch job info
    const jobResult = await pool.query(
      "SELECT title, description FROM jobs WHERE id = $1",
      [job_id]
    );
    if (!jobResult.rows.length) {
      return res.status(404).json({ message: "Job not found" });
    }
    const job = jobResult.rows[0];

    // 2️⃣ Fetch base CV (URL-based)
    const cvResult = await pool.query(
      "SELECT filename, file_url FROM cvs WHERE id = $1 AND user_id = $2",
      [cv_id, userId]
    );
    if (!cvResult.rows.length) {
      return res.status(404).json({ message: "Base CV not found" });
    }
    const baseCV = cvResult.rows[0];

    if (!baseCV.file_url) {
      return res.status(400).json({ message: "CV file_url missing in database" });
    }

    // 3️⃣ Fetch PDF from Cloudinary / URL
    let dataBuffer;
    try {
      const response = await axios.get(baseCV.file_url, {
        responseType: "arraybuffer",
      });
      dataBuffer = Buffer.from(response.data);
    } catch (err) {
      return res.status(404).json({
        message: "Failed to fetch base CV from file_url",
        file_url: baseCV.file_url,
      });
    }

    // 4️⃣ Check if tailored CV already exists
    const existing = await pool.query(
      `SELECT id, filename, file_url, ai_summary, ai_generated
       FROM tailored_cvs
       WHERE cv_id=$1 AND job_id=$2 AND user_id=$3`,
      [cv_id, job_id, userId]
    );

    const forceRegenerate = force === true;
    const reuseExisting =
      existing.rows.length &&
      existing.rows[0].ai_generated === true &&
      !forceRegenerate;

    if (reuseExisting) {
      return res.status(200).json({
        message: "Tailored CV already exists",
        tailoredCV: {
          tailoredCVId: existing.rows[0].id,
          filename: existing.rows[0].filename,
          file_url: existing.rows[0].file_url,
          ai_summary: existing.rows[0].ai_summary,
          ai_generated: existing.rows[0].ai_generated,
          job_id,
          jobTitle: job.title,
        },
      });
    }

    // 5️⃣ Extract text from PDF
    const pdfData = await pdfParse(dataBuffer);
    const baseText = pdfData.text || "";

    const maxChars = 1500;
    const baseTextTrimmed =
      baseText.length > maxChars
        ? baseText.slice(0, maxChars) + "..."
        : baseText;

    // 6️⃣ Generate AI summary
    let tailoredText = "";
    let aiGenerated = true;

    if (!baseTextTrimmed.trim()) {
      tailoredText = "Base CV is empty; AI summary not generated.";
      aiGenerated = false;
    } else {
      const prompt = `
Tailor this CV perfectly for the job:

Job Title: ${job.title}
Job Description: ${job.description || ""}
Base CV Content: ${baseTextTrimmed}

Generate a concise, professional CV highlighting relevant skills, experience, and achievements.
      `;

      try {
        const aiResponse = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        tailoredText =
          aiResponse?.data?.choices?.[0]?.message?.content?.trim() ||
          "AI response empty; summary not generated.";
      } catch (err) {
        console.error("AI error:", err.response?.data || err.message);
        tailoredText = "AI summary failed.";
        aiGenerated = false;
      }
    }

    // 7️⃣ Generate tailored PDF (in memory)
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const page = pdfDoc.getPages()[0];
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`Tailored for: ${job.title}`, {
      x: 50,
      y: page.getHeight() - 50,
      size: 18,
      font: bold,
      color: rgb(0, 0.2, 0.8),
    });

    page.drawText("Tailored Summary:", {
      x: 50,
      y: page.getHeight() - 80,
      size: 14,
      font: bold,
    });

    page.drawText(tailoredText, {
      x: 50,
      y: page.getHeight() - 110,
      size: 12,
      font: regular,
      maxWidth: page.getWidth() - 100,
    });

    const pdfBytes = await pdfDoc.save();

    // ⚠️ TODO (recommended):
    // Upload pdfBytes to Cloudinary and get file_url
    const tailoredFileUrl = baseCV.file_url; // placeholder

    // 8️⃣ Save DB record
    let dbResult;
    if (existing.rows.length) {
      dbResult = await pool.query(
        `UPDATE tailored_cvs
         SET ai_summary=$1, ai_generated=$2, regenerated_at=NOW()
         WHERE id=$3
         RETURNING id AS tailoredCVId, filename, file_url, ai_summary, ai_generated`,
        [tailoredText, aiGenerated, existing.rows[0].id]
      );
    } else {
      dbResult = await pool.query(
        `INSERT INTO tailored_cvs
         (user_id, filename, file_url, cv_id, job_id, ai_summary, ai_generated)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id AS tailoredCVId, filename, file_url, ai_summary, ai_generated`,
        [
          userId,
          `tailored_cv_${userId}_${job_id}.pdf`,
          tailoredFileUrl,
          cv_id,
          job_id,
          tailoredText,
          aiGenerated,
        ]
      );
    }

    res.status(201).json({
      ...dbResult.rows[0],
      jobTitle: job.title,
    });
  } catch (err) {
    console.error("Tailored CV error:", err.message);
    res.status(500).json({ message: "Failed to create AI-tailored CV" });
  }
};// GET all Tailored CVs for the logged-in user
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
    const userId = req.user.id;
    const { id } = req.params;

    // Fetch tailored CV record
    const result = await pool.query(
      "SELECT filename, file_url FROM tailored_cvs WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Tailored CV not found" });
    }

    const { filename, file_url } = result.rows[0];

    if (!file_url) {
      return res.status(404).json({ message: "Tailored CV file URL is missing" });
    }

    // Fetch the remote PDF as a stream
    const response = await axios.get(file_url, { responseType: "stream" });

    // Set headers to force download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF stream to the response
    response.data.pipe(res);

  } catch (err) {
    console.error("Download Tailored CV error:", err.message);
    res.status(500).json({ message: "Failed to download tailored CV" });
  }
};

