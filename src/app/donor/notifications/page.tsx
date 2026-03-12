"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Zap, Star, Gift, X, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialNotifications = [
  {
    id: "n1",
    type: "MILESTONE_COMPLETE",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Milestone verified on Kibera Water project",
    message: "Installation — Schools 7–12 has been reviewed and approved. $7,500 released to WaterBridge Kenya.",
    linkUrl: "/share/m1",
    linkText: "See proof →",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    type: "CAMPAIGN_UPDATE",
    icon: Gift,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Your campaign raised $200 this week",
    message: "3 new contributors joined your \"Help fund Kibera schools\" campaign. Total raised: $3,200.",
    linkUrl: "/campaigns/c1",
    linkText: "View campaign →",
    time: "1 day ago",
    read: false,
  },
  {
    id: "n3",
    type: "SPOTLIGHT_WINNER",
    icon: Star,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "This month's spotlight winner announced",
    message: "Clean Water for Kibera Schools won this month's spotlight vote and is now featured on the homepage.",
    linkUrl: "/projects/1",
    linkText: "View project →",
    time: "3 days ago",
    read: false,
  },
  {
    id: "n4",
    type: "NEW_PROJECT",
    icon: Zap,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "WaterBridge Kenya launched a new project",
    message: "An NGO you've previously supported has launched: \"Rainwater Harvesting — Kibera Phase 2\"",
    linkUrl: "/projects",
    linkText: "Browse projects →",
    time: "5 days ago",
    read: true,
  },
  {
    id: "n5",
    type: "MILESTONE_COMPLETE",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Milestone completed on Bihar Training project",
    message: "Cohort 1 training verified — 45 women certified. Funds of $12,000 released to Pragati Foundation.",
    linkUrl: "/share/m2",
    linkText: "See proof →",
    time: "1 week ago",
    read: true,
  },
  {
    id: "n6",
    type: "REFERRAL",
    icon: Gift,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    title: "Someone you referred just made their first donation",
    message: "Your referral link brought in a new donor who donated $100 to the Mysore Elderly Care project.",
    linkUrl: "/donor/referral",
    linkText: "See referrals →",
    time: "1 week ago",
    read: true,
  },
];

const notificationPrefs = [
  { id: "milestone", label: "Milestone completions", sub: "When a milestone on a project you fund is verified", enabled: true },
  { id: "campaign", label: "Campaign updates", sub: "Progress and new contributors to your campaigns", enabled: true },
  { id: "spotlight", label: "Monthly spotlight", sub: "When voting opens and a winner is announced", enabled: true },
  { id: "new_project", label: "New projects from your NGOs", sub: "When an NGO you've supported launches something new", enabled: false },
  { id: "referral", label: "Referral conversions", sub: "When someone you referred makes their first donation", enabled: true },
  { id: "weekly_digest", label: "Weekly impact digest", sub: "A summary of platform activity sent every Monday", enabled: false },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [prefs, setPrefs] = useState(notificationPrefs);
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");

  const unread = notifications.filter((n) => !n.read);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
            notifications.map((n) => (
              <div
                key={n.id}
                className={`relative flex gap-4 p-4 rounded-xl border transition-colors ${!n.read ? "bg-white border-emerald-100 shadow-sm" : "bg-gray-50 border-gray-100"}`}
              >
                {!n.read && <div className="absolute top-4 right-10 w-2 h-2 bg-emerald-500 rounded-full" />}
                <div className={`w-10 h-10 ${n.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <n.icon className={`w-5 h-5 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">{n.time}</span>
                    {n.linkUrl && (
                      <Link href={n.linkUrl} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        {n.linkText} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
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
