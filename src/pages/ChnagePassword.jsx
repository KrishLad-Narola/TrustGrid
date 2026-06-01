import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Lock,
    Eye,
    EyeOff,
    ClockFading,
} from "lucide-react";

import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import axiosInstance from "@/API/axiosInstance";


const changePasswordSchema = z
    .object({

        currentPassword: z.string().trim(),
        newPassword: z
            .string()
            .trim()
            .min(6, "Password must be at least 6 characters"),

        confirmPassword: z.string().trim(),


    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });


const API_URL = "http://192.168.100.149:3000";



export default function ChangePassword() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",

    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePassword = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = changePasswordSchema.safeParse(formData);
        console.log(formData);
        if (!validation.success) {
            const errors = validation.error.flatten();

            const errorMessage =
                errors.formErrors[0] ||
                errors.fieldErrors.currentPassword?.[0] ||
                errors.fieldErrors.newPassword?.[0] ||
                errors.fieldErrors.confirmPassword?.[0];

            return toast.error(errorMessage);
        }

        try {
            setLoading(true);

            const response = await axiosInstance.post(
                "/auth/change-password",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success(
                response.data.message ||
                "Password changed successfully"
            );

            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",

            });

            navigate("/dashboard");

        } catch (error) {
            console.error("Change Password Error:", error);

            if (error.response) {
                const status = error.response.status;

                if (status === 400) {
                    toast.error("Current password is incorrect");
                } else if (status === 401) {
                    toast.error("Please login again");
                    navigate("/");
                } else if (status >= 500) {
                    toast.error("Server error");
                } else {
                    toast.error(
                        error.response.data?.message ||
                        "Something went wrong"
                    );
                }
            } else if (error.request) {
                toast.error(
                    "Unable to connect to server. Check backend/CORS."
                );
            } else {
                toast.error("Unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[140px]" />
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />

            <header className="relative z-10 px-5 py-5 h-16 flex items-center justify-between ">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                        <ShieldCheck className="size-5 text-primary-foreground" />
                    </div>

                    <div>
                        <div className="font-display font-bold tracking-tight text-sidebar-foreground">
                            TrustGrid
                        </div>

                    </div>
                </Link>

            </header>

            <section className="relative z-10 px-6 lg:px-12 pt-16  flex justify-center items-center">
                <div className="w-full max-w-lg">
                    <form
                        onSubmit={handleSubmit}
                        className="glass-card rounded-3xl p-8 shadow-card"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono text-primary mb-6">
                            <Sparkles className="h-3 w-3" />
                            <span>Password Security</span>
                        </div>

                        <h1 className="font-display text-4xl font-semibold">
                            Change Password
                        </h1>

                        <p className="mt-3 text-muted-foreground">
                            Keep your account secure with a strong password.
                        </p>

                        <PasswordInput
                            label="Current Password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            show={showPassword.current}
                            toggle={() =>
                                togglePassword("current")
                            }
                            placeholder="Enter current password"
                        />

                        <PasswordInput
                            label="New Password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            show={showPassword.new}
                            toggle={() => togglePassword("new")}
                            placeholder="Enter new password"
                        />

                        <PasswordInput
                            label="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            show={showPassword.confirm}
                            toggle={() =>
                                togglePassword("confirm")
                            }
                            placeholder="Confirm password"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 inline-flex items-center cursor-pointer hover:bg-blue-300 justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-primary text-white font-medium shadow-glow hover:opacity-95 transition disabled:opacity-50"
                        >
                            {loading
                                ? "Changing..."
                                : "Change Password"}

                            {!loading && (
                                <ArrowRight className="h-4 w-4" />
                            )}
                        </button>

                        <Link
                            to="/dashboard"
                            className="block text-primary text-sm  hover:text-purple-200 transition mt-5"
                        >
                            Back to Dashboard →
                        </Link>
                    </form>
                </div>
            </section>
        </div>
    );
}

function PasswordInput({
    label,
    name,
    value,
    onChange,
    show,
    toggle,
    placeholder,
}) {
    return (
        <div className="mt-5">
            <label className="text-xs text-muted-foreground">
                {label}
            </label>

            <div className="relative mt-1.5">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition"
                />

                <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                    {show ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
}