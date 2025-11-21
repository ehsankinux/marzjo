import React from "react";
import { Map as MapIcon, Clock, Zap, Check, MapPin, BarChart2 } from "lucide-react";
import PageHeader from "../components/PageHeader";

type LatestRun = {
  date: string;
  distanceKm: string;
  time: string;
  pace: string;
  goalProgressPct: number;
};

const LatestRunCard: React.FC = () => {
  const user = {
    name: "الکس رانر",
    avatar: "https://i.pravatar.cc/150?img=12",
    latestRun: {
      date: "۵ نوامبر ۲۰۲۵ • ۶:۴۵ صبح",
      distanceKm: "۵.۲",
      time: "۲۵:۳۰",
      pace: "۴:۵۴ /کیلومتر",
      goalProgressPct: 68,
    } as LatestRun,
  };

  const stats: {
    key: string;
    label: string;
    value: string;
    bg: string;
    color: string;
    icon: React.ComponentType<any>;
  }[] = [
    {
      key: "distanceKm",
      label: "مسافت",
      value: user.latestRun.distanceKm + " کیلومتر",
      bg: "bg-blue-100",
      color: "text-blue-600",
      icon: MapIcon,
    },
    {
      key: "time",
      label: "زمان",
      value: user.latestRun.time,
      bg: "bg-yellow-100",
      color: "text-yellow-700",
      icon: Clock,
    },
    {
      key: "pace",
      label: "سرعت",
      value: user.latestRun.pace,
      bg: "bg-green-100",
      color: "text-green-600",
      icon: Zap,
    },
  ];

  return (
    <article className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center">
        <img src={user.avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover mr-4 bg-gray-100" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">آخرین دو • {user.latestRun.date}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
        {stats.map((s) => (
          <div key={s.key} className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${s.bg} shadow-sm`}>
              {(() => {
                const Icon = s.icon;
                return <Icon className={`w-6 h-6 ${s.color}`} />;
              })()}
            </div>
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-xl font-semibold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-purple-100">
              <Check className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">هدف هفتگی</h4>
          </div>
          <div className="text-sm text-gray-600">{user.latestRun.goalProgressPct}%</div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-indigo-500" style={{ width: `${user.latestRun.goalProgressPct}%` }} />
        </div>
      </div>
    </article>
  );
};

const HomePage: React.FC = () => {
  const features: { title: string; desc: string; color: string; accent: string; icon: React.ComponentType<any> }[] = [
    {
      title: "نقشه‌های تعاملی",
      desc: "مشاهده و تعامل با نقشه‌های دقیق قلمرو",
      color: "bg-blue-50",
      accent: "text-blue-600",
      icon: MapIcon,
    },
    {
      title: "ردیابی موقعیت",
      desc: "ردیابی و نظارت بر موقعیت‌ها در زمان واقعی",
      color: "bg-yellow-50",
      accent: "text-yellow-600",
      icon: MapPin,
    },
    {
      title: "تحلیل داده‌ها",
      desc: "دریافت بینش و تحلیل بر روی قلمروهای خود",
      color: "bg-green-50",
      accent: "text-green-600",
      icon: BarChart2,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-30" dir="rtl">
      <PageHeader title="خانه" />
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <LatestRunCard />

        <section className="text-center mt-10 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">خوش آمدید به مرزجو</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            راهکار جامع شما برای مدیریت قلمروها — نقشه‌ها، ردیابی و تحلیل‌ها در یک مکان.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow flex flex-col items-start">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${f.color}`}>
                {(() => {
                  const Icon = f.icon;
                  return <Icon className={`w-6 h-6 ${f.accent}`} />;
                })()}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-indigo-600 rounded-xl p-6 text-center text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-1">آماده شروع هستید؟</h2>
          <p className="text-sm text-white/90 mb-4">برای شروع به اکتشاف قلمروهای خود، روی دکمه + کلیک کنید.</p>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
