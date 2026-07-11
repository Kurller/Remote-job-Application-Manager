import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Remote Job API",
      version: "1.0.0",
      description:
        "API for managing job applications with JWT authentication, role-based access, and CV upload",
    },

    // ✅ FIXED: use same-origin
  servers: [
  {
    url: "http://localhost:10000",
    description: "Local Development",
  },
  {
    url: "https://remote-job-manager-backend.onrender.com",
    description: "Production",
  },
],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Application: {
          type: "object",
          properties: {
            id: { type: "string", example: "123" },
            userId: { type: "string", example: "user_001" },
            jobId: { type: "string", example: "job_001" },
            status: { type: "string", example: "pending" },
            cvUrl: { type: "string", example: "https://example.com/cv.pdf" },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./routes/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;