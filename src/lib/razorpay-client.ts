/** Client-only helpers for the Razorpay Checkout popup. Import only from Client Components. */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(params: {
  keyId: string;
  orderId: string;
  amount: number;
  applicationId: number;
  applicationNumber: string;
  name: string;
  email: string;
  contact: string;
  onSuccess: () => void;
  onFailure: () => void;
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    params.onFailure();
    return;
  }
  const rzp = new window.Razorpay({
    key: params.keyId,
    amount: params.amount,
    currency: "INR",
    name: "Electrohomeopath Council Patna",
    description: `Registration Fee — ${params.applicationNumber}`,
    order_id: params.orderId,
    prefill: { name: params.name, email: params.email, contact: params.contact },
    theme: { color: "#0b5d52" },
    handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: params.applicationId, ...response }),
        });
        if (res.ok) params.onSuccess();
        else params.onFailure();
      } catch {
        params.onFailure();
      }
    },
    modal: { ondismiss: () => params.onFailure() },
  });
  rzp.open();
}
