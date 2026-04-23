import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function usePaymentSocket(
  token: string,
  active: boolean,
  onStatus: (status: "APPROVED" | "REJECTED" | "TIMEOUT") => void,
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

    socket.on("payment-status", (data: { status: "APPROVED" | "REJECTED" | "TIMEOUT" }) => {
      onStatusRef.current(data.status);
      // Keep socket open on TIMEOUT so webhook result can still arrive
      if (data.status !== "TIMEOUT") socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [active, token]);
}
