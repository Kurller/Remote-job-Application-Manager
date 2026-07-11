# 🚀 Remote Job Application Manager API

A production-ready REST API for managing remote job applications, candidate profiles, CV uploads, and AI-powered CV tailoring.

This project demonstrates modern backend development practices including authentication, PostgreSQL integration, cloud file storage, AI integration, API documentation, Docker containerization, and cloud deployment.

---

# 🌐 Live Demo

> **Note:** This project is hosted on free-tier cloud services. If the live demo is temporarily unavailable due to free-tier limitations, please watch the complete YouTube walkthrough below.

### Frontend

https://your-frontend.vercel.app

### Backend API

https://remote-job-manager-backend.onrender.com

### Swagger Documentation

https://remote-job-manager-backend.onrender.com/api-docs

### 🎥 YouTube Walkthrough

https://youtu.be/ujbkF4yQRLU

The video demonstrates every major feature of the application and serves as a permanent showcase even when the live deployment is unavailable.

---

# 📌 Overview

Searching and applying for remote jobs often involves managing multiple applications, tailoring CVs for different positions, and keeping track of each application's progress.

The Remote Job Application Manager API provides a centralized backend that allows users to:

* Create and manage job applications
* Upload and manage multiple CVs
* Generate AI-tailored CVs based on job descriptions
* Track application progress
* Manage candidate profiles
* Secure endpoints using JWT authentication
* Store uploaded documents securely in Cloudinary

---

# ✨ Features

## Authentication

* User Registration
* Secure Login
* JWT Authentication
* Protected Routes
* Password Hashing using bcrypt

---

## Job Management

* Create Job
* View Jobs
* Update Job Status
* Delete Jobs

Supported statuses include:

* Applied
* Interview
* Assessment
* Offer
* Rejected

---

## Candidate Management

* Create Candidate
* View Candidates
* Delete Candidate

---

## CV Management

* Upload PDF CV
* Cloudinary Storage
* Download CV
* Delete CV
* Multiple CV Support

---

## AI Tailored CV

Generate customized CVs using AI.

Workflow:

* Upload an existing CV
* Extract PDF content
* Analyze Job Description
* Generate tailored content
* Produce a downloadable PDF

---

## Application Management

* Apply for Jobs
* Upload CV during application
* Track Applications
* Update Application Status

---

## API Documentation

Interactive Swagger/OpenAPI documentation.

Available at:

```
/api-docs
```

---

## Health Monitoring

Health endpoint

```
GET /health
```

Returns

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

# 🏗 System Architecture

```
                  React Frontend
                         │
                         │ HTTPS
                         ▼
               Express REST API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
 PostgreSQL        Cloudinary       OpenAI/OpenRouter
 Database        File Storage       AI Tailoring
                         │
                         ▼
                JWT Authentication
```

---

# 🛠 Tech Stack

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Database Driver

* pg

### Authentication

* JWT
* bcrypt

### File Upload

* Multer
* Cloudinary

### Documentation

* Swagger UI
* Swagger JSDoc

### Security

* Helmet
* CORS
* Cookie Parser
* Rate Limiting

### Logging

* Morgan

### AI

* OpenAI SDK
* OpenRouter API

### PDF Processing

* pdf-lib
* pdf-parse
* PDFKit

### Deployment

* Docker
* Render

---

# 📁 Project Structure

```
project
│
├── config
│   ├── db.js
│   └── swagger.js
│
├── middleware
├── routes
├── controllers
├── services
├── uploads
├── utils
├── server.js
└── package.json
```

---

# 🔐 Authentication

Most endpoints require a Bearer Token.

```
Authorization: Bearer <JWT_TOKEN>
```

---

# 📚 API Endpoints

### Authentication

```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
```

### Jobs

```
GET /jobs
POST /jobs
PUT /jobs/:id/status
```

### Applications

```
POST /applications/apply/:jobId
GET /applications
GET /applications/all
PUT /applications/:id
```

### CVs

```
POST /cvs/upload
GET /cvs
GET /cvs/download/:id
DELETE /cvs/delete/:id
```

### Tailored CVs

```
POST /tailored-cvs
GET /tailored-cvs
GET /tailored-cvs/download/:id
```

### Candidates

```
GET /candidates
POST /candidates
GET /candidates/:id
DELETE /candidates/:id
```

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Helmet Security Headers
* Protected Routes
* Input Validation
* File Upload Validation
* Rate Limiting
* CORS Protection

---

# ☁ Cloud Storage

Uploaded CVs are stored securely using Cloudinary.

Benefits include:

* No local storage
* Fast downloads
* Secure file hosting
* High availability
* Easy scalability

---

# 🤖 AI Integration

The application integrates with an AI model to generate tailored CVs.

Workflow:

```
Upload CV

↓

Extract PDF Text

↓

Send Prompt to AI

↓

Generate Tailored Content

↓

Create New PDF

↓

Download Tailored CV
```

---

# 🐳 Docker Support

Run locally using Docker.

```bash
docker compose up --build
```

---

# 🚀 Deployment

The application is containerized using Docker and deployed on Render.

Production deployment includes:

* Docker Containers
* PostgreSQL Database
* Environment Variables
* Cloudinary Integration
* Swagger Documentation

---

# ⚙ Environment Variables

```env
PORT=

DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

OPENAI_API_KEY=

FRONTEND_URL=
```

---

# 📷 Screenshots

Include screenshots of:

* Home Page
* Login
* Dashboard
* Job Management
* Candidate Management
* CV Upload
* AI Tailored CV
* Swagger Documentation
* Database Tables

---

# 🎥 Project Walkthrough

Watch the complete project demonstration on YouTube.

**Video Link**

https://youtu.be/YOUR_VIDEO_ID

The walkthrough includes:

* Project Overview
* System Architecture
* Authentication
* Job Management
* Candidate Management
* CV Upload
* AI Tailored CV Generation
* Swagger Documentation
* Docker Deployment
* Production Deployment on Render

---

# 🧪 Future Improvements

* Email Notifications
* Resume Scoring
* Cover Letter Generation
* AI Interview Preparation
* Job Recommendation Engine
* Company Dashboard
* Recruiter Portal
* Admin Dashboard
* Unit Tests
* Integration Tests
* CI/CD Pipeline
* Role-Based Access Control
* Search & Filtering

---

# 📖 What I Learned

Building this project strengthened my understanding of:

* REST API Design
* Express.js
* PostgreSQL
* JWT Authentication
* Middleware
* Cloud Storage
* File Upload Handling
* AI Integration
* Docker
* Production Deployment
* Environment Variables
* Swagger Documentation
* Error Handling
* API Security
* Modern Backend Architecture

---

# 💡 Challenges Solved

During development, I solved several real-world engineering challenges including:

* Dockerizing a Node.js application
* Deploying a production-ready API on Render
* Configuring PostgreSQL in production
* Implementing secure JWT authentication
* Uploading files to Cloudinary
* Processing PDF documents
* Integrating AI-generated CV tailoring
* Managing CORS across multiple deployment environments
* Documenting APIs with Swagger/OpenAPI

---

# 👨‍💻 Author

## Oladejo Kolawole

Backend Software Engineer

### Skills

* Node.js
* Express.js
* PostgreSQL
* Docker
* REST APIs
* JWT Authentication
* Cloudinary
* Swagger/OpenAPI
* JavaScript (ES6+)
* SQL

---

# ⭐ If You Like This Project

If you found this project helpful or interesting, consider giving it a ⭐ on GitHub.

---

# 📄 License

This project is licensed under the MIT License.
