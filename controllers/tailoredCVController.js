import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import pdfParse from "pdf-parse";
import axios from "axios";

export const createTailoredCV = async (req, res) => {
  console.log("🚀 createTailoredCV started");

  try {
    /* ================= AUTH ================= */
    const userId = req.user?.id;
    if (!userId) {
      console.error("❌ Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { cv_id, job_id, force } = req.body;
    const forceRegenerate = force === true || force === "true";

    if (!cv_id || !job_id) {
      return res.status(400).json({
        message: "cv_id and job_id are required",
      });
    }

    /* ================= ENV CHECK ================= */
    const hasAIKey = Boolean(process.env.OPENROUTER_API_KEY);
    console.log("🔑 AI key present:", hasAIKey);

    /* ================= JOB ================= */
    const jobRes = await pool.query(
      "SELECT title, description FROM jobs WHERE id=$1",
      [job_id]
    );

    if (!jobRes.rows.length) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = jobRes.rows[0];

    /* ================= BASE CV ================= */
    const cvRes = await pool.query(
      "SELECT filename, file_url FROM cvs WHERE id=$1 AND user_id=$2",
      [cv_id, userId]
    );

    if (!cvRes.rows.length) {
      return res.status(404).json({ message: "Base CV not found" });
    }

    const baseCV = cvRes.rows[0];
    if (!baseCV.file_url) {
      return res.status(400).json({ message: "CV file_url missing" });
    }

    /* ================= FETCH PDF ================= */
    let basePdfBuffer;
    try {
      const response = await axios.get(baseCV.file_url, {
        responseType: "arraybuffer",
        timeout: 15000,
      });

      basePdfBuffer = Buffer.from(response.data);
      console.log("📄 Base CV fetched:", basePdfBuffer.length);
    } catch (err) {
      console.error("❌ CV fetch failed:", err.message);
      return res.status(400).json({
        message: "Failed to fetch base CV PDF",
      });
    }

    /* ================= EXISTING CHECK ================= */
    const existing = await pool.query(
      `SELECT * FROM tailored_cvs
       WHERE cv_id=$1 AND job_id=$2 AND user_id=$3`,
      [cv_id, job_id, userId]
    );

    if (existing.rows.length && existing.rows[0].ai_generated && !forceRegenerate) {
      return res.status(200).json({
        message: "Tailored CV already exists",
        tailoredCV: existing.rows[0],
      });
    }

    /* ================= PDF TEXT ================= */
    let baseText = "";
    try {
      const parsed = await pdfParse(basePdfBuffer);
      baseText = parsed.text?.slice(0, 1500) || "";
      console.log("📝 Extracted text length:", baseText.length);
    } catch {
      console.warn("⚠️ PDF text extraction failed");
    }

    /* ================= AI SUMMARY ================= */
    let aiSummary = "Professional summary not generated.";
    let aiGenerated = false;

    if (baseText.trim() && hasAIKey) {
      try {
        console.log("🤖 Calling OpenRouter");

        const aiRes = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Create a concise professional summary tailored for this job.

Job Title: ${job.title}
Job Description: ${job.description || "N/A"}

CV:
${baseText}`,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          }
        );

        aiSummary =
          aiRes.data?.choices?.[0]?.message?.content?.trim() || aiSummary;
        aiGenerated = true;
        console.log("✅ AI summary generated");
      } catch (err) {
        console.error("⚠️ AI failed:", err.response?.data || err.message);
      }
    } else {
      console.warn("⚠️ AI skipped (missing key or empty text)");
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

    const lines = aiSummary.match(/.{1,90}/g) || [];
    let y = page.getHeight() - 110;

    for (const line of lines) {
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
          folder: "tailored_cvs",
          resource_type: "raw",
          access_mode: "public",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(pdfBytes);
    });

    /* ================= DB SAVE ================= */
    const filename = `tailored_cv_${userId}_${job_id}.pdf`;

    const result = existing.rows.length
      ? await pool.query(
          `UPDATE tailored_cvs
           SET file_url=$1, ai_summary=$2, ai_generated=$3, regenerated_at=NOW()
           WHERE id=$4 RETURNING *`,
          [upload.secure_url, aiSummary, aiGenerated, existing.rows[0].id]
        )
      : await pool.query(
          `INSERT INTO tailored_cvs
           (user_id, filename, file_url, cv_id, job_id, ai_summary, ai_generated)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [userId, filename, upload.secure_url, cv_id, job_id, aiSummary, aiGenerated]
        );

    console.log("🎉 Tailored CV created");
    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("🔥 FATAL:", err);
    return res.status(500).json({
      message: "Failed to generate tailored CV",
      error: err.message,
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
