// components/WhatsAppButton.tsx
import React from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

const phoneNumber = "254759912373"; // Use your actual phone number (254 for Kenya)

const WhatsAppButton: React.FC = () => {
  return (
    <Link
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed cursor-pointer bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={24} />
    </Link>
  );
};

export default WhatsAppButton;
