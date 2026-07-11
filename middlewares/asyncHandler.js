// middlewares/asyncHandler.js
export default function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next); // pass errors to global error handler
  };
}
