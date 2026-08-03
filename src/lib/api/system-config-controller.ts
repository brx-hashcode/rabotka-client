import { RabotkaBaseController } from "./base-controller";

export type PublicContactInfo = {
  email: string;
  phone: string;
  address: string;
  orangeMoneyNumber: string;
  airtelMoneyNumber: string;
};

/** What a worker commits to when applying — shown before they confirm. */
export type ApplicationTerms = {
  lateCancellationPenaltyFcfa: number;
  cancellationThresholdHours: number;
};

class SystemConfigController extends RabotkaBaseController {
  getContact(): Promise<PublicContactInfo> {
    return this.get<PublicContactInfo>("/public/config/contact");
  }

  getApplicationTerms(): Promise<ApplicationTerms> {
    return this.get<ApplicationTerms>("/public/config/application-terms");
  }
}

const controller = new SystemConfigController();

// Annotated explicitly: `.bind()` drops the method signature here (the SDK's
// BaseController rebinds its own prototype methods in the constructor), so the
// inferred type degrades to `unknown` and every caller loses its fields.
export const getPublicContact: () => Promise<PublicContactInfo> =
  controller.getContact.bind(controller);
export const getApplicationTerms: () => Promise<ApplicationTerms> =
  controller.getApplicationTerms.bind(controller);
