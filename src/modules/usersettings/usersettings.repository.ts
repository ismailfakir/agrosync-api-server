// user.repository.ts

import { BaseRepository } from "../../core/base.repository";
import { UserSettings } from "../../types/usersettings.types";
import { UserSettingsModel } from "./usersettings.model";

export class UserRepository extends BaseRepository<UserSettings> {
  constructor() {
    super(UserSettingsModel);
  }

  async findByEmail(email: string) {
    return this.find({ email });
  }
  
}