import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["'DM Serif Display'", "serif"],
        heading: ["'Bricolage Grotesque'", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'Geist Mono'", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom Clypt palette
        "clypt-bg": "var(--color-bg)",
        "clypt-surface-1": "var(--color-surface-1)",
        "clypt-surface-2": "var(--color-surface-2)",
        "clypt-surface-3": "var(--color-surface-3)",
        "clypt-border": "var(--color-border)",
        "clypt-border-subtle": "var(--color-border-subtle)",
        "clypt-text-primary": "var(--color-text-primary)",
        "clypt-text-secondary": "var(--color-text-secondary)",
        "clypt-text-muted": "var(--color-text-muted)",
        "clypt-violet": "var(--color-violet)",
        "clypt-violet-dim": "var(--color-violet-dim)",
        "clypt-violet-muted": "var(--color-violet-muted)",
        "clypt-amber": "var(--color-amber)",
        "clypt-amber-muted": "var(--color-amber-muted)",
        "clypt-cyan": "var(--color-cyan)",
        "clypt-cyan-muted": "var(--color-cyan-muted)",
        "clypt-green": "var(--color-green)",
        "clypt-green-muted": "var(--color-green-muted)",
        "clypt-rose": "var(--color-rose)",
        "clypt-rose-muted": "var(--color-rose-muted)",
        "clypt-trend": "var(--color-trend)",
        "clypt-trend-muted": "var(--color-trend-muted)",
        "clypt-comment": "var(--color-comment)",
        "clypt-comment-muted": "var(--color-comment-muted)",
        "clypt-retention": "var(--color-retention)",
        "clypt-retention-muted": "var(--color-retention-muted)",
        // Node type colors
        "node-claim": "var(--node-claim)",
        "node-explanation": "var(--node-explanation)",
        "node-example": "var(--node-example)",
        "node-anecdote": "var(--node-anecdote)",
        "node-reaction-beat": "var(--node-reaction-beat)",
        "node-qa-exchange": "var(--node-qa-exchange)",
        "node-challenge-exchange": "var(--node-challenge-exchange)",
        "node-setup-payoff": "var(--node-setup-payoff)",
        "node-reveal": "var(--node-reveal)",
        "node-transition": "var(--node-transition)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
