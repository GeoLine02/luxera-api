import express from "express";
import { getAllCitiesController } from "../controller/city.controller";

const router = express.Router();
router.get("/", getAllCitiesController);

export default router;
