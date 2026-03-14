"use client";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Twitter, Globe, Briefcase, MapPin, CheckCircle2, Loader2, User, ExternalLink, Upload, FileText, Trash2, Sparkles } from "lucide-react";

const SKILL_OPTIONS = [
  "IT & Engineering",
  "Marketing",
  "Legal",
  "Fundraising",
  "Design",
  "Training & Education",
  "Finance & Accounting",
  "Communications",
  "Project Management",
  "Other",
];

type DocMeta = { id: string; fileName: string; category: string; mimeType: string; fileSize: number; createdAt: string };

type ProfileData = {
  id: string;
  name: string | null;
  bio: string | null;
  jobTitle: string | null;
  company: string | null;
  city: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  portfolioUrl: string | null;
  skills: string | null;
  image: string | null;
  documents: DocMeta[];
};

export default function ProfileClient({ initial }: { initial: ProfileData }) {
  const [name, setName] = useState(initial.name ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [jobTitle, setJobTitle] = useState(initial.jobTitle ?? "");
  const [company, setCompany] = useState(initial.company ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl ?? "");
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(initial.portfolioUrl ?? "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initial.skills ? initial.skills.split(",").filter(Boolean) : []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Document upload state
  const [docs, setDocs] = useState<DocMeta[]>(initial.documents ?? []);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docCategory, setDocCategory] = useState("CV");
  const [docError, setDocError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI summary state
  const [aiSummary, setAiSummary] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setDocError("File too large. Max 10MB."); return; }
    setUploadingDoc(true); setDocError("");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/donor/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, category: docCategory, mimeType: file.type, fileSize: file.size, fileData: base64 }),
        });
        const data = await res.json();
        if (res.ok) setDocs((prev) => [data.document, ...prev]);
        else setDocError(data.error ?? "Upload failed");
        setUploadingDoc(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } catch { setDocError("Upload failed"); setUploadingDoc(false); }
  }

  async function handleDeleteDoc(id: string) {
    await fetch(`/api/donor/documents/${id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleGenerateAi() {
    setGeneratingAi(true);
    try {
      const res = await fetch("/api/ai/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: initial.id, targetType: "USER" }),
      });
      const data = await res.json();
      if (data.summary) { setAiSummary(data.summary); setBio(data.summary); }
    } catch { /* silent */ } finally { setGeneratingAi(false); }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/donor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, bio, jobTitle, company, city,
          linkedinUrl, twitterUrl, portfolioUrl,
          skills: selectedSkills.join(","),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const publicUrl = `/donor/${initial.id}/profile`;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            This profile is visible to NGOs when you offer skill contributions.
          </p>
        </div>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-emerald-600 hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          View public profile
        </a>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company / Organisation</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> City, State</span>
              </Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. San Francisco, CA" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Professional bio</Label>
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={generatingAi}
                  className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  {generatingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {generatingAi ? "Generating..." : "AI-write my bio"}
                </button>
              </div>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your background, expertise, and what kind of work you can offer to NGOs..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              {aiSummary && (
                <p className="text-xs text-violet-600 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI-generated — review and edit before saving</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" /> Skills I Can Offer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Select all that apply. NGOs use this to match you with projects that need your expertise.
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      active
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" /> Social & Professional Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn
              </Label>
              <Input
                id="linkedin"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="twitter" className="flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-sky-500" /> X (Twitter)
              </Label>
              <Input
                id="twitter"
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://x.com/yourhandle"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="portfolio" className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-500" /> Portfolio / Website
              </Label>
              <Input
                id="portfolio"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Documents &amp; Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">Upload your CV, certificates, or portfolio. These are shown on your public profile so NGOs can verify your background.</p>
            <div className="flex items-center gap-3">
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CV">CV / Resume</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="PORTFOLIO">Portfolio</option>
                <option value="OTHER">Other</option>
              </select>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed text-sm font-medium cursor-pointer transition-colors ${uploadingDoc ? "border-gray-200 text-gray-400" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>
                {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingDoc ? "Uploading..." : "Choose file"}
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileUpload} disabled={uploadingDoc} />
              </label>
            </div>
            {docError && <p className="text-xs text-red-600">{docError}</p>}
            <p className="text-xs text-gray-400">Accepted: PDF, Word, PNG, JPG. Max 10MB per file.</p>
            {docs.length > 0 && (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-400">{doc.category} · {(doc.fileSize / 1024).toFixed(0)}KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={`/api/donor/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">View</a>
                      <button type="button" onClick={() => handleDeleteDoc(doc.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
