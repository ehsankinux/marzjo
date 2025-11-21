import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && password !== confirm) {
      alert("رمزهای عبور یکسان نیستند");
      return;
    }
    navigate("/home");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-sky-700">{mode === "login" ? "خوش آمدید" : "ایجاد حساب"}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "login" ? "برای ادامه وارد شوید" : "برای شروع ثبت‌نام کنید"}
          </p>
        </div>

        <form className="mt-6" onSubmit={submit}>
          <label className="block text-xs text-slate-600">ایمیل</label>
          <input
            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block text-xs text-slate-600 mt-4">رمز عبور</label>
          <input
            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {mode === "signup" && (
            <>
              <label className="block text-xs text-slate-600 mt-4">تکرار رمز عبور</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </>
          )}

          <button className="mt-6 w-full bg-sky-600 text-white py-2 rounded-lg font-medium" type="submit">
            {mode === "login" ? "ورود" : "ایجاد حساب"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">یا</div>

        <div className="mt-4">
          <button
            onClick={() => alert("ورود با گوگل فعال نشده است")}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2"
          >
            <LogIn className="h-5 w-5" />
            ادامه با گوگل
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-500">{mode === "login" ? "حساب ندارید؟" : "از قبل حساب دارید؟"}</span>
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sky-600 font-medium">
            {mode === "login" ? "ثبت‌نام" : "ورود"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate("/home")} className="text-xs text-slate-400">
            ورود به عنوان مهمان
          </button>
        </div>
      </div>
    </div>
  );
}
