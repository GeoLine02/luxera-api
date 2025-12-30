import { Request } from "express";
const PAGE_SIZE = 15;
function getImageBaseUrl(req: Request) {
  return `${req.protocol}://${req.get("host")}/uploads/`;
}
export { PAGE_SIZE, getImageBaseUrl };
