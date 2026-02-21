import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import pdfParse from "pdf-parse";
import axios from "axios";

/* =========================
   CREATE / GENERATE TAILORED CV
========================= */
export const createTailoredCV = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { cv_id, job_id, force } = req.body;
    const forceRegenerate = force === true || force === "true";

    if (!cv_id || !job_id) {
      return res.status(400).json({ message: "cv_id and job_id are required" });
    }

    /* ================= JOB INFO ================= */
    const jobResult = await pool.query(
      "SELECT title, description FROM jobs WHERE id=$1",
      [job_id]
    );
    if (!jobResult.rows.length) {
      return res.status(404).json({ message: "Job not found" });
    }
    const job = jobResult.rows[0];

    /* ================= BASE CV ================= */
    const cvResult = await pool.query(
      "SELECT filename, file_url FROM cvs WHERE id=$1 AND user_id=$2",
      [cv_id, userId]
    );
    if (!cvResult.rows.length) {
      return res.status(404).json({ message: "Base CV not found" });
    }

    const baseCV = cvResult.rows[0];
    if (!baseCV.file_url) {
      return res.status(400).json({ message: "CV file_url missing" });
    }

    /* ================= FETCH PDF ================= */
    let basePdfBuffer;
    try {
      const pdfResponse = await axios.get(baseCV.file_url, {
        responseType: "arraybuffer",
        timeout: 15000,
      });

      basePdfBuffer = Buffer.from(pdfResponse.data);
    } catch (err) {
      return res.status(400).json({
        message: "Failed to fetch base CV PDF",
        error: err.message,
      });
    }

    /* ================= EXISTING CV CHECK ================= */
    const existing = await pool.query(
      `SELECT * FROM tailored_cvs 
       WHERE cv_id=$1 AND job_id=$2 AND user_id=$3`,
      [cv_id, job_id, userId]
    );

    if (
      existing.rows.length &&
      existing.rows[0].ai_generated === true &&
      !forceRegenerate
    ) {
      const row = existing.rows[0];
      return res.status(200).json({
        id: row.id,
        filename: row.filename,
        file_url: row.file_url,
        ai_summary: row.ai_summary,
        job_title: job.title,
      });
    }

    /* ================= PDF TEXT EXTRACTION ================= */
    let baseText = "";
    try {
      const parsed = await pdfParse(basePdfBuffer);
      baseText = parsed.text?.slice(0, 1500) || "";
    } catch {
      // non-fatal
    }

    /* ================= AI SUMMARY ================= */
    let aiSummary = "Professional summary not generated.";
    let aiGenerated = false;

    if (baseText.trim() && process.env.OPENROUTER_API_KEY) {
      try {
        const aiResponse = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Tailor this CV for the job.\n\nJob: ${job.title}\nDescription: ${job.description}\nCV:\n${baseText}`,
              },
            ],
            max_tokens: 700,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        aiSummary =
          aiResponse.data?.choices?.[0]?.message?.content?.trim() ||
          aiSummary;
        aiGenerated = true;
      } catch {
        // non-fatal
      }
    }

    /* ================= PDF GENERATION ================= */
    const pdfDoc = await PDFDocument.load(basePdfBuffer);
    let page = pdfDoc.getPages()[0];

    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`Tailored for: ${job.title}`, {
      x: 50,
      y: page.getHeight() - 50,
      size: 18,
      font: bold,
      color: rgb(0, 0.2, 0.8),
    });

    page.drawText("Professional Summary:", {
      x: 50,
      y: page.getHeight() - 80,
      size: 14,
      font: bold,
    });

    let y = page.getHeight() - 110;
    for (const line of aiSummary.match(/.{1,90}/g) || []) {
      if (y < 50) {
        page = pdfDoc.addPage();
        y = page.getHeight() - 50;
      }
      page.drawText(line, { x: 50, y, size: 12, font: regular });
      y -= 16;
    }

    const pdfBytes = await pdfDoc.save();

    /* ================= CLOUDINARY ================= */
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "cvs",
          resource_type: "raw",
          access_mode: "public",
          public_id: `tailored_cv_${userId}_${job_id}_${Date.now()}`,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(pdfBytes);
    });

    /* ================= DB SAVE ================= */
    const filename = `tailored_cv_${userId}_${job_id}.pdf`;
    let saved;

    if (existing.rows.length) {
      saved = await pool.query(
        `UPDATE tailored_cvs 
         SET file_url=$1, ai_summary=$2, ai_generated=$3, regenerated_at=NOW()
         WHERE id=$4
         RETURNING *`,
        [upload.secure_url, aiSummary, aiGenerated, existing.rows[0].id]
      );
    } else {
      saved = await pool.query(
        `INSERT INTO tailored_cvs 
         (user_id, filename, file_url, cv_id, job_id, ai_summary, ai_generated)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [userId, filename, upload.secure_url, cv_id, job_id, aiSummary, aiGenerated]
      );
    }

    const row = saved.rows[0];

    return res.status(201).json({
      id: row.id,
      filename: row.filename,
      file_url: row.file_url,
      ai_summary: row.ai_summary,
      job_title: job.title,
    });
  } catch (err) {
    console.error("Tailored CV generation failed:", err);
    return res.status(500).json({
      message: "Failed to generate tailored CV",
      error: err.message,
    });
  }
};
/* =========================
   GET ALL TAILORED CVs FOR USER
========================= */
export const getUserCVs = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT t.id, t.file_url, t.cv_id, t.job_id, t.ai_summary, t.ai_generated, t.regenerated_at, j.title AS job_title
       FROM tailored_cvs t
       JOIN jobs j ON t.job_id = j.id
       WHERE t.user_id=$1 ORDER BY t.id DESC`,
      [userId]
    );

    res.json(result.rows); // Each row now has `id`
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tailored CVs" });
  }
};

/* =========================
   DOWNLOAD TAILORED CV
========================= */
export const downloadTailoredCV = async (req, res) => {
  try {
    const rawId = req.params.id;
    const userId = req.user?.id;

    const cvId = Number(rawId);
    if (!Number.isInteger(cvId)) {
      return res.status(400).json({ message: "Invalid CV ID" });
    }

    const result = await pool.query(
      "SELECT file_url, filename FROM tailored_cvs WHERE id=$1 AND user_id=$2",
      [cvId, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Tailored CV not found" });
    }

    const { file_url, filename } = result.rows[0];

    const response = await axios.get(file_url, { responseType: "stream" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || "tailoredCV.pdf"}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    response.data.pipe(res);
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ message: "Failed to download tailored CV" });
  }
};