import { BaseService } from "../../core/base.service";
import { UserRepository } from "./usersettings.repository";
import { UserSettings } from "../../types/usersettings.types";

export class UserSettingsService extends BaseService<UserSettings> {
  constructor() {
    super(new UserRepository());
  }

  // Business logic goes here
}