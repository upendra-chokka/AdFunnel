"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_CAMPAIGNS } from "@/lib/demo-data";
import { formatCurrency, formatNumber, formatPercent, formatRoas } from "@/lib/utils";
import { calculateDerivedMetrics } from "@/lib/metrics";
import {
  Megaphone,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Filter,
  ExternalLink,
  Target,
} from "lucide-react";

interface AdItem {
  id: string;
  name: string;
  spend: number;
  leads: number;
  appts: number;
  sales: number;
  revenue: number;
}

interface AdSetItem {
  id: string;
  name: string;
  spend: number;
  leads: number;
  appts: number;
  sales: number;
  revenue: number;
  ads: AdItem[];
}

export default function CampaignsPage() {
  const { selectedClientId } = useApp();
  const [platformFilter, setPlatformFilter] = useState<"all" | "meta" | "google">("all");
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({
    camp_meta_botox_broad: true, // open first by default for immediate preview
  });
  const [expandedAdSets, setExpandedAdSets] = useState<Record<string, boolean>>({
    adset_botox_01: true,
  });

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAdSet = (id: string) => {
    setExpandedAdSets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Mock hierarchy for deep drill-down demo
  const getAdSetsForCampaign = (campaignId: string): AdSetItem[] => {
    if (campaignId === "camp_meta_botox_broad") {
      return [
        {
          id: "adset_botox_01",
          name: "Women 25-54 | High Household Income | Manhattan",
          spend: 1400,
          leads: 62,
          appts: 22,
          sales: 6,
          revenue: 5500,
          ads: [
            {
              id: "ad_video_natural",
              name: "Video 15s: Natural Wrinkle Softening Testimonial",
              spend: 850,
              leads: 40,
              appts: 15,
              sales: 4,
              revenue: 3600,
            },
            {
              id: "ad_carousel_pricing",
              name: "Carousel: Full Face Anti-Aging Transparent Pricing",
              spend: 550,
              leads: 22,
              appts: 7,
              sales: 2,
              revenue: 1900,
            },
          ],
        },
        {
          id: "adset_botox_02",
          name: "Broad NYC Metro | 10 Mile Radius | Auto-Placements",
          spend: 700,
          leads: 28,
          appts: 9,
          sales: 2,
          revenue: 2500,
          ads: [
            {
              id: "ad_image_before_after",
              name: "Static Image: Forehead Lines 14 Days Post-Treatment",
              spend: 700,
              leads: 28,
              appts: 9,
              sales: 2,
              revenue: 2500,
            },
          ],
        },
      ];
    }

    if (campaignId === "camp_meta_lip_broad") {
      return [
        {
          id: "adset_lip_01",
          name: "Women 21-42 | Aesthetics & Beauty Interest | Brooklyn & Queens",
          spend: 2490,
          leads: 120,
          appts: 42,
          sales: 11,
          revenue: 9900,
          ads: [
            {
              id: "ad_lip_reel",
              name: "Instagram Reel: Subtly Hydrated 1ml Restylane Kysse",
              spend: 1500,
              leads: 78,
              appts: 28,
              sales: 7,
              revenue: 6300,
            },
            {
              id: "ad_lip_injector",
              name: "Expert Injector Q&A: Avoiding Overfilled Lips",
              spend: 990,
              leads: 42,
              appts: 14,
              sales: 4,
              revenue: 3600,
            },
          ],
        },
      ];
    }

    return [
      {
        id: `adset_${campaignId}_gen`,
        name: "Standard Target Audience",
        spend: 2120,
        leads: 85,
        appts: 30,
        sales: 9,
        revenue: 7800,
        ads: [
          {
            id: `ad_${campaignId}_main`,
            name: "Responsive Search Ad: Top Rated Local Clinic",
            spend: 2120,
            leads: 85,
            appts: 30,
            sales: 9,
            revenue: 7800,
          },
        ],
      },
    ];
  };

  const campaigns = (
    selectedClientId === "all"
      ? DEMO_CAMPAIGNS
      : DEMO_CAMPAIGNS.filter((c) => c.clientId === selectedClientId)
  ).filter((c) => (platformFilter === "all" ? true : c.platform === platformFilter));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Advertising Campaign Hierarchy
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Granular Drill-Down
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Campaign \(\to\) Ad Set \(\to\) Ad creative performance hierarchy with synchronized Meta Insights & Google GAQL.
          </p>
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platformFilter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setPlatformFilter("meta")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platformFilter === "meta"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Meta Ads
          </button>
          <button
            onClick={() => setPlatformFilter("google")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platformFilter === "google"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Google Ads
          </button>
        </div>
      </div>

      {/* Campaigns Table with Drill-Down Expansion */}
      <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5 w-10"></th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-4">Entity Hierarchy</th>
                <th className="py-3 px-4">Mapped Offer</th>
                <th className="py-3 px-4 text-right">Ad Spend</th>
                <th className="py-3 px-4 text-right">Leads</th>
                <th className="py-3 px-4 text-right">CPL</th>
                <th className="py-3 px-4 text-right">Appts</th>
                <th className="py-3 px-4 text-right">Sales</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-5 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => {
                const isExpanded = !!expandedCampaigns[camp.id];
                const adSets = getAdSetsForCampaign(camp.id);
                const derived = calculateDerivedMetrics({
                  spend: camp.spend,
                  leads: camp.leads,
                  apptsSelf: camp.appts,
                  apptsSetter: 0,
                  sales: camp.sales,
                  revenue: camp.revenue,
                });

                return (
                  <React.Fragment key={camp.id}>
                    {/* LEVEL 1: Campaign Row */}
                    <tr className="hover:bg-slate-50/80 bg-white font-bold transition-colors">
                      <td className="py-3 px-5 text-center">
                        <button
                          onClick={() => toggleCampaign(camp.id)}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            camp.platform === "meta"
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : "bg-amber-100 text-amber-900 border border-amber-200"
                          }`}
                        >
                          {camp.platform}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                          <Megaphone className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                          <span>{camp.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono ml-5 font-normal">
                          id: {camp.id}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {camp.treatmentName}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-black">
                        {formatCurrency(camp.spend)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-bold">
                        {formatNumber(camp.leads)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-black">
                        {formatCurrency(derived.cpl)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-bold">{camp.appts}</td>
                      <td className="py-3 px-4 text-right text-slate-900 font-black">{camp.sales}</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-black">
                        {formatCurrency(camp.revenue)}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {formatRoas(derived.roas)}
                        </span>
                      </td>
                    </tr>

                    {/* LEVEL 2: Ad Sets Drill-Down */}
                    {isExpanded &&
                      adSets.map((adSet) => {
                        const isAdSetExpanded = !!expandedAdSets[adSet.id];
                        const adSetDerived = calculateDerivedMetrics({
                          spend: adSet.spend,
                          leads: adSet.leads,
                          apptsSelf: adSet.appts,
                          apptsSetter: 0,
                          sales: adSet.sales,
                          revenue: adSet.revenue,
                        });

                        return (
                          <React.Fragment key={adSet.id}>
                            <tr className="bg-slate-50/70 hover:bg-slate-100/70 transition-colors border-l-4 border-l-blue-400">
                              <td className="py-2.5 px-5 text-right">
                                <button
                                  onClick={() => toggleAdSet(adSet.id)}
                                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                                >
                                  {isAdSetExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-blue-500" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  Ad Set
                                </span>
                              </td>
                              <td className="py-2.5 px-4 pl-8">
                                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                                  <Layers className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                                  <span>{adSet.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-slate-400 text-[11px]">—</td>
                              <td className="py-2.5 px-4 text-right text-slate-800 font-bold">
                                {formatCurrency(adSet.spend)}
                              </td>
                              <td className="py-2.5 px-4 text-right text-slate-700">
                                {adSet.leads}
                              </td>
                              <td className="py-2.5 px-4 text-right text-slate-700 font-semibold">
                                {formatCurrency(adSetDerived.cpl)}
                              </td>
                              <td className="py-2.5 px-4 text-right text-slate-700">{adSet.appts}</td>
                              <td className="py-2.5 px-4 text-right text-slate-700 font-bold">
                                {adSet.sales}
                              </td>
                              <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">
                                {formatCurrency(adSet.revenue)}
                              </td>
                              <td className="py-2.5 px-5 text-right font-bold text-emerald-800">
                                {formatRoas(adSetDerived.roas)}
                              </td>
                            </tr>

                            {/* LEVEL 3: Individual Ads Drill-Down */}
                            {isAdSetExpanded &&
                              adSet.ads.map((ad) => {
                                const adDerived = calculateDerivedMetrics({
                                  spend: ad.spend,
                                  leads: ad.leads,
                                  apptsSelf: ad.appts,
                                  apptsSetter: 0,
                                  sales: ad.sales,
                                  revenue: ad.revenue,
                                });

                                return (
                                  <tr
                                    key={ad.id}
                                    className="bg-slate-100/40 hover:bg-slate-100/80 transition-colors border-l-4 border-l-indigo-300 text-[11px]"
                                  >
                                    <td className="py-2 px-5"></td>
                                    <td className="py-2 px-3">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                                        Creative
                                      </span>
                                    </td>
                                    <td className="py-2 px-4 pl-12">
                                      <span className="text-slate-600 font-medium">{ad.name}</span>
                                    </td>
                                    <td className="py-2 px-4 text-slate-400 text-[10px]">—</td>
                                    <td className="py-2 px-4 text-right text-slate-700 font-medium">
                                      {formatCurrency(ad.spend)}
                                    </td>
                                    <td className="py-2 px-4 text-right text-slate-600">
                                      {ad.leads}
                                    </td>
                                    <td className="py-2 px-4 text-right text-slate-600">
                                      {formatCurrency(adDerived.cpl)}
                                    </td>
                                    <td className="py-2 px-4 text-right text-slate-600">
                                      {ad.appts}
                                    </td>
                                    <td className="py-2 px-4 text-right text-slate-700 font-semibold">
                                      {ad.sales}
                                    </td>
                                    <td className="py-2 px-4 text-right text-emerald-700 font-bold">
                                      {formatCurrency(ad.revenue)}
                                    </td>
                                    <td className="py-2 px-5 text-right font-extrabold text-emerald-800">
                                      {formatRoas(adDerived.roas)}
                                    </td>
                                  </tr>
                                );
                              })}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
