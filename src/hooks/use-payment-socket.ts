import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function usePaymentSocket(
  token: string,
  active: boolean,
  onStatus: (status: "APPROVED" | "REJECTED") => void,
) {
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    if (!active) return;

    const socket = io("/payment-status", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join-payment", { token });
    });

    socket.on("payment-status", (data: { status: "APPROVED" | "REJECTED" }) => {
      onStatusRef.current(data.status);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [active, token]);
}
