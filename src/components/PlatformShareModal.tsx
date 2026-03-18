"use client";
import { useState, useRef, useEffect } from "react";
import {
  X, Copy, Check, Linkedin, MessageCircle, Mail, Twitter,
  Share2, Users, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  /** The canonical URL being shared */
  url: string;
  /** Short post title (used for LinkedIn / email subject) */
  title: string;
  /** Main share text — pre-filled in WhatsApp, Twitter, email body */
  text: string;
  /** Optional longer email body (falls back to text + url) */
  emailBody?: string;
  /** When true, shows an "Invite by email" section for skill campaigns */
  showInvite?: boolean;
}

/**
 * Builds platform-specific deep-link URLs.
 * All of these open the target app / website with the message pre-filled
 * so the user just taps Post / Send.
 */
function buildLinks(url: string, title: string, text: string, emailBody?: string) {
  const fullMessage = `${text}\n\n${url}`;
  const subject = title;
  const body = emailBody ?? fullMessage;

  return {
    whatsapp:  `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
    // LinkedIn shareArticle passes both URL preview AND a summary blurb
    linkedin:  `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}&source=GiveLedger`,
    twitter:   `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    email:     `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    gmail:     `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

const PLATFORM_COLORS = {
  whatsapp: "bg-[#25D366] hover:bg-[#20bd5a]",
  linkedin: "bg-[#0A66C2] hover:bg-[#0958a8]",
  twitter:  "bg-[#000000] hover:bg-[#1a1a1a]",
  email:    "bg-gray-700 hover:bg-gray-800",
  gmail:    "bg-[#EA4335] hover:bg-[#d03527]",
};

export default function PlatformShareModal({
  open, onClose, url, title, text, emailBody, showInvite = false,
}: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const links = buildLinks(url, title, text, emailBody);

  useEffect(() => {
    if (!open) {
      setInviteEmails("");
      setInviteSent(false);
      setShowInviteForm(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function sendEmailInvites() {
    const emails = inviteEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean)
      .join(",");
    if (!emails) return;
    const body = emailBody ?? `${text}\n\n${url}`;
    window.open(
      `mailto:${emails}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`,
      "_blank",
    );
    setInviteSent(true);
  }

  // Native contact picker (Chrome Android / Safari iOS 16+)
  async function pickContacts() {
    if (!("contacts" in navigator && "ContactsManager" in window)) return;
    try {
      // @ts-expect-error — ContactsManager is not yet in TypeScript lib
      const contacts = await navigator.contacts.select(["email", "name"], { multiple: true });
      const emails = contacts.flatMap((c: { email?: string[] }) => c.email ?? []).join(", ");
      setInviteEmails((prev) => (prev ? `${prev}, ${emails}` : emails));
      setShowInviteForm(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      // user dismissed picker
    }
  }

  const hasNativeContactPicker =
    typeof window !== "undefined" &&
    "contacts" in navigator &&
    "ContactsManager" in window;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet — slides up on mobile, centered modal on desktop */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Share</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tap a platform — it opens with your message pre-filled.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Message preview */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 leading-relaxed line-clamp-4">
            {text}
          </div>

          {/* Platform buttons — 2 per row */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${PLATFORM_COLORS.whatsapp}`}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              WhatsApp
            </a>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${PLATFORM_COLORS.linkedin}`}
            >
              <Linkedin className="w-4 h-4 shrink-0" />
              LinkedIn
            </a>
            <a
              href={links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${PLATFORM_COLORS.twitter}`}
            >
              <Twitter className="w-4 h-4 shrink-0" />
              X / Twitter
            </a>
            <a
              href={links.email}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${PLATFORM_COLORS.email}`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              Email
            </a>
          </div>

          {/* Gmail — full width */}
          <a
            href={links.gmail}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${PLATFORM_COLORS.gmail}`}
          >
            {/* Gmail G icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
            </svg>
            Open Gmail &amp; send
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* Copy link */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <p className="text-xs text-gray-500 font-mono flex-1 truncate">{url}</p>
            <button
              onClick={copyLink}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "Copied!" : "Copy link"}
            </button>
          </div>

          {/* Invite specific people — shown for skill campaigns */}
          {showInvite && (
            <div className="border border-violet-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowInviteForm((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-violet-800">
                  <Users className="w-4 h-4" />
                  Invite specific people by email
                </span>
                {showInviteForm
                  ? <ChevronUp className="w-4 h-4 text-violet-500" />
                  : <ChevronDown className="w-4 h-4 text-violet-500" />
                }
              </button>

              {showInviteForm && (
                <div className="px-4 py-4 bg-white space-y-3">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Enter email addresses (comma or line separated). Your default email app will open addressed to them with your invite message pre-filled.
                  </p>

                  {hasNativeContactPicker && (
                    <button
                      type="button"
                      onClick={pickContacts}
                      className="w-full flex items-center justify-center gap-2 border border-violet-200 text-violet-700 text-xs font-semibold py-2 rounded-lg hover:bg-violet-50 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Pick from phone contacts
                    </button>
                  )}

                  <textarea
                    ref={inputRef}
                    rows={3}
                    placeholder="alice@example.com, bob@example.com"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                  />

                  <button
                    type="button"
                    onClick={sendEmailInvites}
                    disabled={!inviteEmails.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {inviteSent ? "Email app opened ✓" : "Open email app with invites"}
                  </button>

                  <p className="text-[10px] text-gray-400 text-center">
                    Your email app opens — you stay in control of who receives it.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
