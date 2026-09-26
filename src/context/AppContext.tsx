"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  DEMO_CLIENTS,
  DemoClient,
  UnattributedLead,
  DEMO_UNATTRIBUTED_LEADS,
} from "../lib/demo-data";
import { AuthUser, PRECONFIGURED_USERS, authenticateUser } from "../lib/auth/users";

export type UserRole = "super_admin" | "agency_admin" | "account_manager" | "viewer";

export interface DatabaseStatus {
  connected: boolean;
  isConfigured: boolean;
  message: string;
  latencyMs: number;
  url?: string | null;
  tablesDetected?: boolean;
}

interface AppContextType {
  clients: DemoClient[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  selectedClient: DemoClient | undefined;
  dateRange: string;
  setDateRange: (range: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  unattributedLeads: UnattributedLead[];
  resolveLeadAttribution: (
    leadId: string,
    campaignId: string,
    treatmentId: string
  ) => void;
  dbStatus: DatabaseStatus;
  refreshDbStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients] = useState<DemoClient[]>(DEMO_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>("client_aura");
  const [dateRange, setDateRange] = useState<string>("sep_23_27");
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(PRECONFIGURED_USERS[0]);
  const [userRole, setUserRole] = useState<UserRole>("super_admin");
  const [unattributedLeads, setUnattributedLeads] = useState<UnattributedLead[]>(
    DEMO_UNATTRIBUTED_LEADS
  );
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    isConfigured: false,
    message: "Checking database status...",
    latencyMs: 0,
  });

  const refreshDbStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/system/status");
      if (res.ok) {
        const json = await res.json();
        const connected = Boolean(json.supabase?.connected);
        setDbStatus({
          connected,
          isConfigured: Boolean(json.supabase?.isConfigured),
          message: json.supabase?.message || "Active",
          latencyMs: json.supabase?.latencyMs || 0,
          url: json.supabase?.url,
          tablesDetected: json.supabase?.tablesDetected,
        });

        // Automatically set demoMode to false if live Supabase is connected!
        if (connected) {
          setDemoMode(false);
        } else {
          setDemoMode(true);
        }
      }
    } catch {
      setDbStatus({
        connected: false,
        isConfigured: false,
        message: "Offline / Mock Preview",
        latencyMs: 0,
      });
      setDemoMode(true);
    }
  }, []);

  useEffect(() => {
    refreshDbStatus();

    // Check stored user session from localStorage or cookie
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("adfunnel_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          setUserRole(parsed.role);
        } catch {
          // ignore
        }
      }
    }
  }, [refreshDbStatus]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const user = authenticateUser(email, pass);
    if (!user) {
      return { success: false, error: "Invalid credentials. Please select one of the preconfigured logins below." };
    }
    setCurrentUser(user);
    setUserRole(user.role);
    if (typeof window !== "undefined") {
      localStorage.setItem("adfunnel_user", JSON.stringify(user));
    }
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("adfunnel_user");
    }
    fetch("/api/auth/me", { method: "POST" }).catch(() => {});
  };

  const selectedClient =
    selectedClientId === "all"
      ? undefined
      : clients.find((c) => c.id === selectedClientId);

  const resolveLeadAttribution = (
    leadId: string,
    campaignId: string,
    treatmentId: string
  ) => {
    setUnattributedLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        selectedClientId,
        setSelectedClientId,
        selectedClient,
        dateRange,
        setDateRange,
        demoMode,
        setDemoMode,
        userRole,
        setUserRole,
        currentUser,
        setCurrentUser,
        login,
        logout,
        unattributedLeads,
        resolveLeadAttribution,
        dbStatus,
        refreshDbStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
