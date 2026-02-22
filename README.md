# Remote Job Application Manager (Backend)

The backend service for the **Remote Job Application Manager** application. It provides RESTful APIs for authentication, job management, job applications, and CV handling. The backend is built with Node.js and Express, uses PostgreSQL for data persistence, and integrates Cloudinary for CV storage.

---

## 🚀 Features

* **JWT Authentication** (Access & Refresh tokens)
* **Role-based access control** (User / Admin)
* **Job management APIs**
* **Job application tracking**
* **CV upload & secure download (PDF)**
* **PostgreSQL database integration**
* **Production-ready deployment on Render**

---

## 🧱 Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL** (Render managed database)
* **JWT** (jsonwebtoken)
* **Cloudinary** (file storage for CVs)
* **Multer** (file uploads)
* **dotenv** (environment variables)

---

## 📁 Project Structure

```text
backend/
│── controllers/
│   ├── auth.controller.js
│   ├── job.controller.js
│   ├── application.controller.js
│   ├── cvController.js
    ├── TailoredCVController.js
│
│── middleware/
│   ├── auth.middleware.js
│   ├── admin.middleware.js
│
│── routes/
│   ├── auth.routes.js
│   ├── job.routes.js
│   ├── application.routes.js
│   ├── cvRoutes.js
    ├── TailoredCVRoutes.js
│
│── config/
│   ├── db.js
│   ├── cloudinary.js
│
│── utils/
│   ├── uploadBufferToCloudinary.js
│
│── server.js
│── package.json
│── .env
```

---

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend validates credentials
3. JWT access token is issued
4. Token is required in the `Authorization` header:

```http
Authorization: Bearer <token>
```

5. Protected routes validate token via middleware

---

## 🚦 Roles & Permissions

### User

* Register & login
* View available jobs
* Apply for jobs
* Upload CV
* Download own CV

### Admin

* View all job applications
* Review and track application status
* Download any submitted CV

Role checks are enforced via middleware.

---

## 📡 API Endpoints

### 🔑 Auth

```http
POST /auth/register
POST /auth/login
POST /auth/refresh-token
```

### 💼 Jobs

```http
GET  /jobs
POST /jobs            (admin)
```

### 📄 Applications

```http
POST /applications
GET  /applications/user
GET  /applications/all    (admin)
```

### 📎 CVs

```http
POST /cvs/upload
GET  /cvs/download/:id
```
### 📎 TailoredCVs

```http
POST /tailored-cvs
GET  /tailored-cvs/download/:id
GET /tailored-cvs
```
---

## 🧪 Database Schema (Overview)

### users

* id
* name
* email
* password
* role
* created_at

### jobs

* id
* title
* company
* description

### applications

* id
* user_id
* job_id
* cv_id
* status
* applied_at

### cvs

* id
* user_id
* filename
* file_url
* created_at

---

## ⚙️ Environment Variables

Create a `.env` file in the backend root:

```env
# =========================
# Server / Deployment
# =========================
PORT=10000
NODE_ENV=production
FRONTEND_URLS=http://localhost:5173,https://remote-job-frontend.vercel.app


# =========================
# Database (Render.com Postgres)
# =========================
DATABASE_URL=postgresql://remote_job_user:******

# =========================
# JWT Secrets
# =========================
JWT_SECRET=*****
JWT_REFRESH_SECRET=*****

# =========================
# OpenRouter / Tailored CV
# =========================
OPENROUTER_API_KEY=sK-*******
TAILORED_CV_LAMBDA_URL=*****

# =========================
# Cloudinary Configuration
# =========================
CLOUDINARY_CLOUD_NAME=****
CLOUDINARY_API_KEY=******
CLOUDINARY_API_SECRET=S_*****

```

---

## 🧪 Running Locally
Clone the repository

git clone https://github.com/Kurller/Remote-job-Application-Manager.git

cd Remote-job-Application-Manager

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start the server

```bash
npm run dev
```

Server runs on:

```text
http://localhost:3000
```

---

## 🚀 Deployment (Render)

1. Create a **Web Service** on Render
2. Connect your GitHub repository
3. Set build command:

```bash
npm install
```

4. Set start command:

```bash
node server.js
```

5. Add environment variables in Render dashboard
6. Deploy 🎉

---

## 🔒 Security Notes

* Passwords are hashed before storage
* JWT secrets must never be committed
* HTTPS is required in production
* File uploads are validated before processing

---

## 🛣️ Roadmap

* Application status updates
* Admin analytics
* API rate limiting
* Automated tests

---

## 👨‍💻 Author

**Remote Job Application Manager – Backend**

Built with Node.js, Express, and PostgreSQL.

Kolawole Oladejo
---


