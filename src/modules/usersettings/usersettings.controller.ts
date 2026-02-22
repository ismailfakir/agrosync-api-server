import { BaseController } from "../../core/base.controller";
import { UserSettingsService } from "./usersettings.service";
import { UserSettingsSchema } from "./usersettings.schema";

export class UserSettingsController extends BaseController<any> {
  constructor() {
    super(new UserSettingsService(), UserSettingsSchema);
  }
}