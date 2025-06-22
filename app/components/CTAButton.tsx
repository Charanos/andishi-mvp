export function CTAButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="px-6 py-3 bg-[#00C6FB] text-white rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition"
    >
      {label}
    </a>
  );
}