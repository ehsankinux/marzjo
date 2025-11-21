import React from "react";
import { TrendingUp, MapPin, Clock, CheckCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";

type StatItem = {
  icon: string; // simple name used for switch -> svg path
  value: string;
  label: string;
  color: string;
  bg: string;
};

const statItems: StatItem[] = [
  { icon: "trending-up", value: "۲۴", label: "قلمروهای فعال", color: "#4f46e5", bg: "#eef2ff" },
  { icon: "location", value: "۱۵۶", label: "بازدیدهای کل", color: "#ec4899", bg: "#fff1f2" },
  { icon: "time", value: "۴۲ ساعت", label: "مدت زمان", color: "#f59e0b", bg: "#fffbeb" },
  { icon: "checkmark-circle", value: "۸۹٪", label: "نرخ تکمیل", color: "#10b981", bg: "#ecfdf5" },
];

const IconSvg: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  switch (name) {
    case "trending-up":
      return <TrendingUp className={className} />;
    case "location":
      return <MapPin className={className} />;
    case "time":
      return <Clock className={className} />;
    case "checkmark-circle":
      return <CheckCircle className={className} />;
    default:
      return null;
  }
};

const StatsPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 pb-30" dir="rtl">
      <PageHeader title="آمار" />
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">نمای کلی عملکرد</h1>
          <p className="text-base text-gray-600 mt-2">عملکرد قلمرو خود را دنبال کنید و بینش‌های ارزشمند به‌دست آورید</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl p-4 shadow-sm flex flex-col items-start"
              style={{ backgroundColor: item.bg }}
            >
              <div className="flex items-center w-full">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${item.color}20` }}
                  aria-hidden
                >
                  <IconSvg name={item.icon} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{item.label}</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">عملکرد هفتگی</h2>
              <div className="text-sm text-gray-600">به‌روزرسانی: این هفته</div>
            </div>

            <div className="h-56 rounded-lg bg-gray-50 flex items-center justify-center">
              {/* Simple sparkline placeholder SVG */}
              <svg className="w-full h-40 px-6" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden>
                <polyline
                  points="0,60 20,50 40,30 60,35 80,20 100,25 120,15 140,22 160,18 180,10 200,30"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute text-sm text-gray-500">
                نمودار نمونه — برای نمودار واقعی، اضافه کردن کتابخانه مانند Chart.js یا Recharts
              </span>
            </div>
          </div>

          <aside className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">خلاصه سریع</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center justify-between">
                <span className="text-gray-600">میانگین مسافت</span>
                <span className="font-medium text-gray-900">۵.۴ کیلومتر</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-600">میانگین سرعت</span>
                <span className="font-medium text-gray-900">۴:۵۸ /کیلومتر</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-600">کل زمان</span>
                <span className="font-medium text-gray-900">۱۲۳ ساعت</span>
              </li>
            </ul>
            <div className="mt-6">
              <button className="w-full inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700">
                مشاهده گزارش کامل
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default StatsPage;
