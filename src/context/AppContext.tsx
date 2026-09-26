"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DEMO_CLIENTS,
  DemoClient,
  UnattributedLead,
  DEMO_UNATTRIBUTED_LEADS,
} from "../lib/demo-data";

export type UserRole = "super_admin" | "agency_admin" | "account_manager" | "viewer";

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
  unattributedLeads: UnattributedLead[];
  resolveLeadAttribution: (
    leadId: string,
    campaignId: string,
    treatmentId: string
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients] = useState<DemoClient[]>(DEMO_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>("client_aura");
  const [dateRange, setDateRange] = useState<string>("sep_23_27");
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>("agency_admin");
  const [unattributedLeads, setUnattributedLeads] = useState<UnattributedLead[]>(
    DEMO_UNATTRIBUTED_LEADS
  );

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
        unattributedLeads,
        resolveLeadAttribution,
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
