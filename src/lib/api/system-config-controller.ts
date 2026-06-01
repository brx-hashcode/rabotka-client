import { RabotkaBaseController } from "./base-controller";

export type PublicContactInfo = {
  email: string;
  phone: string;
  address: string;
  orangeMoneyNumber: string;
  airtelMoneyNumber: string;
};

export type WelcomeCredits = {
  workerCreditFcfa: number;
  employerCreditFcfa: number;
};

class SystemConfigController extends RabotkaBaseController {
  getContact(): Promise<PublicContactInfo> {
    return this.get<PublicContactInfo>("/public/config/contact");
  }

  getWelcomeCredits(): Promise<WelcomeCredits> {
    return this.get<WelcomeCredits>("/public/config/welcome-credits");
  }
}

const controller = new SystemConfigController();
export const getPublicContact = controller.getContact.bind(controller);
export const getWelcomeCredits = controller.getWelcomeCredits.bind(controller);
