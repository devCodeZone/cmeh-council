"use client";

import { MessageCircle, Phone } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function WhatsAppFab({ whatsappNumber, phone }: { whatsappNumber: string; phone: string }) {
  const digitsOnly = whatsappNumber.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    "Hello Electrohomeopath Council Patna, I would like more information."
  );
  const waHref = digitsOnly ? `https://wa.me/${digitsOnly}?text=${message}` : undefined;
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : undefined;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {telHref ? (
        <a
          href={telHref}
          onClick={() => trackEvent("phone_click")}
          className="hidden sm:flex size-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg hover:scale-105 transition-transform focus-ring"
          aria-label="Call the council"
        >
          <Phone className="size-5" />
        </a>
      ) : null}
      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("whatsapp_click")}
          className="flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform focus-ring"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle className="size-6" />
        </a>
      ) : null}
    </div>
  );
}
