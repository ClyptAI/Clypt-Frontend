import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleIcon from "@/components/auth/GoogleIcon";
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 28, color: "#0A0909", marginBottom: 4 }}>
            Create your account
          </h1>
          <p className="font-sans font-normal" style={{ fontSize: 15, color: "#635E6C" }}>
            Start analyzing in under 2 minutes.
          </p>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full h-11 flex items-center justify-center gap-2.5 rounded-[6px] transition-colors"
          style={{ background: "#fff", border: "1px solid #D1CCC8", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = "#F0EDE9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <GoogleIcon />
          <span className="font-sans font-medium" style={{ fontSize: 14, color: "#141213" }}>
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "#D1CCC8" }} />
          <span className="font-sans" style={{ fontSize: 13, color: "#9C97A5" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "#D1CCC8" }} />
        </div>

        {/* Full name */}
        <div>
          <label className="block font-heading font-medium mb-1.5" style={{ fontSize: 13, color: "#3D3A42" }}>
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            className="w-full rounded-[6px] font-sans font-normal outline-none transition-colors"
            style={{
              background: "#fff",
              border: "1px solid #D1CCC8",
              color: "#0A0909",
              fontSize: 15,
              padding: "10px 14px",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#A78BFA")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#D1CCC8")}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-heading font-medium mb-1.5" style={{ fontSize: 13, color: "#3D3A42" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-[6px] font-sans font-normal outline-none transition-colors"
            style={{
              background: "#fff",
              border: "1px solid #D1CCC8",
              color: "#0A0909",
              fontSize: 15,
              padding: "10px 14px",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#A78BFA")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#D1CCC8")}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block font-heading font-medium mb-1.5" style={{ fontSize: 13, color: "#3D3A42" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded-[6px] font-sans font-normal outline-none transition-colors"
            style={{
              background: "#fff",
              border: "1px solid #D1CCC8",
              color: "#0A0909",
              fontSize: 15,
              padding: "10px 14px",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#A78BFA")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#D1CCC8")}
          />
          <p className="font-sans mt-1.5" style={{ fontSize: 12, color: "#9C97A5" }}>
            At least 8 characters.
          </p>
        </div>

        {error && (
          <div className="font-sans" style={{ fontSize: 13, color: "#DC2626" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-[6px] font-heading font-semibold transition-colors"
          style={{ background: "#A78BFA", color: "#0A0909", fontSize: 15, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = "#7C3AED")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#A78BFA")}
        >
          {submitting ? "Creating account…" : "Create account →"}
        </button>

        {/* Footer */}
        <p className="text-center font-sans" style={{ fontSize: 14, color: "#635E6C" }}>
          Already have an account?{" "}
          <Link to="/login" className="no-underline hover:underline" style={{ color: "#7C3AED" }}>
            Sign in →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
