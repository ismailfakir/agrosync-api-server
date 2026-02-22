export class BaseService<T> {
  constructor(private repository: any) {}

  create(data: Partial<T>) {
    return this.repository.create(data);
  }

  findAll() {
    return this.repository.findAll();
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  update(id: string, data: Partial<T>) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}