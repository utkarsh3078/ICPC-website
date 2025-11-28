import { Router } from "express";
import * as ctrl from "../controllers/judgeController";
import { isAuthenticated } from "../middleware/auth";
import { body } from "express-validator";

const router = Router();

router.post(
  "/submit",
  isAuthenticated,
  [body("source").isString().notEmpty(), body("language_id").isInt()],
  ctrl.submit
);
router.get("/result/:token", isAuthenticated, ctrl.result);

export default router;
