// base.repository.ts

import mongoose, {
  Model,
  HydratedDocument
} from "mongoose";

export class BaseRepository<T> {
  constructor(private model: Model<T>) {}

  async create(
    data: Partial<T>
  ): Promise<HydratedDocument<T>> {
    return this.model.create(data);
  }

  async findAll(): Promise<HydratedDocument<T>[]> {
    return this.model.find().exec();
  }

  async findById(
    id: string
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id).exec();
  }

  async find(
    filter: mongoose.QueryFilter<T>
  ): Promise<HydratedDocument<T>[]> {
    return this.model.find(filter).exec();
  }

  async update(
    id: string,
    data: mongoose.UpdateQuery<T>
  ): Promise<HydratedDocument<T> | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(
    id: string
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}