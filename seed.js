require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    console.log('Seeding database...');

    // ---------------------------
    // 1️⃣ Create sample users
    // ---------------------------
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
    ];

    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
        [user.name, user.email, hashedPassword]
      );
    }
    console.log('✅ Users seeded');

    // ---------------------------
    // 2️⃣ Create sample jobs
    // ---------------------------
    const jobs = [
      { title: 'Frontend Developer', company: 'TechCorp', description: 'Build amazing user interfaces' },
      { title: 'Backend Developer', company: 'CodeWorks', description: 'Build scalable APIs' },
    ];

    for (let job of jobs) {
      await pool.query(
        'INSERT INTO jobs (title, company, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [job.title, job.company, job.description]
      );
    }
    console.log('✅ Jobs seeded');

    // ---------------------------
    // 3️⃣ Add sample CVs
    // ---------------------------
    // Make sure uploads folder exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // Fake CV files
    const sampleCVs = [
      { userEmail: 'john@example.com', filename: 'john_cv.pdf', originalname: 'John_CV.pdf' },
      { userEmail: 'jane@example.com', filename: 'jane_cv.docx', originalname: 'Jane_CV.docx' },
    ];

    for (let cv of sampleCVs) {
      // Get user ID
      const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [cv.userEmail]);
      const userId = userRes.rows[0].id;

      // Copy a dummy file (you can create empty files in uploads folder)
      const filePath = path.join(uploadDir, cv.filename);
      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, 'Dummy CV content');

      // Insert CV into DB
      await pool.query(
        `INSERT INTO cvs (user_id, filename, originalname, mimetype, size)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [userId, cv.filename, cv.originalname, 'application/pdf', 1024]
      );
    }

    console.log('✅ CVs seeded');

    console.log('🎉 Database seeding completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
