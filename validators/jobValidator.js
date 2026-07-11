import { body, validationResult } from "express-validator";

// Validator for creating a new job
export const createJobValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("company").notEmpty().withMessage("Company is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("description").notEmpty().withMessage("Description is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

// Validator for updating a job (fields are optional)
export const updateJobValidator = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("company").optional().notEmpty().withMessage("Company cannot be empty"),
  body("location").optional().notEmpty().withMessage("Location cannot be empty"),
  body("description").optional().notEmpty().withMessage("Description cannot be empty"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];
