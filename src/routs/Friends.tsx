import React, { useState } from "react";
import { MessageSquare, User, Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";

type Friend = { id: number; name: string; status: string; territory: string };

const followers: Friend[] = [
  { id: 1, name: "جان اسمیت", status: "آنلاین", territory: "منطقه شمالی" },
  { id: 2, name: "سارا جانسون", status: "دور", territory: "منطقه جنوبی" },
  { id: 3, name: "مایک ویلسون", status: "آفلاین", territory: "منطقه شرقی" },
];

const following: Friend[] = [
  { id: 4, name: "امیلی دیویس", status: "آنلاین", territory: "منطقه غربی" },
  { id: 5, name: "دیوید براون", status: "آنلاین", territory: "منطقه مرکزی" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "آنلاین":
      return "bg-green-500";
    case "دور":
      return "bg-orange-500";
    case "آفلاین":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

const AvatarInitials: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
      {initials}
    </div>
  );
};

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
  const activeList = activeTab === "followers" ? followers : following;

  return (
    <main className="min-h-screen bg-gray-50 pb-30" dir="rtl">
      <PageHeader title="دوستان" />
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">اعضای تیم</h1>
          <p className="text-sm text-gray-600 mt-1">با اعضای تیم خود ارتباط برقرار کنید و وضعیت آن‌ها را بررسی کنید</p>
        </header>

        <div className="bg-blue-50 rounded-2xl p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("followers")}
              className={`py-3 rounded-2xl transition-colors text-center font-semibold ${
                activeTab === "followers" ? "bg-blue-600 text-white" : "text-blue-600 bg-transparent"
              }`}
            >
              دنبال‌کنندگان
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`py-3 rounded-2xl transition-colors text-center font-semibold ${
                activeTab === "following" ? "bg-blue-600 text-white" : "text-blue-600 bg-transparent"
              }`}
            >
              دنبال‌شونده‌ها
            </button>
          </div>
        </div>

        {activeList.length > 0 ? (
          <div className="space-y-3">
            {activeList.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="relative">
                    <AvatarInitials name={friend.name} />
                    <span
                      className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                        friend.status
                      )}`}
                    />
                  </div>

                  <div className="mr-4 text-right">
                    <div className="text-md font-semibold text-gray-900">{friend.name}</div>
                    <div className="text-sm text-gray-600">{friend.territory}</div>
                    <div className="text-xs text-gray-400">{friend.status}</div>
                  </div>
                </div>

                <button className="p-2 rounded-full bg-blue-100 hover:bg-blue-200">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-12">
            <User className="mx-auto w-12 h-12 text-gray-400" />
            <p className="text-gray-500 mt-3">هنوز هیچ دوستی در این بخش ندارید.</p>
          </div>
        )}

        <div className="mt-8">
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            افزودن دوست جدید
          </button>
        </div>
      </div>
    </main>
  );
};

export default FriendsPage;
