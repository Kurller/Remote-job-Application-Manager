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
      console.error("❌ Unauthorized access");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { cv_id, job_id, force } = req.body;
    const forceRegenerate = force === true || force === "true";

    console.log("📥 Input:", { userId, cv_id, job_id, forceRegenerate });

    if (!cv_id || !job_id) {
      return res.status(400).json({ message: "cv_id and job_id are required" });
    }

    /* ================= JOB ================= */
    const jobResult = await pool.query(
      "SELECT title, description FROM jobs WHERE id=$1",
      [job_id]
    );

    if (!jobResult.rows.length) {
      console.error("❌ Job not found:", job_id);
      return res.status(404).json({ message: "Job not found" });
    }

    const job = jobResult.rows[0];
    console.log("✅ Job loaded:", job.title);

    /* ================= BASE CV ================= */
    const cvResult = await pool.query(
      "SELECT filename, file_url FROM cvs WHERE id=$1 AND user_id=$2",
      [cv_id, userId]
    );

    if (!cvResult.rows.length) {
      console.error("❌ Base CV not found:", cv_id);
      return res.status(404).json({ message: "Base CV not found" });
    }

    const baseCV = cvResult.rows[0];
    console.log("📄 Base CV URL:", baseCV.file_url);

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

      const contentType = pdfResponse.headers["content-type"];
      console.log("📦 PDF content-type:", contentType);

      if (!contentType?.includes("pdf")) {
        throw new Error("File is not a PDF");
      }

      basePdfBuffer = Buffer.from(pdfResponse.data);
      console.log("✅ PDF downloaded, size:", basePdfBuffer.length);
    } catch (err) {
      console.error("❌ Failed to fetch base PDF:", err.message);
      return res.status(400).json({
        message: "Failed to fetch base CV PDF",
        error: err.message,
      });
    }

    /* ================= EXISTING CHECK ================= */
    const existing = await pool.query(
      `SELECT * FROM tailored_cvs
       WHERE cv_id=$1 AND job_id=$2 AND user_id=$3`,
      [cv_id, job_id, userId]
    );

    if (existing.rows.length && existing.rows[0].ai_generated && !forceRegenerate) {
      console.log("♻️ Reusing existing tailored CV");
      return res.status(200).json({
        message: "Tailored CV already exists",
        tailoredCV: existing.rows[0],
      });
    }

    /* ================= PDF TEXT EXTRACTION ================= */
    let baseText = "";
    try {
      const parsed = await pdfParse(basePdfBuffer);
      baseText = parsed.text?.slice(0, 1500) || "";
      console.log("📝 Extracted text length:", baseText.length);
    } catch (err) {
      console.error("⚠️ PDF parse failed:", err.message);
    }

    /* ================= AI SUMMARY ================= */
    let aiSummary = "Professional summary not generated.";
    let aiGenerated = false;

    if (baseText.trim() && process.env.OPENROUTER_API_KEY) {
      try {
        console.log("🤖 Calling OpenRouter AI");

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
            timeout: 20000,
          }
        );

        aiSummary =
          aiResponse.data?.choices?.[0]?.message?.content?.trim() ||
          aiSummary;

        aiGenerated = true;
        console.log("✅ AI summary generated");
      } catch (err) {
        console.error("⚠️ AI failed (continuing):", err.message);
      }
    }

    /* ================= PDF GENERATION ================= */
    let pdfBytes;
    try {
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

      pdfBytes = await pdfDoc.save();
      console.log("✅ PDF generated, bytes:", pdfBytes.length);
    } catch (err) {
      console.error("❌ PDF generation failed:", err.message);
      throw err;
    }

    /* ================= CLOUDINARY UPLOAD ================= */
    let upload;
    try {
      upload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "tailored_cvs",
            resource_type: "raw",
            public_id: `tailored_cv_${userId}_${job_id}_${Date.now()}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(pdfBytes);
      });

      console.log("☁️ Uploaded to Cloudinary:", upload.secure_url);
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err.message);
      throw err;
    }

    /* ================= DB SAVE ================= */
    const filename = `tailored_cv_${userId}_${job_id}.pdf`;
    let result;

    if (existing.rows.length) {
      result = await pool.query(
        `UPDATE tailored_cvs
         SET file_url=$1, ai_summary=$2, ai_generated=$3, regenerated_at=NOW()
         WHERE id=$4
         RETURNING *`,
        [upload.secure_url, aiSummary, aiGenerated, existing.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO tailored_cvs
         (user_id, filename, file_url, cv_id, job_id, ai_summary, ai_generated)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [userId, filename, upload.secure_url, cv_id, job_id, aiSummary, aiGenerated]
      );
    }

    console.log("🎉 Tailored CV created successfully");
    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("🔥 FINAL FAILURE:", err);
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
