import { RabotkaBaseController } from "./base-controller";

export type VerifyWhatsAppPayload = {
  token: string;
};

export type VerifyWhatsAppResponse = {
  success: boolean;
};

export class VerifyController extends RabotkaBaseController {
  async verifyWhatsApp(token: string): Promise<VerifyWhatsAppResponse> {
    try {
      return await this.post<VerifyWhatsAppResponse>("/whatsapp/verify", {
        token,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { verifyWhatsApp } = new VerifyController();
