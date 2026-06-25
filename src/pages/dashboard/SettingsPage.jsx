import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Panel } from "@/components/ui-kit";
import { Bell, Eye, LockKeyhole, Trash2, Camera, ChevronRight, X, Save } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/API/axiosInstance";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { business, fetchUserProfile, logout } = useAuth();

  const fileInputRef = useRef(null);

  const [prefs, setPrefs] = useState({
    verifications: true,
    deals: true,
    score: true,
    flags: true,
  });

  const [vis, setVis] = useState("Summary");

  const [formData, setFormData] = useState({
    legalName: "",
    companyType: "",
    logo: null,
  });

  const [originalData, setOriginalData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  useEffect(() => {
    if (business) {
      const data = {
        legalName: business.legalName || business.legal_name || "",
        companyType: business.companyType || business.company_type || "",
        logo: business.logo || business.logoUrl || null,
      };

      setFormData(data);
      setOriginalData(data);
    }
  }, [business]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData) || !!logoFile;

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    const preview = URL.createObjectURL(file);

    setLogoFile(file);

    setFormData((prev) => ({
      ...prev,
      logo: preview,
    }));

    toast.success("Logo selected");
  };

  const handleRemoveLogo = (e) => {
    // Prevents the click from triggering the file upload overlay underneath
    e.stopPropagation();

    setLogoFile(null);

    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));

    toast.success("Logo removed");
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = new FormData();

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (!formData.logo) {
        payload.append("removeLogo", "true");
      }

      await axiosInstance.put("/business/profile", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchUserProfile();

      setOriginalData(formData);
      setLogoFile(null);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountLoading) return;

    const confirmed = window.confirm("Are you sure you want to deactivate your account?");

    if (!confirmed) return;

    try {
      setDeleteAccountLoading(true);

      await axiosInstance.delete("/business/deactivate");
      toast.success("Your account has been deactivated successfully.");

      localStorage.clear();

      navigate("/login");
    } catch (error) {
      toast.error("Failed to deactivate account");
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Profile */}
      <Panel className="border border-border rounded-2xl bg-card p-8">
        <div className="mb-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground">Business Profile</h3>

            <p className="text-sm text-muted-foreground mt-1">
              View your registration details and update your business branding.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          {/* Avatar Area */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative h-24 w-24">
              {/* Clickable Profile Circle */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group h-full w-full rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 bg-gradient-to-br from-primary to-primary/80 shadow-md cursor-pointer transition-all duration-200 hover:opacity-95"
              >
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Company logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-3xl font-semibold btn-primary text-white"></div>
                )}
              </div>

              {/* Floating Modern Remove Badge */}
              {formData.logo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  title="Remove current logo"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md border border-background flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-5">
            <Input
              label="Legal Name"
              value={formData.legalName}
              disabled={true}
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed opacity-70 focus:outline-none"
            />

            <Input
              label="Company Type"
              value={formData.companyType}
              disabled={true}
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed opacity-70 focus:outline-none"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`inline-flex items-center cursor-pointer justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition  ${
                hasChanges
                  ? "btn-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      </Panel>

      {/* Notifications */}
      <Panel className="border border-border rounded-2xl bg-card p-8">
        <div className="mb-5">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </h3>

          <p className="text-sm text-muted-foreground mt-1">
            Choose which updates and alerts you would like to receive.
          </p>
        </div>

        <div className="divide-y divide-border">
          {[
            { k: "verifications", l: "Verification Updates" },
            { k: "deals", l: "Deal Activity" },
            { k: "score", l: "Trust Score Changes" },
            { k: "flags", l: "Risk Flag Alerts" },
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

      {/* Privacy & Security Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Privacy Settings */}
        <Panel className="border border-border rounded-2xl bg-card p-8">
          <div className="mb-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Privacy Settings
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              Control how your trust information is visible to other businesses.
            </p>
          </div>

          <div className="grid gap-3">
            {["Full", "Summary", "Score Only"].map((o) => (
              <button
                key={o}
                onClick={() => setVis(o)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition cursor-pointer ${
                  vis === o
                    ? "btn-primary text-primary-foreground"
                    : "bg-background border-border hover:bg-muted"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </Panel>

        {/* Security */}
        <Panel className="border border-border rounded-2xl bg-card p-8">
          <div className="mb-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Security & Credentials
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              Maintain strong security standards by updating access credentials.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <h4 className="font-medium">Account Password</h4>

            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Update your login password and account security settings.
            </p>

            <button
              onClick={() => navigate("/change-password")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-primary cursor-pointer text-primary-foreground inline-flex items-center justify-center gap-2"
            >
              Change Password
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </Panel>
      </div>

      {/* Danger Zone */}
      <Panel className="lg:col-span-2 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6 rounded-2xl">
        <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-lg text-red-500 dark:text-red-400">Danger Zone</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              Deactivating your account will hide your business profile, disable public access, and
              pause all ongoing verification workflows. You can reactivate your account later after
              support review.
            </p>

            <div className="mt-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-background p-4">
              <p className="text-sm font-medium text-red-500 dark:text-red-400">Warning</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This action will temporarily disable your business account and may affect active
                verification requests.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading}
              className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              {deleteAccountLoading ? "Deactivating..." : "Deactivate Account"}
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );

  function Input({ label, className, ...p }) {
    return (
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {label}
        </label>
        <input
          {...p}
          className={
            className ||
            "w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          }
        />
      </div>
    );
  }

  function Toggle({ label, checked = false, onChange }) {
    return (
      <label className="flex items-center justify-between py-3 cursor-pointer">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={() => onChange?.(!checked)}
          className={`relative h-6 w-11 rounded-full cursor-pointer transition ${
            checked ? "btn-primary" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
              checked ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </label>
    );
  }
}
