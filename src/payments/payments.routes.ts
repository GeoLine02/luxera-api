import e from "express";
import bogRoutes from "./bog/bog.routes";
const router = e.Router();
router.use("/bog", bogRoutes);
export default router;
