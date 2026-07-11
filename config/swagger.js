import swaggerJSDoc from "swagger-jsdoc";

const serverUrl =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.API_URL ||
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
    description: process.env.RENDER_EXTERNAL_URL
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
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./routes/**/*.js"],
};

export default swaggerJSDoc(options);