import { Request, Response } from "express";
import Cities from "../sequelize/models/cities";

export async function getAllCitiesService(req: Request, res: Response) {
  try {
    const cities = await Cities.findAll();
    return res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch all cities",
      err,
    });
  }
}
