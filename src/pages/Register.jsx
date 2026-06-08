import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  Download,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { z } from "zod";
import jsPDF from "jspdf";
import CompanyLogo from "@/components/ui/CompanyLogo";

const steps = ["Company", "Account"];

const registerSchema = z
  .object({
    businessName: z
      .string()
      .trim()
      .min(2, "Business name is required"),


    businessType: z
      .string()
      .trim()
      .min(2, "Business type is required"),

    industry: z
      .string()
      .trim()
      .min(2, "Industry is required"),

    registeredPhone: z
      .string()
      .trim()
      .length(10, "Registered Phone must be exactly 10 digits")
      .regex(/^\d+$/, "Registered Phone must contain only numbers"),

    firstname: z
      .string()
      .trim()
      .min(3, "First name is required"),

    lastname: z
      .string()
      .trim()
      .min(3, "Last name is required"),

    email: z
      .string()
      .trim()
      .email("Invalid email address"),

    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .trim()
      .min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    businessType: "private_limited",
    industry: "",
    registeredPhone: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const next = () => {
    setStep((prev) => Math.min(prev + 1, 1));
  };

  const prev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    const currentStepFields = {
      0: [
        "businessName",
        "businessType",
        "industry",
        "registeredPhone",
      ],

      1: [
        "firstname",
        "lastname",
        "email",
        "password",
        "confirmPassword",
      ],
    };

    const fields = currentStepFields[step];

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      const stepErrors = {};

      let hasError = false;

      fields.forEach((field) => {
        if (fieldErrors[field]) {
          stepErrors[field] = fieldErrors[field];
          hasError = true;
        }
      });

      if (hasError) {
        setErrors(stepErrors);

        toast.error(
          Object.values(stepErrors)[0]?.[0] ||
          "Please fix errors"
        );

        return;
      }
    }

    setErrors({});
    next();
  };

  const downloadPDF = () => {
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      toast.error(
        "Please complete all required fields before downloading PDF"
      );
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Business Registration Details", 20, 20);

    doc.setFontSize(12);

    const details = [
      ["Business Name", form.businessName],
      ["Business Type", form.businessType],
      ["Industry", form.industry],
      ["Registered Phone", form.registeredPhone],
      ["First Name", form.firstname],
      ["Last Name", form.lastname],
      ["Email", form.email],
    ];

    let y = 40;

    details.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, y);
      y += 12;
    });

    doc.save(
      `${form.businessName || "business"}-registration.pdf`
    );

    toast.success("PDF downloaded successfully");
  };
  const submit = async () => {
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors(fieldErrors);

      toast.error(
        Object.values(fieldErrors)[0]?.[0] ||
        "Validation failed"
      );

      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://192.168.100.149:3000/api/v1/businesses/onboard",
        {
          businessName: form.businessName,
          companyType: form.businessType.toUpperCase(),
          industry: form.industry,
          registeredPhone: form.registeredPhone,
          firstName: form.firstname,
          lastName: form.lastname,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }
      );

      toast.success("Registration successful");

      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="w-full mx-auto flex flex-col justify-center items-center">
        <div className="flex max-w-7xl justify-between items-center w-full">
          <CompanyLogo />
          <Link
            to="/"
            className="flex justify-end  btn-ghost items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Undo2  className="size-4" /> Back to home
          </Link>
        </div>

        {/* Stepper Header */}
        <div className="max-w-2xl flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-3 flex-1"
            >
              <div
                className={`h-8 w-8 rounded-full grid place-items-center text-xs font-mono border transition-all ${i < step
                  ? "bg-success text-white border-success"
                  : i === step
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "border-slate-900/[0.08] text-muted-foreground"
                  }`}
              >
                {i < step ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>

              <div className="text-xs">
                <div
                  className={
                    i <= step
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {s}
                </div>

                <div className="text-[10px]  uppercase tracking-widest text-muted-foreground">
                  Step {i + 1}
                </div>
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px ${i < step
                    ? "bg-success/50"
                    : "bg-slate-900/[0.06]"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className=" max-w-2xl glass-card p-8">
          <h1 className="font-display text-2xl font-semibold">
            Register your business
          </h1>

          <div
            className="mt-6 space-y-4 animate-in fade-in duration-300"
            key={step}
          >
            {/* STEP 1 */}
            {step === 0 && (
              <>
                <Input
                  label="Business Name"
                  value={form.businessName}
                  onChange={(v) =>
                    set("businessName", v)
                  }
                  error={errors?.businessName?.[0]}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Business Type"
                    value={form.businessType}
                    onChange={(v) =>
                      set("businessType", v)
                    }
                    options={[
                      {
                        value: "private_limited",
                        label: "Private Limited",
                      },
                      {
                        value: "public_limited",
                        label: "Public Limited",
                      },
                      {
                        value: "llp",
                        label: "LLP",
                      },
                      {
                        value: "partnership",
                        label: "Partnership",
                      },
                      {
                        value: "sole_proprietorship",
                        label: "Sole Proprietorship",
                      },
                      {
                        value: "others",
                        label: "Others",
                      },
                    ]}
                    error={errors?.BusinessType?.[0]}
                  />

                  <Input
                    label="Industry"
                    value={form.industry}
                    onChange={(v) => set("industry", v)}
                    error={errors?.industry?.[0]}
                  />
                </div>

                <Input
                  label="Registered Phone"
                  value={form.registeredPhone}
                  onChange={(v) => {
                    const value = v.replace(/\D/g, "").slice(0, 10);
                    set("registeredPhone", value);
                  }}
                  error={errors?.registeredPhone?.[0]}
                />
              </>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={form.firstname}
                    onChange={(v) =>
                      set("firstname", v)
                    }
                    error={errors?.firstname?.[0]}
                  />

                  <Input
                    label="Last Name"
                    value={form.lastname}
                    onChange={(v) =>
                      set("lastname", v)
                    }
                    error={errors?.lastname?.[0]}
                  />
                </div>

                <Input
                  label="Email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  error={errors?.email?.[0]}
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    value={form.password}
                    onChange={(v) =>
                      set("password", v)
                    }
                    error={errors?.password?.[0]}
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={form.confirmPassword}
                    onChange={(v) =>
                      set("confirmPassword", v)
                    }
                    error={
                      errors?.confirmPassword?.[0]
                    }
                  />

                  <button
                    tabIndex={-1}
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className="btn-ghost text-sm disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-3">

              {step < 1 ? (
                <button
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="cursor-pointer btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Register
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  error,
}) {
  return (
    <div className="w-full">
      <label className="text-xs text-muted-foreground">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border transition focus:outline-none ${error
          ? "border-red-500 focus:ring-1 focus:ring-red-500"
          : "border-slate-900/[0.08] focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          }`}
      />

      {error && (
        <p className="text-[10px] text-red-500 mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options = [],
  error,
}) {
  return (
    <div className="w-full">
      <label className="text-xs text-muted-foreground">
        {label}
      </label>

      <div className="relative mt-1.5">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-900/[0.03] border transition focus:outline-none appearance-none ${error
            ? "border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-slate-900/[0.08] focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            }`}
        >
          <option value="" disabled>
            Select {label}
          </option>

          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-red-500 mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}