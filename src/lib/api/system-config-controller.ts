import { RabotkaBaseController } from "./base-controller";

export type PublicContactInfo = {
  email: string;
  phone: string;
  address: string;
  orangeMoneyNumber: string;
  airtelMoneyNumber: string;
};

class SystemConfigController extends RabotkaBaseController {
  getContact(): Promise<PublicContactInfo> {
    return this.get<PublicContactInfo>("/public/config/contact");
  }
}

const controller = new SystemConfigController();
export const getPublicContact = controller.getContact.bind(controller);
