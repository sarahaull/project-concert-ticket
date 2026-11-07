

export const COLORS = {
 

  primary: {
    DEFAULT: "#1E3A8A",
    dark: "#0D1F42",
    darker: "#08162F",
    light: "#2563EB",
    hover: "#3B82F6",
    soft: "#EFF6FF",
    muted: "#DBEAFE",
  },


  sidebar: {
    background: "#0D1F42",
    backgroundDark: "#08162F",
    backgroundHover: "#112250",
    backgroundActive: "#1E3A8A",

    border: "#29466F",

    text: "#E5EDF8",
    textMuted: "#8FA6C4",
    textActive: "#FFFFFF",

    icon: "#9DB3D0",
    iconActive: "#FFFFFF",
  },

 

  header: {
    background: "#FFFFFF",
    backgroundSoft: "#F8FAFC",

    border: "#E2E8F0",

    text: "#172554",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",

    icon: "#64748B",
    iconHover: "#1E3A8A",
  },

  /* =======================================================
     PAGE
  ======================================================= */

  page: {
    background: "#E8EEF5",
    backgroundSoft: "#F8FAFC",
    backgroundWhite: "#FFFFFF",

    text: "#172554",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",

    border: "#D9E2EC",
  },

  /* =======================================================
     CARD
  ======================================================= */

  card: {
    background: "#FFFFFF",

    border: "#E2E8F0",
    borderHover: "#CBD5E1",

    title: "#172554",
    text: "#475569",
    muted: "#94A3B8",

    shadow: "rgba(15, 23, 42, 0.06)",
    shadowHover: "rgba(15, 23, 42, 0.10)",
  },

  /* =======================================================
     ACCENT
  ======================================================= */

  accent: {
    blue: "#60A5FA",
    blueLight: "#DBEAFE",
    blueDark: "#1D4ED8",

    navy: "#0D1F42",
    navyLight: "#112250",

    gold: "#F59E0B",
    goldLight: "#FEF3C7",

    purple: "#7C3AED",
    purpleLight: "#EDE9FE",
  },

  /* =======================================================
     STATUS
  ======================================================= */

  status: {
    success: {
      DEFAULT: "#16A34A",
      light: "#DCFCE7",
      text: "#166534",
    },

    warning: {
      DEFAULT: "#F59E0B",
      light: "#FEF3C7",
      text: "#92400E",
    },

    danger: {
      DEFAULT: "#DC2626",
      light: "#FEE2E2",
      text: "#991B1B",
    },

    info: {
      DEFAULT: "#2563EB",
      light: "#DBEAFE",
      text: "#1D4ED8",
    },

    neutral: {
      DEFAULT: "#64748B",
      light: "#F1F5F9",
      text: "#475569",
    },
  },

  /* =======================================================
     TABLE
  ======================================================= */

  table: {
    background: "#FFFFFF",
    header: "#F8FAFC",

    border: "#E2E8F0",

    text: "#172554",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",

    rowHover: "#F8FAFC",
    rowActive: "#EFF6FF",
  },

  /* =======================================================
     INPUT
  ======================================================= */

  input: {
    background: "#FFFFFF",

    border: "#D9E2EC",
    borderHover: "#94A3B8",
    borderFocus: "#2563EB",

    text: "#172554",
    placeholder: "#94A3B8",

    focusRing: "rgba(37, 99, 235, 0.15)",
  },

  /* =======================================================
     BUTTON
  ======================================================= */

  button: {
    primary: "#1E3A8A",
    primaryHover: "#2563EB",
    primaryText: "#FFFFFF",

    secondary: "#FFFFFF",
    secondaryHover: "#F8FAFC",
    secondaryText: "#1E3A8A",

    danger: "#DC2626",
    dangerHover: "#B91C1C",

    success: "#16A34A",
    successHover: "#15803D",

    warning: "#F59E0B",
    warningHover: "#D97706",

    disabled: "#CBD5E1",
    disabledText: "#94A3B8",
  },

  /* =======================================================
     ICON
  ======================================================= */

  icon: {
    primary: "#1E3A8A",
    secondary: "#64748B",
    muted: "#94A3B8",

    blue: "#2563EB",
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",

    background: "#EFF6FF",
    backgroundSuccess: "#ECFDF5",
    backgroundWarning: "#FFFBEB",
    backgroundDanger: "#FEF2F2",
  },

  /* =======================================================
     OVERLAY
  ======================================================= */

  overlay: {
    dark: "rgba(15, 23, 42, 0.55)",
    light: "rgba(255, 255, 255, 0.75)",
  },

  /* =======================================================
     WHITE / BLACK
  ======================================================= */

  white: "#FFFFFF",
  black: "#000000",
};


/* =========================================================
   BORDER RADIUS
========================================================= */

export const RADIUS = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  full: "9999px",
};


/* =========================================================
   SHADOW
========================================================= */

export const SHADOW = {
  sm: "0 1px 3px rgba(15, 23, 42, 0.06)",

  md: "0 4px 12px rgba(15, 23, 42, 0.08)",

  lg: "0 8px 24px rgba(15, 23, 42, 0.10)",

  xl: "0 16px 40px rgba(15, 23, 42, 0.12)",

  card: "0 2px 12px rgba(15, 23, 42, 0.06)",

  cardHover: "0 8px 24px rgba(15, 23, 42, 0.10)",
};


/* =========================================================
   FONT
========================================================= */

export const FONT = {
  family:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};


/* =========================================================
   TRANSITION
========================================================= */

export const TRANSITION = {
  fast: "150ms ease",
  normal: "200ms ease",
  smooth: "300ms ease",
};


/* =========================================================
   Z-INDEX
========================================================= */

export const Z_INDEX = {
  sidebar: 40,
  header: 30,
  dropdown: 50,
  modal: 100,
  toast: 200,
};


/* =========================================================
   COMMON COMPONENT STYLES
========================================================= */

export const COMMON_STYLES = {
  page: {
    background: COLORS.page.background,
    color: COLORS.page.text,
  },

  card: {
    background: COLORS.card.background,
    border: `1px solid ${COLORS.card.border}`,
    borderRadius: RADIUS.xl,
    boxShadow: SHADOW.card,
  },

  input: {
    background: COLORS.input.background,
    border: `1px solid ${COLORS.input.border}`,
    color: COLORS.input.text,
    borderRadius: RADIUS.md,
  },

  primaryButton: {
    background: COLORS.button.primary,
    color: COLORS.button.primaryText,
    borderRadius: RADIUS.md,
    transition: TRANSITION.normal,
  },
};