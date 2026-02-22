import { Router } from "express";

export function createCrudRouter(controller: any) {
  const router = Router();

  router.post("/", controller.create);
  router.get("/", controller.findAll);
  router.get("/:id", controller.findById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}