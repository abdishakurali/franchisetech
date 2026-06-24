"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role_title: string | null;
  phone: string | null;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  invited_by: string | null;
  disabled_at: string | null;
  profile: Profile | null;
}

const VALID_ROLES = ["owner","manager","staff","cashier","kitchen","auditor"];
const ADVANCED_ROLES = new Set(["manager", "kitchen", "auditor"]);

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
  cashier: "Cashier",
  kitchen: "Kitchen",
  auditor: "Auditor",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "active" ? "secondary" : "outline"} className={status === "disabled" ? "text-red-500 border-red-200" : ""}>
      {status}
    </Badge>
  );
}

export function TeamClient({
  initialMembers,
  advancedRolesAllowed,
}: {
  initialMembers: Member[];
  advancedRolesAllowed: boolean;
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ email: "", fullName: "", role: "cashier", phone: "", temporaryPassword: "", sendInvite: false });
  const [addResult, setAddResult] = useState<{ resetLink?: string | null; error?: string } | null>(null);
  const [resetResults, setResetResults] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const visibleRoles = VALID_ROLES.filter((role) => advancedRolesAllowed || !ADVANCED_ROLES.has(role));

  async function refreshMembers() {
    const res = await fetch("/api/team");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAddResult(null);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addForm.email,
          fullName: addForm.fullName,
          role: addForm.role,
          phone: addForm.phone || undefined,
          temporaryPassword: addForm.temporaryPassword || undefined,
          sendInvite: addForm.sendInvite,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddResult({ error: data.error ?? "Failed to add user" });
      } else {
        setAddResult({ resetLink: data.resetLink ?? null });
        setAddForm({ email: "", fullName: "", role: "cashier", phone: "", temporaryPassword: "", sendInvite: false });
        await refreshMembers();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setActionLoading(memberId + "-role");
    setActionError(null);
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setActionError(data?.error ?? "Could not update role");
      }
      await refreshMembers();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleDisable(memberId: string) {
    setActionLoading(memberId + "-disable");
    setActionError(null);
    try {
      const res = await fetch(`/api/team/${memberId}/disable`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) setActionError(data?.error ?? "Could not update member");
      await refreshMembers();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPassword(memberId: string, temporaryPassword?: string) {
    setActionLoading(memberId + "-reset");
    try {
      const res = await fetch(`/api/team/${memberId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temporaryPassword: temporaryPassword || undefined }),
      });
      const data = await res.json();
      if (data.resetLink) {
        setResetResults((prev) => ({ ...prev, [memberId]: data.resetLink }));
      } else if (data.success) {
        setResetResults((prev) => ({ ...prev, [memberId]: "Password set successfully." }));
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Team members</h2>
          <p className="text-sm text-slate-500">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setAddResult(null); }}>Add team member</Button>
      </div>
      {actionError && (
        <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Members table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{m.profile?.full_name ?? "—"}</p>
                      {m.profile?.role_title && <p className="text-xs text-slate-400">{m.profile.role_title}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.profile?.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        disabled={actionLoading === m.id + "-role"}
                        className="h-7 rounded border border-slate-200 px-2 text-xs"
                      >
                        {(visibleRoles.includes(m.role)
                          ? visibleRoles
                          : [m.role, ...visibleRoles].filter((role, index, arr) => arr.indexOf(role) === index)
                        ).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={actionLoading === m.id + "-reset"}
                          onClick={() => handleResetPassword(m.id)}
                        >
                          {actionLoading === m.id + "-reset" ? "..." : "Reset link"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs ${m.status === "disabled" ? "text-green-600" : "text-red-500"}`}
                          disabled={actionLoading === m.id + "-disable"}
                          onClick={() => handleToggleDisable(m.id)}
                        >
                          {actionLoading === m.id + "-disable" ? "..." : m.status === "disabled" ? "Re-enable" : "Disable"}
                        </Button>
                      </div>
                      {resetResults[m.id] && (
                        <div className="mt-1 text-xs text-left">
                          <p className="text-green-700 font-medium">Reset link:</p>
                          <p className="break-all text-slate-600 max-w-xs">{resetResults[m.id]}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No team members yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add member modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add team member</CardTitle>
              <CardDescription>Create a new user or add an existing one to your organisation.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label>Full name *</Label>
                  <Input required value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} placeholder="Maria Popescu" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="maria@restaurant.ro" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="+40 7xx xxx xxx" />
                </div>
                <div>
                  <Label>Role *</Label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="mt-1 w-full h-10 rounded-md border border-slate-200 px-3 text-sm"
                  >
                    {visibleRoles.filter((r) => r !== "owner").map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Temporary password <span className="text-slate-400 text-xs">(leave blank to send a reset link)</span></Label>
                  <Input
                    type="password"
                    value={addForm.temporaryPassword}
                    onChange={(e) => setAddForm({ ...addForm, temporaryPassword: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                {!addForm.temporaryPassword && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.sendInvite}
                      onChange={(e) => setAddForm({ ...addForm, sendInvite: e.target.checked })}
                      className="rounded"
                    />
                    Generate password reset link
                  </label>
                )}

                {addResult?.error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{addResult.error}</p>
                )}
                {addResult?.resetLink !== undefined && !addResult.error && (
                  <div className="bg-green-50 rounded px-3 py-2 text-sm">
                    <p className="text-green-700 font-medium">User added successfully!</p>
                    {addResult.resetLink && (
                      <>
                        <p className="text-xs text-slate-600 mt-1">Password reset link (share with the user):</p>
                        <p className="break-all text-xs text-blue-700 mt-1">{addResult.resetLink}</p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Adding..." : "Add member"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setAddResult(null); }}>
                    Close
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
