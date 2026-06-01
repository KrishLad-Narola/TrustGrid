import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Panel } from "@/components/ui-kit";
import {
  Bell,
  Eye,
  LockKeyhole,
  Trash2,
  Upload,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    verifications: true,
    deals: true,
    score: true,
    flags: true,
  });

  const [vis, setVis] = useState("Summary");

  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setLogo(imageUrl);

    toast.success("Logo uploaded successfully");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Profile */}
      <Panel className="p-6">
        <h3 className="font-display text-lg font-semibold mb-5">
          Profile
        </h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 shadow-sm">
            {logo ? (
              <img
                src={logo}
                alt="Company logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-xl font-display font-semibold text-white">
                HT
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted transition text-sm font-medium"
          >
            <Upload className="h-4 w-4" />
            Upload logo
          </button>
        </div>

        <Input
          label="Company name"
          defaultValue="Helios Trade Networks"
        />

        <Input
          label="Industry"
          defaultValue="Logistics & Supply Chain"
        />

        <Input
          label="Website"
          defaultValue="https://helios-trade.com"
        />
      </Panel>

      {/* Notifications */}
      <Panel className="p-6">
        <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Notifications
        </h3>

        <div className="space-y-1">
          {[
            {
              k: "verifications",
              l: "Verification updates",
            },
            {
              k: "deals",
              l: "Deal activity",
            },
            {
              k: "score",
              l: "Trust score changes",
            },
            {
              k: "flags",
              l: "Risk flag alerts",
            },
          ].map(({ k, l }) => (
            <Toggle
              key={k}
              label={l}
              checked={prefs[k]}
              onChange={(v) =>
                setPrefs((p) => ({
                  ...p,
                  [k]: v,
                }))
              }
            />
          ))}
        </div>
      </Panel>

      {/* Privacy */}
      <Panel className="p-6">
        <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Privacy
        </h3>

        <div className="text-sm text-muted-foreground mb-4">
          Document visibility on public profile
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["Full", "Summary", "Score Only"].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setVis(o)}
              className={`px-3 py-2.5 rounded-xl text-sm border transition font-medium ${
                vis === o
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-background hover:bg-muted border-border text-muted-foreground"
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <Toggle
            label="Public trust score badge"
            checked
          />
        </div>
      </Panel>

      {/* Security */}
      <Panel className="p-6">
        <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-primary" />
          Security
        </h3>

        <div className="rounded-2xl border border-border bg-background/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium">
                Change Password
              </h4>

              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Update your account password regularly
                to keep your account secure and protect
                sensitive business data.
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LockKeyhole className="h-5 w-5 text-primary" />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/change-password")
            }
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Go to Change Password
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Panel>

      {/* Danger Zone */}
      <Panel className="lg:col-span-2 border-l-4 border-danger p-6">
        <h3 className="font-display text-lg font-semibold text-danger flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Danger zone
        </h3>

        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Deactivating your account removes public
          access and pauses verification flows. Data
          is retained for 90 days.
        </p>

        <button
          type="button"
          onClick={() =>
            toast.error("Confirm in support portal")
          }
          className="mt-5 px-4 py-2.5 rounded-xl bg-danger/15 text-danger border border-danger/30 text-sm font-medium hover:bg-danger/25 transition"
        >
          Deactivate account
        </button>
      </Panel>
    </div>
  );
}

function Input({ label, ...p }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <input
        {...p}
        className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
      />
    </div>
  );
}

function Toggle({
  label,
  checked = false,
  onChange,
}) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer">
      <span className="text-sm font-medium">
        {label}
      </span>

      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-primary"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}