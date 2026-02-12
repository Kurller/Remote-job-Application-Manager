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
    if (!jobResult.rows.length) return res.status(404).json({ message: "Job not found" });
    const job = jobResult.rows[0];

    // 2️⃣ Fetch base CV
    const cvResult = await pool.query(
      "SELECT filename, path FROM cvs WHERE id = $1 AND user_id = $2",
      [cv_id, userId]
    );
    if (!cvResult.rows.length) return res.status(404).json({ message: "Base CV not found" });
    const baseCV = cvResult.rows[0];

    const absoluteCVPath = path.isAbsolute(baseCV.path)
      ? baseCV.path
      : path.join(process.cwd(), baseCV.path);

    if (!fs.existsSync(absoluteCVPath)) {
      return res.status(404).json({ message: "Base CV file missing on server", path: absoluteCVPath });
    }

    // 3️⃣ Check if tailored CV already exists
    const existing = await pool.query(
      "SELECT id, filename, path, ai_summary, ai_generated FROM tailored_cvs WHERE cv_id=$1 AND job_id=$2 AND user_id=$3",
      [cv_id, job_id, userId]
    );

    const forceRegenerate = force === true;

    // Regenerate if forced or previous AI failed
    const needsRegeneration =
      !forceRegenerate &&
      existing.rows.length &&
      existing.rows[0].ai_generated === true;

    if (existing.rows.length && needsRegeneration) {
      return res.status(200).json({
        message: "Tailored CV already exists",
        tailoredCV: {
          tailoredCVId: existing.rows[0].id,
          filename: existing.rows[0].filename,
          path: existing.rows[0].path,
          ai_summary: existing.rows[0].ai_summary || "AI summary was not generated",
          ai_generated: existing.rows[0].ai_generated,
          job_id,
          jobTitle: job.title,
        },
      });
    }

    // 4️⃣ Extract text from PDF
    const dataBuffer = fs.readFileSync(absoluteCVPath);
    const pdfData = await pdfParse(dataBuffer);
    const baseText = pdfData.text || "";

    // Truncate long CVs to avoid 400 errors
    const maxChars = 1500;
    const baseTextTrimmed = baseText.length > maxChars ? baseText.slice(0, maxChars) + "..." : baseText;

    // 5️⃣ Generate AI summary using DeepSeek R1
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
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  // ✅ Use only aiResponse here
  tailoredText =
    aiResponse?.data?.choices?.[0]?.message?.content?.trim() ||
    "AI response empty; summary not generated.";

} catch (err) {
  console.error("OpenRouter API error:", err.response?.data || err.message);
  tailoredText = `AI summary failed: ${err.response?.data?.error || err.message}`;
  aiGenerated = false;
}
    }

    // 6️⃣ Generate tailored PDF
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const firstPage = pdfDoc.getPages()[0];
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    firstPage.drawText(`Tailored for: ${job.title}`, {
      x: 50,
      y: firstPage.getHeight() - 50,
      size: 18,
      font: fontBold,
      color: rgb(0, 0.2, 0.8),
    });

    firstPage.drawText(`Tailored Summary:`, {
      x: 50,
      y: firstPage.getHeight() - 80,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(tailoredText, {
      x: 50,
      y: firstPage.getHeight() - 110,
      size: 12,
      font: fontRegular,
      color: rgb(0, 0, 0),
      maxWidth: firstPage.getWidth() - 100,
    });

    // 7️⃣ Save tailored PDF
    const timestamp = Date.now();
    const ext = path.extname(baseCV.filename);
    const filename = `tailored_cv_${userId}_${job_id}_${timestamp}${ext}`;
    const tailoredDir = path.join(process.cwd(), "uploads", "tailored");
    if (!fs.existsSync(tailoredDir)) fs.mkdirSync(tailoredDir, { recursive: true });
    const tailoredPath = path.join(tailoredDir, filename);
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(tailoredPath, pdfBytes);

    // 8️⃣ Save or update DB record
    let dbResult;
    if (existing.rows.length && forceRegenerate) {
      dbResult = await pool.query(
        `UPDATE tailored_cvs
         SET ai_summary = $1,
             ai_generated = $2,
             regenerated_at = NOW()
         WHERE id = $3
         RETURNING id AS tailoredCVId, filename, path, ai_summary, ai_generated`,
        [tailoredText, aiGenerated, existing.rows[0].id]
      );
    } else {
      dbResult = await pool.query(
        `INSERT INTO tailored_cvs (user_id, filename, path, cv_id, job_id, ai_summary, ai_generated)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id AS tailoredCVId, filename, path, ai_summary, ai_generated`,
        [userId, filename, tailoredPath, cv_id, job_id, tailoredText, aiGenerated]
      );
    }

    res.status(201).json({
      ...dbResult.rows[0],
      jobTitle: job.title,
    });

  } catch (err) {
    console.error("Tailored CV error:", err.message);
    res.status(500).json({ message: "Failed to create AI-tailored CV", error: err.message });
  }
};
// GET all Tailored CVs for the logged-in user
export const getUserCVs = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT
         t.id AS tailoredCVId,
         t.filename,
         t.path,
         t.cv_id,
         t.job_id,
         t.ai_summary,
         t.ai_generated,
         t.regenerated_at,
         j.title AS jobTitle
       FROM tailored_cvs t
       JOIN jobs j ON t.job_id = j.id
       WHERE t.user_id = $1
       ORDER BY t.id DESC`,
      [userId]
    );

    res.json(result.rows.map(row => ({
      tailoredCVId: row.tailoredcvid,
      filename: row.filename,
      path: row.path,
      cv_id: row.cv_id,
      job_id: row.job_id,
      jobTitle: row.jobtitle,
      ai_summary: row.ai_summary,
      ai_generated: row.ai_generated,
      regenerated_at: row.regenerated_at
    })));
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ message: "Failed to fetch tailored CVs" });
  }
};

// Download a tailored CV
export const downloadTailoredCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      "SELECT filename, path FROM tailored_cvs WHERE id=$1 AND user_id=$2",
      [id, userId]
    );

    if (!result.rows.length) return res.status(404).json({ message: "Tailored CV not found" });

    const file = result.rows[0];
    const absolutePath = path.isAbsolute(file.path) ? file.path : path.join(process.cwd(), file.path);

    if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: "File missing on server" });

    res.download(absolutePath, file.filename);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Failed to download tailored CV" });
  }
};
