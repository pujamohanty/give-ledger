"use client";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Globe, Users, FileText, Upload, Trash2, Loader2,
  CheckCircle2, Plus, Linkedin, ExternalLink, Sparkles, UserCircle,
} from "lucide-react";

type BoardMember = {
  id: string;
  name: string;
  role: string;
  memberType: string;
  bio: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
};

type DocMeta = {
  id: string;
  fileName: string;
  category: string;
  mimeType: string;
  fileSize: number;
  caption: string | null;
  createdAt: string;
};

type OrgProfileData = {
  id: string;
  orgName: string;
  description: string | null;
  website: string | null;
  aiSummary: string | null;
  boardMembers: BoardMember[];
  documents: DocMeta[];
};

export default function OrgProfileClient({ initial }: { initial: OrgProfileData }) {
  // About
  const [orgName, setOrgName] = useState(initial.orgName);
  const [description, setDescription] = useState(initial.description ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // AI
  const [aiSummary, setAiSummary] = useState(initial.aiSummary ?? "");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Board / Founders
  const [members, setMembers] = useState<BoardMember[]>(initial.boardMembers);
  const [addingMember, setAddingMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newType, setNewType] = useState("BOARD_MEMBER");
  const [newBio, setNewBio] = useState("");
  const [newLinkedin, setNewLinkedin] = useState("");
  const [savingMember, setSavingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  // Documents
  const [docs, setDocs] = useState<DocMeta[]>(initial.documents);
  const [docCategory, setDocCategory] = useState("PROJECT");
  const [docCaption, setDocCaption] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const publicUrl = `/ngo/${initial.id}`;

  async function handleSaveAbout() {
    setSaving(true); setSaved(false); setSaveError("");
    try {
      const res = await fetch("/api/ngo/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, description, website }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setSaveError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  }

  async function handleGenerateAi() {
    setGeneratingAi(true);
    try {
      const res = await fetch("/api/ai/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: initial.id, targetType: "NGO" }),
      });
      const data = await res.json();
      if (data.summary) { setAiSummary(data.summary); setDescription(data.summary); }
    } catch { /* silent */ } finally { setGeneratingAi(false); }
  }

  async function handleAddMember() {
    if (!newName.trim() || !newRole.trim()) { setMemberError("Name and role are required."); return; }
    setSavingMember(true); setMemberError("");
    try {
      const res = await fetch("/api/ngo/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, role: newRole, memberType: newType, bio: newBio, linkedinUrl: newLinkedin }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers((prev) => [...prev, data.member]);
        setNewName(""); setNewRole(""); setNewType("BOARD_MEMBER"); setNewBio(""); setNewLinkedin("");
        setAddingMember(false);
      } else { setMemberError(data.error ?? "Failed to add member"); }
    } catch { setMemberError("Failed to add member"); }
    finally { setSavingMember(false); }
  }

  async function handleDeleteMember(id: string) {
    await fetch(`/api/ngo/board/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
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
        const res = await fetch("/api/ngo/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name, category: docCategory, mimeType: file.type,
            fileSize: file.size, fileData: base64, caption: docCaption || null,
          }),
        });
        const data = await res.json();
        if (res.ok) { setDocs((prev) => [data.document, ...prev]); setDocCaption(""); }
        else setDocError(data.error ?? "Upload failed");
        setUploadingDoc(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } catch { setDocError("Upload failed"); setUploadingDoc(false); }
  }

  async function handleDeleteDoc(id: string) {
    await fetch(`/api/ngo/documents/${id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  const founders = members.filter((m) => m.memberType === "FOUNDER");
  const boardOnly = members.filter((m) => m.memberType !== "FOUNDER");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NGO Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Build your public profile — visible to donors browsing NGOs.
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

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" /> About Your Organisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Organisation name</Label>
              <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Website
              </Label>
              <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourorg.org" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Mission &amp; description</Label>
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={generatingAi}
                  className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  {generatingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {generatingAi ? "Generating..." : "AI-write our story"}
                </button>
              </div>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell donors about your mission, the communities you serve, and the impact you've created..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              {aiSummary && (
                <p className="text-xs text-violet-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI-generated — review and edit before saving
                </p>
              )}
            </div>
            {saveError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{saveError}</p>}
            <div className="flex items-center gap-3">
              <Button onClick={handleSaveAbout} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Founders & Board */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Founders &amp; Board Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Add founders and board members to show donors who leads your organisation.
            </p>

            {/* Existing members */}
            {members.length > 0 && (
              <div className="space-y-2">
                {founders.length > 0 && (
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Founders</p>
                )}
                {founders.map((m) => <MemberRow key={m.id} member={m} onDelete={handleDeleteMember} />)}
                {boardOnly.length > 0 && (
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3">Board Members</p>
                )}
                {boardOnly.map((m) => <MemberRow key={m.id} member={m} onDelete={handleDeleteMember} />)}
              </div>
            )}

            {/* Add member form */}
            {addingMember ? (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Full name *</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Title / Role *</Label>
                    <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Co-Founder & CEO" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BOARD_MEMBER">Board Member</option>
                    <option value="FOUNDER">Founder</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Short bio</Label>
                  <textarea
                    rows={2}
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Brief background..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><Linkedin className="w-3 h-3 text-blue-600" /> LinkedIn URL</Label>
                  <Input value={newLinkedin} onChange={(e) => setNewLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                {memberError && <p className="text-xs text-red-600">{memberError}</p>}
                <div className="flex gap-2">
                  <Button onClick={handleAddMember} disabled={savingMember} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4">
                    {savingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add Member"}
                  </Button>
                  <Button variant="outline" onClick={() => { setAddingMember(false); setMemberError(""); }} className="text-sm px-4">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingMember(true)}
                className="flex items-center gap-2 text-sm text-emerald-700 font-medium border border-dashed border-emerald-300 rounded-lg px-4 py-2.5 hover:bg-emerald-50 w-full justify-center"
              >
                <Plus className="w-4 h-4" /> Add person
              </button>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Documents &amp; Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Upload project reports, impact photos, legal documents, or founder bios. These appear on your public profile.
            </p>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PROJECT">Past Project</option>
                  <option value="GALLERY">Gallery / Photos</option>
                  <option value="REPORT">Impact Report</option>
                  <option value="LEGAL">Legal / Compliance</option>
                  <option value="FOUNDER">Founder Bio</option>
                  <option value="OTHER">Other</option>
                </select>
                <Input
                  value={docCaption}
                  onChange={(e) => setDocCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  className="flex-1 min-w-0"
                />
              </div>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed text-sm font-medium cursor-pointer transition-colors w-fit ${uploadingDoc ? "border-gray-200 text-gray-400" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>
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
                        <p className="text-xs text-gray-400">
                          {doc.category} · {(doc.fileSize / 1024).toFixed(0)}KB
                          {doc.caption && ` · ${doc.caption}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={`/api/ngo/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">View</a>
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

      </div>
    </div>
  );
}

function MemberRow({ member, onDelete }: { member: BoardMember; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <UserCircle className="w-5 h-5 text-emerald-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{member.name}</p>
          {member.memberType === "FOUNDER" && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Founder</span>
          )}
        </div>
        <p className="text-xs text-emerald-700 font-medium">{member.role}</p>
        {member.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{member.bio}</p>}
        {member.linkedinUrl && (
          <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5">
            <Linkedin className="w-3 h-3" /> LinkedIn
          </a>
        )}
      </div>
      <button type="button" onClick={() => onDelete(member.id)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
