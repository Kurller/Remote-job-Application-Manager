import swaggerJSDoc from "swagger-jsdoc";

const serverUrl =
  process.env.DATABASE_URL ||
  `http://localhost:${process.env.PORT || 10000}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Remote Job API",
      version: "1.0.0",
      description:
        "API for managing job applications with JWT authentication, role-based access, and CV upload",
    },

    servers: [
      {
        url: serverUrl,
        description: process.env.DATABASE_URL
          ? "Production"
          : "Local Development",
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
            id: {
              type: "string",
              example: "123",
            },
            userId: {
              type: "string",
              example: "user_001",
            },
            jobId: {
              type: "string",
              example: "job_001",
            },
            status: {
              type: "string",
              example: "pending",
            },
            cvUrl: {
              type: "string",
              example: "https://example.com/cv.pdf",
            },
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