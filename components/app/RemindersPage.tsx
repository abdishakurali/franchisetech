"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Bell,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Send,
  Clock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  saveReminderSchedules,
  updateReminderSchedule,
  deleteReminderSchedule,
  toggleReminderSchedule,
  type ReminderType,
} from "@/app/actions/reminders";

const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  temperature_check: "Temperature check",
  hot_holding_check: "Hot-hold check",
  cleaning_check: "Cleaning check",
  manager_review: "Manager review",
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];

interface Schedule {
  id: string;
  reminder_type: ReminderType;
  label: string;
  time_of_day: string;
  days_of_week: number[];
  recipients: string[];
  enabled: boolean;
  last_sent_at: string | null;
  assets?: { name: string; asset_type: string } | null;
  sites?: { name: string } | null;
}

interface RemindersPageProps {
  schedules: Schedule[];
  assets: Array<{ id: string; name: string; asset_type: string }>;
  orgId: string;
  userEmail: string;
  userRole: string;
}

const isOwnerOrManager = (role: string) => ["owner", "manager"].includes(role);

function DayChips({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (days: number[]) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {ALL_DAYS.map((d, i) => (
        <button
          key={d}
          type="button"
          onClick={() =>
            onChange(
              selected.includes(d)
                ? selected.filter((x) => x !== d)
                : [...selected, d].sort()
            )
          }
          className={`w-9 h-8 rounded text-xs font-medium border transition-colors ${
            selected.includes(d)
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}
        >
          {DAY_LABELS[i]}
        </button>
      ))}
    </div>
  );
}

function AddReminderForm({
  assets,
  userEmail,
  onSaved,
  onCancel,
}: {
  assets: Array<{ id: string; name: string; asset_type: string }>;
  userEmail: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reminder_type: "temperature_check" as ReminderType,
    label: "Morning fridge/freezer check",
    time_of_day: "09:00",
    days_of_week: ALL_DAYS,
    recipientsRaw: userEmail,
    asset_id: "",
    enabled: true,
  });

  const handleSave = async () => {
    const recipients = form.recipientsRaw
      .split(/[,\n]/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (!recipients.length) return toast.error("Add at least one recipient email");
    if (!form.label.trim()) return toast.error("Label is required");
    if (!form.days_of_week.length) return toast.error("Select at least one day");

    setSaving(true);
    const result = await saveReminderSchedules([
      {
        reminder_type: form.reminder_type,
        label: form.label,
        time_of_day: form.time_of_day,
        days_of_week: form.days_of_week,
        recipients,
        enabled: form.enabled,
        asset_id: form.asset_id || null,
      },
    ]);
    setSaving(false);

    if (result.error) return toast.error(result.error);
    toast.success("Reminder saved");
    onSaved();
  };

  return (
    <Card className="border-blue-100 bg-blue-50/40">
      <CardContent className="p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">New reminder</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={form.reminder_type}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  reminder_type: v as ReminderType,
                  label: REMINDER_TYPE_LABELS[v as ReminderType] ?? f.label,
                }))
              }
            >
              <SelectTrigger>
                <span>{REMINDER_TYPE_LABELS[form.reminder_type]}</span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REMINDER_TYPE_LABELS).map(([val, lbl]) => (
                  <SelectItem key={val} value={val}>
                    {lbl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Time</Label>
            <Input
              type="time"
              value={form.time_of_day}
              onChange={(e) => setForm((f) => ({ ...f, time_of_day: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Label</Label>
          <Input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Morning fridge check"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Days</Label>
          <DayChips
            selected={form.days_of_week}
            onChange={(days) => setForm((f) => ({ ...f, days_of_week: days }))}
          />
        </div>

        {assets.length > 0 && (
          <div className="space-y-1.5">
            <Label>Unit (optional)</Label>
            <Select
              value={form.asset_id}
              onValueChange={(v) => setForm((f) => ({ ...f, asset_id: v }))}
            >
              <SelectTrigger>
                <span>
                  {form.asset_id
                    ? assets.find((a) => a.id === form.asset_id)?.name
                    : "Any unit"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any unit</SelectItem>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Recipients (comma-separated emails)</Label>
          <Input
            value={form.recipientsRaw}
            onChange={(e) => setForm((f) => ({ ...f, recipientsRaw: e.target.value }))}
            placeholder="chef@example.com, manager@example.com"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? "Saving…" : "Save reminder"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RemindersPage({
  schedules: initialSchedules,
  assets,
  userEmail,
  userRole,
}: RemindersPageProps) {
  const router = useRouter();
  const canManage = isOwnerOrManager(userRole);
  const [showAdd, setShowAdd] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const handleToggle = async (id: string, current: boolean) => {
    const result = await toggleReminderSchedule(id, !current);
    if (result.error) toast.error(result.error);
    else {
      toast.success(!current ? "Reminder enabled" : "Reminder disabled");
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    const result = await deleteReminderSchedule(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Reminder deleted");
      router.refresh();
    }
  };

  const handleTestEmail = async () => {
    setTestLoading(true);
    try {
      const res = await fetch("/api/reminders/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error ?? "Test email failed");
      else toast.success(`Test email sent to ${userEmail}`);
    } catch {
      toast.error("Could not send test email");
    } finally {
      setTestLoading(false);
    }
  };

  const formatDays = (days: number[]) => {
    if (days.length === 7) return "Every day";
    if (JSON.stringify(days) === JSON.stringify([1, 2, 3, 4, 5])) return "Mon–Fri";
    return days.map((d) => DAY_LABELS[d - 1]).join(", ");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" /> Reminders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Email reminders sent when checks are due.
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestEmail}
              disabled={testLoading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {testLoading ? "Sending…" : "Send test email"}
            </Button>
          )}
          {canManage && !showAdd && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-4 w-4" /> Add reminder
            </Button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="mb-6">
          <AddReminderForm
            assets={assets}
            userEmail={userEmail}
            onSaved={() => {
              setShowAdd(false);
              router.refresh();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {initialSchedules.length === 0 && !showAdd ? (
        <Card className="border-slate-100">
          <CardContent className="py-16 text-center">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">No reminders set up yet</p>
            <p className="text-slate-400 text-sm mb-4">
              Add email reminders so staff are alerted when checks are due.
            </p>
            {canManage && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="h-4 w-4" /> Add first reminder
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {initialSchedules.map((s) => (
            <Card
              key={s.id}
              className={`border-slate-100 ${!s.enabled ? "opacity-60" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{s.label}</span>
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-50 text-slate-600"
                      >
                        {REMINDER_TYPE_LABELS[s.reminder_type]}
                      </Badge>
                      {!s.enabled && (
                        <Badge variant="outline" className="text-xs bg-slate-100 text-slate-500">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    {s.assets && (
                      <p className="text-xs text-slate-500 mt-0.5">Unit: {s.assets.name}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {s.time_of_day.slice(0, 5)}
                      </span>
                      <span>{formatDays(s.days_of_week)}</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {s.recipients.join(", ")}
                      </span>
                    </div>
                    {s.last_sent_at && (
                      <p className="text-xs text-slate-400 mt-1">
                        Last sent: {format(new Date(s.last_sent_at), "d MMM yyyy, HH:mm")}
                      </p>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(s.id, s.enabled)}
                        title={s.enabled ? "Disable" : "Enable"}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {s.enabled ? (
                          <ToggleRight className="h-5 w-5 text-blue-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        title="Delete"
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-8 text-center">
        Reminders are sent by email only. Actual check compliance is the responsibility of the food
        business operator.
      </p>
    </div>
  );
}
