import { RabotkaBaseController } from "./base-controller";

export const WALLET_MIN_TOP_UP = 500;
export const WALLET_MAX_TOP_UP = 500_000;

class WalletController extends RabotkaBaseController {
  // Backend: GET /profile/wallet/balance → { balance } (FCFA).
  async getBalance(): Promise<number> {
    try {
      const res = await this.get<{ balance: number }>(
        "/profile/wallet/balance",
      );
      return res.balance;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Backend: POST /profile/wallet/top-up { amount } → { token } for /pay/:token.
  async topUp(amount: number): Promise<{ token: string }> {
    try {
      return await this.post<{ token: string }>("/profile/wallet/top-up", {
        amount,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const { getBalance: getWalletBalance, topUp: topUpWallet } =
  new WalletController();
