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

const VALID_ROLES = ["owner","manager","staff","cashier","kitchen","auditor","accountant"];
const ADVANCED_ROLES = new Set(["manager", "kitchen", "auditor"]);

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
  cashier: "Cashier",
  kitchen: "Kitchen",
  auditor: "Auditor",
  accountant: "Contabil extern",
};

const ROLE_LABELS_RO: Record<string, string> = {
  owner: "Proprietar",
  manager: "Manager",
  staff: "Personal",
  cashier: "Casier",
  kitchen: "Bucătărie",
  auditor: "Auditor",
  accountant: "Contabil extern",
};

const STATUS_LABELS_RO: Record<string, string> = {
  active: "activ",
  disabled: "dezactivat",
  invited: "invitat",
};

const UI_STRINGS = {
  en: {
    title: "Team members",
    count: (n: number) => `${n} member${n !== 1 ? "s" : ""}`,
    addMember: "Add team member",
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    joined: "Joined",
    actions: "Actions",
    edit: "Edit",
    resetLink: "Reset link",
    reEnable: "Re-enable",
    disable: "Disable",
    removeConfirm: "Remove?",
    yes: "Yes",
    no: "No",
    remove: "Remove",
    resetLinkLabel: "Reset link:",
    empty: "No team members yet.",
    editTitle: "Edit team member",
    fullName: "Full name",
    newPassword: "New password",
    keepPasswordHint: "(leave blank to keep current)",
    passwordPlaceholder: "Min. 8 characters",
    phone: "Phone",
    jobTitle: "Job title",
    jobTitleHint: "(displayed under name)",
    jobTitlePlaceholder: "Barista, Shift manager…",
    saving: "Saving...",
    saveChanges: "Save changes",
    cancel: "Cancel",
    addDesc: "Create a new user or add an existing one to your organisation.",
    tempPassword: "Temporary password",
    tempPasswordHint: "(leave blank to send a reset link)",
    optional: "Optional",
    generateResetLink: "Generate password reset link",
    added: "User added successfully!",
    resetLinkShare: "Password reset link (share with the user):",
    adding: "Adding...",
    addSubmit: "Add member",
    close: "Close",
    passwordSet: "Password set successfully.",
    errAdd: "Failed to add user",
    errRole: "Could not update role",
    errMember: "Could not update member",
    errSave: "Could not save changes",
    errRemove: "Could not remove member",
  },
  ro: {
    title: "Membrii echipei",
    count: (n: number) => (n === 1 ? "1 membru" : `${n} membri`),
    addMember: "Adăugați un membru",
    name: "Nume",
    email: "Email",
    role: "Rol",
    status: "Stare",
    joined: "Adăugat la",
    actions: "Acțiuni",
    edit: "Editați",
    resetLink: "Link de resetare",
    reEnable: "Reactivați",
    disable: "Dezactivați",
    removeConfirm: "Eliminați?",
    yes: "Da",
    no: "Nu",
    remove: "Eliminați",
    resetLinkLabel: "Link de resetare:",
    empty: "Niciun membru în echipă încă.",
    editTitle: "Editați membrul echipei",
    fullName: "Nume complet",
    newPassword: "Parolă nouă",
    keepPasswordHint: "(lăsați gol pentru a păstra parola actuală)",
    passwordPlaceholder: "Min. 8 caractere",
    phone: "Telefon",
    jobTitle: "Funcție",
    jobTitleHint: "(afișată sub nume)",
    jobTitlePlaceholder: "Barista, Șef de tură…",
    saving: "Se salvează...",
    saveChanges: "Salvați modificările",
    cancel: "Anulați",
    addDesc: "Creați un utilizator nou sau adăugați unul existent în organizația dumneavoastră.",
    tempPassword: "Parolă temporară",
    tempPasswordHint: "(lăsați gol pentru a trimite un link de resetare)",
    optional: "Opțional",
    generateResetLink: "Generați un link de resetare a parolei",
    added: "Utilizatorul a fost adăugat.",
    resetLinkShare: "Link de resetare a parolei (trimiteți-l utilizatorului):",
    adding: "Se adaugă...",
    addSubmit: "Adăugați membrul",
    close: "Închideți",
    passwordSet: "Parola a fost setată.",
    errAdd: "Utilizatorul nu a putut fi adăugat",
    errRole: "Rolul nu a putut fi actualizat",
    errMember: "Membrul nu a putut fi actualizat",
    errSave: "Modificările nu au putut fi salvate",
    errRemove: "Membrul nu a putut fi eliminat",
  },
} as const;

