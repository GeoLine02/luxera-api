import { Request, Response } from "express";
import { getAllCitiesService } from "../services/city.service";

export async function getAllCitiesController(req: Request, res: Response) {
  try {
    const cities = await getAllCitiesService(req, res);
    return cities;
  } catch (err) {
    console.log(err);
  }
}
