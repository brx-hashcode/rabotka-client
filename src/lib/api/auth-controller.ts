import { RabotkaBaseController } from "./base-controller";

export type SendOTPPayload = {
  emailOrPhone: string;
};

export type VerifyOTPPayload = {
  emailOrPhone: string;
  otp: string;
};

export type SendOTPResponse = {
  success: boolean;
  message?: string;
};

export type VerifyOTPResponse = {
  success: boolean;
  token?: string;
  user?: object;
};

export class AuthController extends RabotkaBaseController {
  async sendOTP(emailOrPhone: string): Promise<SendOTPResponse> {
    try {
      return await this.post<SendOTPResponse>("/auth/send-otp", {
        emailOrPhone,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyOTP(
    emailOrPhone: string,
    otp: string,
  ): Promise<VerifyOTPResponse> {
    try {
      return await this.post<VerifyOTPResponse>("/auth/verify-otp", {
        emailOrPhone,
        otp,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async resendOTP(emailOrPhone: string): Promise<SendOTPResponse> {
    return await this.sendOTP(emailOrPhone);
  }
}

export const { sendOTP, verifyOTP, resendOTP } = new AuthController();
