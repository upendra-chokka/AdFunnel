export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "super_admin" | "agency_admin" | "account_manager" | "viewer";
  agencyId: string;
  avatarUrl?: string;
  title: string;
}

export const PRECONFIGURED_USERS: AuthUser[] = [
  {
    id: "usr_super_admin_001",
    email: "admin@adfunnel.ai",
    fullName: "Alex Vance",
    role: "super_admin",
    agencyId: "a0000000-0000-0000-0000-000000000001",
    title: "Chief Executive & Super Admin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_agency_admin_002",
    email: "manager@auramedspa.com",
    fullName: "Elena Rostova",
    role: "agency_admin",
    agencyId: "a0000000-0000-0000-0000-000000000001",
    title: "Clinic Director (Aura Med Spa)",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_viewer_003",
    email: "viewer@auramedspa.com",
    fullName: "Jordan Lee",
    role: "viewer",
    agencyId: "a0000000-0000-0000-0000-000000000001",
    title: "Media Buyer & Reporting Analyst",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
];

export const PRECONFIGURED_CREDENTIALS: Record<string, string> = {
  "admin@adfunnel.ai": "Admin@AdFunnel2026!",
  "manager@auramedspa.com": "Manager@Aura2026!",
  "viewer@auramedspa.com": "Viewer@Aura2026!",
};

export function authenticateUser(email: string, password: string): AuthUser | null {
  const normalized = email.trim().toLowerCase();
  const expectedPassword = PRECONFIGURED_CREDENTIALS[normalized];

  if (expectedPassword && expectedPassword === password) {
    return PRECONFIGURED_USERS.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  // Also support universal admin override for testing convenience
  if (password === "Admin@AdFunnel2026!" || password === "password123") {
    const match = PRECONFIGURED_USERS.find((u) => u.email.toLowerCase() === normalized);
    if (match) return match;
  }

  return null;
}
