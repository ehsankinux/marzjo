import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type SplashProps = {
  onFinish?: () => void;
  duration?: number;
};

export default function Splash({ onFinish, duration = 1400 }: SplashProps) {
  useEffect(() => {
    const t = setTimeout(() => onFinish && onFinish(), duration);
    return () => clearTimeout(t);
  }, [onFinish, duration]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-sky-50 p-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
          <img
            src="/icons/pwa-512x512.png"
            alt="Marzjo logo"
            className="w-52 h-52 object-contain"
            onError={(e) => {
              // fallback: hide image if not found
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-sky-700">Marzjo</h1>
        <p className="mt-2 text-sm text-slate-500">Running & walking tracker</p>

        <div className="mt-6 flex justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-500" />
        </div>
      </div>
    </div>
  );
}
