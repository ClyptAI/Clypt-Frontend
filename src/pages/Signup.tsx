import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleIcon from "@/components/auth/GoogleIcon";
import AuthInput from "@/components/auth/AuthInput";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signup(name, email, password);
      toast.success("Account created.");
      // New accounts land in onboarding so they can set up a channel first.
      navigate("/onboard/channel");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success("Signed up with Google.");
      navigate("/onboard/channel");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ filter: submitting ? "blur(0.4px)" : undefined, transition: "filter 250ms ease" }}>
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 28, color: "#F4F1EE", marginBottom: 4 }}>
            Create your account
          </h1>
          <p className="font-sans font-normal" style={{ fontSize: 15, color: "rgba(255,255,255,0.55)" }}>
            Start analyzing in under 2 minutes.
          </p>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full h-11 flex items-center justify-center gap-2.5 rounded-[8px] active:scale-[0.97]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
            transition: "background-color 160ms ease, border-color 160ms ease, transform 120ms ease",
          }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
        >
          <GoogleIcon />
          <span className="font-sans font-medium" style={{ fontSize: 14, color: "#F4F1EE" }}>
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="font-sans" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Full name */}
        <div>
          <label className="block font-heading font-medium mb-1.5" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            Full name
          </label>
          <AuthInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-heading font-medium mb-1.5" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            Email
          </label>
          <AuthInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block font-heading font-medium mb-1.5" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            Password
          </label>
          <AuthInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <p className="font-sans mt-1.5" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            At least 8 characters.
          </p>
        </div>

        {error && (
          <div className="font-sans status-blur-in" style={{ fontSize: 13, color: "#FB7185" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-[8px] font-heading font-semibold active:scale-[0.97] flex items-center justify-center gap-2"
          style={{
            background: "#A78BFA",
            color: "#0A0909",
            fontSize: 15,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
            transition: "background-color 160ms ease, box-shadow 200ms ease, transform 120ms ease",
            boxShadow: "0 0 24px -8px rgba(167,139,250,0.5)",
          }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = "#C4B5FD")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#A78BFA")}
        >
          {submitting && (
            <svg className="spin-fast" width={14} height={14} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="#0A0909" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {submitting ? "Creating account" : "Create account →"}
        </button>

        {/* Footer */}
        <p className="text-center font-sans" style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
          Already have an account?{" "}
          <Link to="/login" className="no-underline hover:underline" style={{ color: "#A78BFA" }}>
            Sign in →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
