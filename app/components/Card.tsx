export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6">
      {children}
    </div>
  );
}