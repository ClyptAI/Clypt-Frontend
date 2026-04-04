import { Link } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleIcon from "@/components/auth/GoogleIcon";

const Login = () => {
  return (
    <AuthLayout>
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 28, color: "#0A0909", marginBottom: 4 }}>
          Sign in to Clypt
        </h1>
        <p className="font-sans font-normal" style={{ fontSize: 15, color: "#635E6C" }}>
          Welcome back.
        </p>
      </div>

      {/* Google OAuth */}
      <button
        className="w-full h-11 flex items-center justify-center gap-2.5 rounded-[6px] transition-colors"
        style={{ background: "#fff", border: "1px solid #D1CCC8" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0EDE9")}
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

      {/* Email */}
      <div>
        <label className="block font-heading font-medium mb-1.5" style={{ fontSize: 13, color: "#3D3A42" }}>
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
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
          placeholder="••••••••"
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
        <div className="flex justify-end mt-1.5">
          <a href="#" className="font-sans no-underline hover:underline" style={{ fontSize: 13, color: "#7C3AED" }}>
            Forgot password?
          </a>
        </div>
      </div>

      {/* Submit */}
      <button
        className="w-full h-11 rounded-[6px] font-heading font-semibold transition-colors"
        style={{ background: "#A78BFA", color: "#0A0909", fontSize: 15 }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#7C3AED")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#A78BFA")}
      >
        Sign in
      </button>

      {/* Footer */}
      <p className="text-center font-sans" style={{ fontSize: 14, color: "#635E6C" }}>
        Don't have an account?{" "}
        <Link to="/signup" className="no-underline hover:underline" style={{ color: "#7C3AED" }}>
          Sign up →
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
