import { Router, Request, Response, NextFunction } from "express";
import * as ctrl from "../controllers/judgeController";
import { isAuthenticated } from "../middleware/auth";
import { body } from "express-validator";

const router = Router();

// Allow skipping auth for integration/demo runs by setting SKIP_AUTH=true
const maybeAuth = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.SKIP_AUTH === "true") return next();
  return isAuthenticated(req as any, res, next as any);
};

router.post(
  "/submit",
  maybeAuth,
  [body("source").isString().notEmpty(), body("language_id").isInt()],
  ctrl.submit
);
router.get("/result/:token", maybeAuth, ctrl.result);

export default router;
