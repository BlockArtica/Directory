"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FilterState } from "@/components/directory/FilterSidebar";
import { defaultFilters } from "@/components/directory/FilterSidebar";

interface ActiveFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

interface FilterPill {
  key: string;
  label: string;
  onRemove: () => void;
}

export default function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const pills: FilterPill[] = [];

  if (filters.service) {
    pills.push({
      key: "service",
      label: `Service: ${filters.service}`,
      onRemove: () => onChange({ ...filters, service: "" }),
    });
  }
  if (filters.region) {
    pills.push({
      key: "region",
      label: `Region: ${filters.region}`,
      onRemove: () => onChange({ ...filters, region: "" }),
    });
  }
  if (filters.sortBy !== "relevance") {
    const sortLabels: Record<string, string> = {
      rating: "Best Rating",
      reviews: "Most Reviews",
      years: "Years in Business",
      distance: "Distance",
    };
    pills.push({
      key: "sortBy",
      label: `Sort: ${sortLabels[filters.sortBy]}`,
      onRemove: () => onChange({ ...filters, sortBy: "relevance" }),
    });
  }
  if (filters.minRating > 0) {
    pills.push({
      key: "minRating",
      label: `${filters.minRating}+ Stars`,
      onRemove: () => onChange({ ...filters, minRating: 0 }),
    });
  }
  if (filters.minYears > 0) {
    pills.push({
      key: "minYears",
      label: `${filters.minYears}+ Years`,
      onRemove: () => onChange({ ...filters, minYears: 0 }),
    });
  }
  if (filters.minEmployees > 0) {
    pills.push({
      key: "minEmployees",
      label: `${filters.minEmployees}+ Employees`,
      onRemove: () => onChange({ ...filters, minEmployees: 0 }),
    });
  }
  for (const tier of filters.tiers) {
    pills.push({
      key: `tier-${tier}`,
      label: `Tier: ${tier}`,
      onRemove: () => onChange({ ...filters, tiers: filters.tiers.filter((t) => t !== tier) }),
    });
  }
  for (const method of filters.paymentMethods) {
    pills.push({
      key: `pay-${method}`,
      label: `Pays: ${method}`,
      onRemove: () => onChange({ ...filters, paymentMethods: filters.paymentMethods.filter((m) => m !== method) }),
    });
  }

  const booleanFilters: [keyof FilterState, string][] = [
    ["hasInsurance", "Insured"],
    ["hasCertifications", "Certified"],
    ["hasWebsite", "Has Website"],
    ["hasOperatingHours", "Has Hours"],
    ["hasReferences", "Has References"],
    ["hasLicenses", "Licensed"],
  ];
  for (const [key, label] of booleanFilters) {
    if (filters[key]) {
      pills.push({
        key,
        label,
        onRemove: () => onChange({ ...filters, [key]: false }),
      });
    }
  }
  if (filters.maxDistance > 0) {
    pills.push({
      key: "maxDistance",
      label: `Within ${filters.maxDistance} km`,
      onRemove: () => onChange({ ...filters, maxDistance: 0 }),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills.map((pill) => (
        <Badge key={pill.key} variant="secondary" className="gap-1 pr-1">
          {pill.label}
          <button
            onClick={pill.onRemove}
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
            aria-label={`Remove ${pill.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => onChange(defaultFilters)}
      >
        Clear all
      </Button>
    </div>
  );
}
