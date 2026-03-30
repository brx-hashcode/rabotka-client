import { RabotkaBaseController } from "./base-controller";

export type PaymentByTokenResponse = {
  id: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED";
  profileName: string;
  amount: number | null;
  description: string | null;
};

export type InitiatePaymentPayload = {
  phone: string;
  operator: "MTN" | "AIRTEL";
};

export type InitiatePaymentResponse = {
  success: boolean;
};

export class PaymentController extends RabotkaBaseController {
  async getByToken(token: string): Promise<PaymentByTokenResponse> {
    try {
      return await this.get<PaymentByTokenResponse>(`/pay/${token}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async initiatePayment(
    token: string,
    data: InitiatePaymentPayload,
  ): Promise<InitiatePaymentResponse> {
    try {
      return await this.post<InitiatePaymentResponse>(
        `/pay/${token}/initiate`,
        data as Record<string, unknown>,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { getByToken, initiatePayment } = new PaymentController();