function StatusBadge({ status, ro }: { status: string; ro: boolean }) {
  return (
    <Badge variant={status === "active" ? "secondary" : "outline"} className={status === "disabled" ? "text-red-500 border-attention/25" : ""}>
      {ro ? (STATUS_LABELS_RO[status] ?? status) : status}
    </Badge>
  );
}

export function TeamClient({
  initialMembers,
  advancedRolesAllowed,
  locale,
}: {
  initialMembers: Member[];
  advancedRolesAllowed: boolean;
  locale?: string | null;
}) {
  const ro = locale === "ro";
  const ui = UI_STRINGS[ro ? "ro" : "en"];
  const roleLabels = ro ? ROLE_LABELS_RO : ROLE_LABELS;
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ email: "", fullName: "", role: "cashier", phone: "", temporaryPassword: "", sendInvite: false });
  const [addResult, setAddResult] = useState<{ resetLink?: string | null; error?: string } | null>(null);
  const [resetResults, setResetResults] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", roleTitle: "", email: "", newPassword: "" });
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
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
        setAddResult({ error: data.error ?? ui.errAdd });
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
        setActionError(data?.error ?? ui.errRole);
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
      if (!res.ok) setActionError(data?.error ?? ui.errMember);
      await refreshMembers();
    } finally {
      setActionLoading(null);
    }
  }

  function openEditModal(m: Member) {
    setEditMember(m);
    setEditForm({
      fullName: m.profile?.full_name ?? "",
      phone: m.profile?.phone ?? "",
      roleTitle: m.profile?.role_title ?? "",
      email: m.profile?.email ?? "",
      newPassword: "",
    });
    setEditError(null);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editMember) return;
    setActionLoading(editMember.id + "-edit");
    setEditError(null);
    try {
      const res = await fetch(`/api/team/${editMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone,
          roleTitle: editForm.roleTitle,
          email: editForm.email || undefined,
          password: editForm.newPassword || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setEditError(data?.error ?? ui.errSave);
        return;
      }
      setEditMember(null);
      await refreshMembers();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(memberId: string) {
    setActionLoading(memberId + "-remove");
    setActionError(null);
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setActionError(data?.error ?? ui.errRemove);
      } else {
        setConfirmRemoveId(null);
        await refreshMembers();
      }
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
        setResetResults((prev) => ({ ...prev, [memberId]: ui.passwordSet }));
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{ui.title}</h2>
          <p className="text-sm text-muted-foreground">{ui.count(members.length)}</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setAddResult(null); }}>{ui.addMember}</Button>
      </div>
      {actionError && (
        <div className="rounded bg-attention/10 px-4 py-3 text-sm text-attention">
          {actionError}
        </div>
      )}

      {/* Members table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-mid">{ui.name}</th>
                  <th className="text-left px-4 py-3 font-medium text-mid">{ui.email}</th>
                  <th className="text-left px-4 py-3 font-medium text-mid">{ui.role}</th>
                  <th className="text-left px-4 py-3 font-medium text-mid">{ui.status}</th>
                  <th className="text-left px-4 py-3 font-medium text-mid">{ui.joined}</th>
                  <th className="text-right px-4 py-3 font-medium text-mid">{ui.actions}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-secondary">
                    <td className="px-4 py-3">
                      <p className="font-medium">{m.profile?.full_name ?? "—"}</p>
                      {m.profile?.role_title && <p className="text-xs text-muted-foreground">{m.profile.role_title}</p>}
                    </td>
                    <td className="px-4 py-3 text-mid">{m.profile?.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        disabled={actionLoading === m.id + "-role"}
                        className="h-7 rounded border border-border px-2 text-xs"
                      >
                        {(visibleRoles.includes(m.role)
                          ? visibleRoles
                          : [m.role, ...visibleRoles].filter((role, index, arr) => arr.indexOf(role) === index)
                        ).map((r) => (
                          <option key={r} value={r}>{roleLabels[r] ?? r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} ro={ro} /></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("ro-RO", { timeZone: "Europe/Bucharest" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openEditModal(m)}
                        >
                          {ui.edit}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={actionLoading === m.id + "-reset"}
                          onClick={() => handleResetPassword(m.id)}
                        >
                          {actionLoading === m.id + "-reset" ? "..." : ui.resetLink}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs ${m.status === "disabled" ? "text-reconciled" : "text-red-500"}`}
                          disabled={actionLoading === m.id + "-disable"}
                          onClick={() => handleToggleDisable(m.id)}
                        >
                          {actionLoading === m.id + "-disable" ? "..." : m.status === "disabled" ? ui.reEnable : ui.disable}
                        </Button>
                        {confirmRemoveId === m.id ? (
                          <span className="flex items-center gap-1 text-xs">
                            <span className="text-mid">{ui.removeConfirm}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-attention px-2"
                              disabled={actionLoading === m.id + "-remove"}
                              onClick={() => handleRemove(m.id)}
                            >
                              {actionLoading === m.id + "-remove" ? "..." : ui.yes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => setConfirmRemoveId(null)}
                            >
                              {ui.no}
                            </Button>
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-attention"
                            onClick={() => setConfirmRemoveId(m.id)}
                          >
                            {ui.remove}
                          </Button>
                        )}
                      </div>
                      {resetResults[m.id] && (
                        <div className="mt-1 text-xs text-left">
                          <p className="text-reconciled font-medium">{ui.resetLinkLabel}</p>
                          <p className="break-all text-mid max-w-xs">{resetResults[m.id]}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{ui.empty}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit member modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{ui.editTitle}</CardTitle>
              <CardDescription>{editMember.profile?.email ?? ""}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <Label>{ui.fullName}</Label>
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Maria Popescu"
                  />
                </div>
                <div>
                  <Label>{ui.email}</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="maria@restaurant.ro"
                  />
                </div>
                <div>
                  <Label>{ui.newPassword} <span className="text-muted-foreground text-xs">{ui.keepPasswordHint}</span></Label>
                  <Input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder={ui.passwordPlaceholder}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <Label>{ui.phone}</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+40 7xx xxx xxx"
                  />
                </div>
                <div>
                  <Label>{ui.jobTitle} <span className="text-muted-foreground text-xs">{ui.jobTitleHint}</span></Label>
                  <Input
                    value={editForm.roleTitle}
                    onChange={(e) => setEditForm({ ...editForm, roleTitle: e.target.value })}
                    placeholder={ui.jobTitlePlaceholder}
                  />
                </div>
                {editError && (
                  <p className="text-sm text-attention bg-attention/10 rounded px-3 py-2">{editError}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={actionLoading === editMember.id + "-edit"} className="flex-1">
                    {actionLoading === editMember.id + "-edit" ? ui.saving : ui.saveChanges}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditMember(null)}>
                    {ui.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add member modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{ui.addMember}</CardTitle>
              <CardDescription>{ui.addDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label>{ui.fullName} *</Label>
                  <Input required value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} placeholder="Maria Popescu" />
                </div>
                <div>
                  <Label>{ui.email} *</Label>
                  <Input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="maria@restaurant.ro" />
                </div>
                <div>
                  <Label>{ui.phone}</Label>
                  <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="+40 7xx xxx xxx" />
                </div>
                <div>
                  <Label>{ui.role} *</Label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="mt-1 w-full h-10 rounded-md border border-border px-3 text-sm"
                  >
                    {visibleRoles.filter((r) => r !== "owner").map((r) => (
                      <option key={r} value={r}>{roleLabels[r] ?? r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>{ui.tempPassword} <span className="text-muted-foreground text-xs">{ui.tempPasswordHint}</span></Label>
                  <Input
                    type="password"
                    value={addForm.temporaryPassword}
                    onChange={(e) => setAddForm({ ...addForm, temporaryPassword: e.target.value })}
                    placeholder={ui.optional}
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
                    {ui.generateResetLink}
                  </label>
                )}

                {addResult?.error && (
                  <p className="text-sm text-attention bg-attention/10 rounded px-3 py-2">{addResult.error}</p>
                )}
                {addResult?.resetLink !== undefined && !addResult.error && (
                  <div className="bg-reconciled/10 rounded px-3 py-2 text-sm">
                    <p className="text-reconciled font-medium">{ui.added}</p>
                    {addResult.resetLink && (
                      <>
                        <p className="text-xs text-mid mt-1">{ui.resetLinkShare}</p>
                        <p className="break-all text-xs text-brass mt-1">{addResult.resetLink}</p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? ui.adding : ui.addSubmit}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setAddResult(null); }}>
                    {ui.close}
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
