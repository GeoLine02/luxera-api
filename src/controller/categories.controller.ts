import { Request, Response } from "express";
import {
  GetAllCategoriesService,
  GetAllSubCategoriesService,
} from "../services/categories.service";

export async function GetAllCategoriesController(req: Request, res: Response) {
  try {
    const allCategories = await GetAllCategoriesService();

    return res.status(200).json(allCategories);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function GetAllSubCategoriesController(
  req: Request,
  res: Response
) {
  try {
    const allSubCategories = await GetAllSubCategoriesService();

    return res.status(200).json(allSubCategories);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
