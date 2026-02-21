import { Router, Request, Response } from "express";
import { SensorDataService } from "../services/sensorData.service";
import { CreateSensorDataSchema } from "../schemas/sensorData.schema";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { catchAsync } from "../utils/catchAsync";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(CreateSensorDataSchema),
  catchAsync(async (req: Request, res: Response) => {
    const { deviceId, ...payload } = req.body;
    const data = await SensorDataService.recordData(
      req.user!.id,
      deviceId,
      payload,
    );
    res.status(201).json(data);
  }),
);

export default router;
