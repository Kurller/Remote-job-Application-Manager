1.Project Structure
remote-job-manager/
├── config/
│   └── db.js             
├── controllers/
├── middlewares/
├── routes/
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   ├── tailoredCVRoutes.js
│   ├── candidateRoutes.js
│   └── cvRoutes.js
├── package.json
├── Dockerfile
├── server.js
└── .env

2.Middleware & Features

JSON Parsing: express.json() for request bodies

CORS: Only allows origins in FRONTEND_URLS

Trust Proxy: Required for Render deployment

3.Project Link:https://remote-job-application-manager-1.onrender.com

4.Login as an Administrator:
Email:admin@gmail.com
password:123456

5.Routes Overview
| Route           | Description                               |
| --------------- | ----------------------------------------- |
| `/auth`         | Login, register, refresh token            |
| `/jobs`         | List, create, update, delete job postings |
| `/applications` | Submit applications                       |
| `/tailored-cvs` | Generate, list, and download tailored CVs |
| `/candidates`   | Manage candidate profiles                 |
| `/cvs`          | Upload and manage CVs                     |
| `/`             | Root message                              |
| `/health`       | Health check (Render compatible)          |


6.Tailored CV Download

Endpoint: GET /tailored-cvs/download/:id

Auth Required: Yes

Behavior: Streams the PDF file from Cloudinary or storage to the frontend.

7. Local Development
# Install dependencies
npm install

# Run in development
npm run dev    # if you have nodemon
# or
node server.js

8.Docker Setup
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 10000
CMD ["node", "server.js"]

9.Build & run locally:
docker build -t remote-job-backend .
docker run -p 10000:10000 --env-file .env remote-job-backend

10.Render Deployment

Create a new Web Service in Render.

Connect your GitHub repository.

Select Docker deployment.

Set environment variables as above.

Expose port 10000.

Use /health endpoint to confirm service is running.

11.Logging & Debugging

Logs are printed to console:

Server start

OPENROUTER_API_KEY detection

CV download errors

Stack traces appear only in development mode (NODE_ENV=development).

12.Summary

Backend is Node.js + Express with PostgreSQL.

Fully Dockerized and Render-ready.

Handles AI-tailored CVs, job applications, and candidate management.

Secure with CORS whitelist and auth middleware.

Health check endpoint makes it easy to monitor uptime on Render.
Important: id must be a valid integer; otherwise returns 400 Invalid CV ID.Global Error Handler: Returns stack trace in development

Health Check: /health endpoint for uptime monitoring
