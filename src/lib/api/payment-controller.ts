import { RabotkaBaseController } from "./base-controller";

/** Gateway key, as the backend registry names it (e.g. `PAWAPAY`, `MTN_MOMO`). */
export type PaymentGateway = string;

/** One mobile-money network a gateway can charge. */
export type PaymentOperator = {
  /** The gateway's own code, sent back as-is (e.g. `MTN_MOMO_COG`). */
  code: string;
  label: string;
  /** ISO 3166-1 alpha-3 country the network serves, when the gateway says. */
  country?: string;
};

export type PaymentGatewayInfo = {
  key: PaymentGateway;
  label: string;
  requiresOperator: boolean;
  operators: PaymentOperator[];
};

export type PaymentGatewaysResponse = {
  /** Null when payments are switched off server-side. */
  active: PaymentGateway | null;
  gateways: PaymentGatewayInfo[];
};

export type PaymentByTokenResponse = {
  id: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED";
  gateway: PaymentGateway | null;
  profileName: string;
  amount: number | null;
  description: string | null;
  /** The payer's country (ISO3), to offer that country's networks only. */
  payerCountry?: string | null;
};

export type InitiatePaymentPayload = {
  phone: string;
  operator?: string;
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

  async getGateways(): Promise<PaymentGatewaysResponse> {
    try {
      return await this.get<PaymentGatewaysResponse>("/payment-gateways");
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

export const { getByToken, getGateways, initiatePayment } =
  new PaymentController();
