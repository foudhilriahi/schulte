import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
        sans: ["'Plus Jakarta Sans'", 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        page: '#F4F2EF',
        card: '#FFFFFF',
        card2: '#F9F8F6',
        ink: '#12102A',
        ink2: '#4A4668',
        ink3: '#8B87A8',
        ink4: '#C0BDCE',
        violet: '#5B4FE8',
        violetl: '#EEF0FF',
        violeth: '#7368F0',
        coral: '#F0533A',
        corall: '#FFF0EE',
        bou: '#2E7CF6',
        boul: '#EBF3FF',
        zag: '#10B97A',
        zagl: '#E6FAF3',
        ok: '#10B97A',
        okl: '#E6FAF3',
        warn: '#F59E0B',
        warnl: '#FEF3C7',
        err: '#EF4444',
        errl: '#FEE2E2',
        s0: "var(--s0)",
        s1: "var(--s1)",
        s2: "var(--s2)",
        s3: "var(--s3)",
        s4: "var(--s4)",
        s5: "var(--s5)",
        acc: "var(--acc)",
        acch: "var(--acc-h)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        bouarada: "var(--bouarada)",
        zaghouan: "var(--zaghouan)",
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
          muted: "var(--sidebar-muted)",
        },
      },
      borderRadius: {
        xl: '20px',
        lg: '14px',
        md: '10px',
        sm: '4px',
        full: '999px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(18,16,42,0.06)',
        lift: '0 8px 24px rgba(18,16,42,0.10)',
        hover: '0 12px 32px rgba(18,16,42,0.10)',
        drag: '0 12px 32px rgba(18,16,42,0.12)',
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
        npulse: {
          "0%,100%": { boxShadow: '0 0 0 4px #EEF0FF' },
          "50%": { boxShadow: '0 0 0 8px #EEF0FF' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        npulse: 'npulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
