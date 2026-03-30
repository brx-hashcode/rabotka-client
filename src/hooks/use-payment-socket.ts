import { useEffect } from "react";
import { io } from "socket.io-client";

export function usePaymentSocket(
  token: string,
  active: boolean,
  onStatus: (status: "APPROVED" | "REJECTED") => void,
) {
  useEffect(() => {
    if (!active) return;

    const socket = io("/payment-status", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join-payment", { token });
    });

    socket.on("payment-status", (data: { status: "APPROVED" | "REJECTED" }) => {
      onStatus(data.status);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, token]);
}
