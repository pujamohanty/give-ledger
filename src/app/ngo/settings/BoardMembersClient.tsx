"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, Pencil, X, Check, Linkedin } from "lucide-react";

export type BoardMemberData = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
  orderIndex: number;
};

type Props = {
  initialMembers: BoardMemberData[];
};

const EMPTY_FORM = {
  name: "",
  role: "",
  bio: "",
  linkedinUrl: "",
  photoUrl: "",
};

export default function BoardMembersClient({ initialMembers }: Props) {
  const [members, setMembers] = useState<BoardMemberData[]>(initialMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    setAddError(null);
    if (!addForm.name.trim() || !addForm.role.trim()) {
      setAddError("Name and role are required.");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/ngo/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "Failed to add member.");
        return;
      }
      setMembers((prev) => [...prev, data.member]);
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(m: BoardMemberData) {
    setEditingId(m.id);
    setEditForm({
      name: m.name,
      role: m.role,
      bio: m.bio ?? "",
      linkedinUrl: m.linkedinUrl ?? "",
      photoUrl: m.photoUrl ?? "",
    });
    setEditError(null);
  }

  async function handleEdit(id: string) {
    setEditError(null);
    if (!editForm.name.trim() || !editForm.role.trim()) {
      setEditError("Name and role are required.");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/ngo/board/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Failed to update member.");
        return;
      }
      setMembers((prev) => prev.map((m) => (m.id === id ? data.member : m)));
      setEditingId(null);
    } catch {
      setEditError("Network error. Please try again.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/ngo/board/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          Board Members &amp; Leadership
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.length === 0 && !showAddForm && (
          <p className="text-sm text-gray-500 text-center py-4">
            No board members added yet. Add your first member below.
          </p>
        )}

        {/* Existing members list */}
        <div className="space-y-3">
          {members.map((m) =>
            editingId === m.id ? (
              <div key={m.id} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Dr. James Kimani"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Role *</Label>
                    <Input
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      placeholder="Chairman"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Short bio</Label>
                  <Input
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="20+ years in community development..."
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">LinkedIn URL</Label>
                    <Input
                      value={editForm.linkedinUrl}
                      onChange={(e) => setEditForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Photo URL</Label>
                    <Input
                      value={editForm.photoUrl}
                      onChange={(e) => setEditForm((f) => ({ ...f, photoUrl: e.target.value }))}
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                    onClick={() => handleEdit(m.id)}
                    disabled={editLoading}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {editLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setEditingId(null)}
                    disabled={editLoading}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={m.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-emerald-700">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-emerald-700 font-medium">{m.role}</p>
                    {m.bio && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{m.bio}</p>
                    )}
                    {m.linkedinUrl && (
                      <a
                        href={m.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"
                      >
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => startEdit(m)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Add new member form */}
        {showAddForm ? (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
            <p className="text-sm font-semibold text-gray-800">Add Board Member</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Dr. James Kimani"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role *</Label>
                <Input
                  value={addForm.role}
                  onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="Chairman"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Short bio</Label>
              <Input
                value={addForm.bio}
                onChange={(e) => setAddForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="20+ years in community development..."
                className="h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">LinkedIn URL</Label>
                <Input
                  value={addForm.linkedinUrl}
                  onChange={(e) => setAddForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Photo URL</Label>
                <Input
                  value={addForm.photoUrl}
                  onChange={(e) => setAddForm((f) => ({ ...f, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="h-8 text-sm"
                />
              </div>
            </div>
            {addError && <p className="text-xs text-red-600">{addError}</p>}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                onClick={handleAdd}
                disabled={addLoading}
              >
                <Check className="w-3 h-3 mr-1" />
                {addLoading ? "Adding..." : "Add Member"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  setShowAddForm(false);
                  setAddForm(EMPTY_FORM);
                  setAddError(null);
                }}
                disabled={addLoading}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Board Member
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
