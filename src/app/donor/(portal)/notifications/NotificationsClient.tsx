"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Bell, CheckCircle2, Zap, Star, Gift, X, Settings, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DbNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: Date;
};

function getIconProps(type: string) {
  switch (type) {
    case "MILESTONE_COMPLETE":
      return { Icon: CheckCircle2, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" };
    case "CAMPAIGN_UPDATE":
      return { Icon: Gift, iconBg: "bg-purple-100", iconColor: "text-purple-600" };
    case "SPOTLIGHT_WINNER":
      return { Icon: Star, iconBg: "bg-amber-100", iconColor: "text-amber-600" };
    case "NEW_PROJECT":
      return { Icon: Zap, iconBg: "bg-blue-100", iconColor: "text-blue-600" };
    case "REFERRAL_CONVERTED":
      return { Icon: Gift, iconBg: "bg-pink-100", iconColor: "text-pink-600" };
    default:
      return { Icon: Bell, iconBg: "bg-gray-100", iconColor: "text-gray-600" };
  }
}

function getLinkText(type: string) {
  switch (type) {
    case "MILESTONE_COMPLETE": return "See proof →";
    case "CAMPAIGN_UPDATE": return "View campaign →";
    case "SPOTLIGHT_WINNER": return "View project →";
    case "NEW_PROJECT": return "Browse projects →";
    case "REFERRAL_CONVERTED": return "See referrals →";
    default: return "View →";
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const notificationPrefs = [
  { id: "milestone", label: "Milestone completions", sub: "When a milestone on a project you fund is verified", enabled: true },
  { id: "campaign", label: "Campaign updates", sub: "Progress and new contributors to your campaigns", enabled: true },
  { id: "spotlight", label: "Monthly spotlight", sub: "When voting opens and a winner is announced", enabled: true },
  { id: "new_project", label: "New projects from your NGOs", sub: "When an NGO you've supported launches something new", enabled: false },
  { id: "referral", label: "Referral conversions", sub: "When someone you referred makes their first donation", enabled: true },
  { id: "weekly_digest", label: "Weekly impact digest", sub: "A summary of platform activity sent every Monday", enabled: false },
];

export default function NotificationsClient({ initialNotifications }: { initialNotifications: DbNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [prefs, setPrefs] = useState(notificationPrefs);
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");

  const unread = notifications.filter((n) => !n.read);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications/mark-read", { method: "POST", body: JSON.stringify({}) });
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markOneRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const togglePref = (id: string) => {
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unread.length > 0 && (
              <p className="text-sm text-gray-500">{unread.length} unread</p>
            )}
          </div>
        </div>
        {unread.length > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-gray-500">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("inbox")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "inbox" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Inbox
          {unread.length > 0 && (
            <span className="ml-2 text-xs bg-emerald-500 text-white rounded-full px-1.5 py-0.5">{unread.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Settings className="w-3.5 h-3.5" />
          Preferences
        </button>
      </div>

      {tab === "inbox" && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const { Icon, iconBg, iconColor } = getIconProps(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markOneRead(n.id)}
                  className={`relative flex gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${!n.read ? "bg-white border-emerald-100 shadow-sm" : "bg-gray-50 border-gray-100"}`}
                >
                  {!n.read && <div className="absolute top-4 right-10 w-2 h-2 bg-emerald-500 rounded-full" />}
                  <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                      {n.linkUrl && (
                        <Link
                          href={n.linkUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          {getLinkText(n.type)} <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "settings" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <p className="text-sm text-gray-500">Choose what you want to be notified about</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {prefs.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pref.sub}</p>
                  </div>
                  <button
                    onClick={() => togglePref(pref.id)}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${pref.enabled ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${pref.enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 pt-3">
              <Button size="sm" className="gap-2">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
