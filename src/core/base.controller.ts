import { Request, Response } from "express";
//import { ZodSchema } from "zod";
import { ZodObject, ZodRawShape } from "zod";

export class BaseController<TShape extends ZodRawShape> {
  constructor(
    private service: any,
    private schema: ZodObject<TShape>
  ) {}

  create = async (req: Request, res: Response) => {
    const parsed = this.schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json(parsed.error);

    const result = await this.service.create(parsed.data);
    res.status(201).json(result);
  };

  findAll = async (_req: Request, res: Response) => {
    const result = await this.service.findAll();
    res.json(result);
  };

  findById = async (req: Request, res: Response) => {
    const result = await this.service.findById(req.params.id);
    if (!result)
      return res.status(404).json({ message: "Not found" });

    res.json(result);
  };

  update = async (req: Request, res: Response) => {
    const parsed = this.schema.partial().safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json(parsed.error);

    const result = await this.service.update(
      req.params.id,
      parsed.data
    );

    if (!result)
      return res.status(404).json({ message: "Not found" });

    res.json(result);
  };

  delete = async (req: Request, res: Response) => {
    const result = await this.service.delete(req.params.id);
    if (!result)
      return res.status(404).json({ message: "Not found" });

    res.status(204).send();
  };
}