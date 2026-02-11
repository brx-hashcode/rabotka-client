import { RabotkaBaseController } from "./base-controller";

export type VerifyWhatsAppResponse = {
  success: boolean;
};

export class VerifyController extends RabotkaBaseController {
  async verifyWhatsApp(token: string): Promise<VerifyWhatsAppResponse> {
    try {
      const encodedToken = encodeURIComponent(token);
      return await this.get<VerifyWhatsAppResponse>(
        `/whatsapp/verify?token=${encodedToken}`,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { verifyWhatsApp } = new VerifyController();
