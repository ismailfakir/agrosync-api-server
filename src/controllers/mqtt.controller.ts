import express from "express";
import { mqttService } from "../services/MqttService";
import { Router } from "express";
import { UserService } from "../services/user.service";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { registry } from "../utils/openapi";
import {v4 as uuidv4} from 'uuid';

let myuuid = uuidv4();


const router = express.Router();

registry.registerPath({
  method: "get",
  path: "/trigger-alarm",
  summary: "Publish mqtt message",
  tags: ["Mqqtt"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "User data" } },
});

router.get("/", authenticate, async (req, res) => {
  // Publish to MQTT
  mqttService.publish("home/security/alarm", {
    action: "ACTIVATE",
    severity: "high",
    triggeredBy: "Express_API",
    reason: "testing publishing mqtt message",
    id: myuuid,
  });

  res.status(200).json({ message: "Alarm triggered via MQTT" });
});

export default router;
