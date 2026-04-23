import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Auth-page input. Dark surface, explicit focus transitions on
 * box-shadow + border-color (no `transition: all`).
 */
const AuthInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-[8px] font-sans font-normal outline-none",
        className,
      )}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "#F4F1EE",
        fontSize: 15,
        padding: "11px 14px",
        transition:
          "border-color 160ms ease, box-shadow 200ms ease, background-color 160ms ease",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(167,139,250,0.6)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.14)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        props.onBlur?.(e);
      }}
      {...props}
    />
  ),
);
AuthInput.displayName = "AuthInput";

export default AuthInput;