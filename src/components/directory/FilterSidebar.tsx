"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";

export interface FilterState {
  service: string;
  region: string;
  sortBy: "relevance" | "rating" | "reviews" | "years" | "distance";
  minRating: number;
  minYears: number;
  minEmployees: number;
  tiers: string[];
  paymentMethods: string[];
  hasInsurance: boolean;
  hasCertifications: boolean;
  hasWebsite: boolean;
  hasOperatingHours: boolean;
  hasReferences: boolean;
  hasLicenses: boolean;
  maxDistance: number;
}

export const defaultFilters: FilterState = {
  service: "",
  region: "",
  sortBy: "relevance",
  minRating: 0,
  minYears: 0,
  minEmployees: 0,
  tiers: [],
  paymentMethods: [],
  hasInsurance: false,
  hasCertifications: false,
  hasWebsite: false,
  hasOperatingHours: false,
  hasReferences: false,
  hasLicenses: false,
  maxDistance: 0,
};

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableServices: string[];
  availableRegions: string[];
  availablePaymentMethods: string[];
  hasLocation: boolean;
}

function FilterControls({
  filters,
  onChange,
  availableServices,
  availableRegions,
  availablePaymentMethods,
  hasLocation,
}: FilterSidebarProps) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const toggleTier = (tier: string) => {
    const tiers = filters.tiers.includes(tier)
      ? filters.tiers.filter((t) => t !== tier)
      : [...filters.tiers, tier];
    update({ tiers });
  };

  const togglePayment = (method: string) => {
    const paymentMethods = filters.paymentMethods.includes(method)
      ? filters.paymentMethods.filter((m) => m !== method)
      : [...filters.paymentMethods, method];
    update({ paymentMethods });
  };

  const isDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Filters</h3>
        {!isDefault && (
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={() => onChange(defaultFilters)}>
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Sort By */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Sort by</Label>
        <Select value={filters.sortBy} onValueChange={(v) => update({ sortBy: v as FilterState["sortBy"] })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="rating">Best Rating</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
            <SelectItem value="years">Years in Business</SelectItem>
            {hasLocation && <SelectItem value="distance">Distance</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {/* Service */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Service</Label>
        <Select value={filters.service || "all"} onValueChange={(v) => update({ service: v === "all" ? "" : v })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {availableServices.map((svc) => (
              <SelectItem key={svc} value={svc}>{svc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Region */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Region</Label>
        <Select value={filters.region || "all"} onValueChange={(v) => update({ region: v === "all" ? "" : v })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {availableRegions.map((reg) => (
              <SelectItem key={reg} value={reg}>{reg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Min Rating */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Min Rating</Label>
        <Select value={String(filters.minRating)} onValueChange={(v) => update({ minRating: Number(v) })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Min Years */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Min Years in Business</Label>
        <Select value={String(filters.minYears)} onValueChange={(v) => update({ minYears: Number(v) })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
            <SelectItem value="10">10+</SelectItem>
            <SelectItem value="20">20+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Min Employees */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Min Employees</Label>
        <Select value={String(filters.minEmployees)} onValueChange={(v) => update({ minEmployees: Number(v) })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
            <SelectItem value="10">10+</SelectItem>
            <SelectItem value="20">20+</SelectItem>
            <SelectItem value="50">50+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Tier Checkboxes */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Subscription Tier</Label>
        {["enterprise", "pro", "basic"].map((tier) => (
          <div key={tier} className="flex items-center gap-2">
            <Checkbox
              id={`tier-${tier}`}
              checked={filters.tiers.includes(tier)}
              onCheckedChange={() => toggleTier(tier)}
            />
            <Label htmlFor={`tier-${tier}`} className="text-xs capitalize cursor-pointer">
              {tier}
            </Label>
          </div>
        ))}
      </div>

      {/* Payment Methods Checkboxes */}
      {availablePaymentMethods.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Payment Methods</Label>
          {availablePaymentMethods.map((method) => (
            <div key={method} className="flex items-center gap-2">
              <Checkbox
                id={`pay-${method}`}
                checked={filters.paymentMethods.includes(method)}
                onCheckedChange={() => togglePayment(method)}
              />
              <Label htmlFor={`pay-${method}`} className="text-xs cursor-pointer">
                {method}
              </Label>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Boolean Switches */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Requirements</Label>
        {([
          ["hasInsurance", "Has Insurance"],
          ["hasCertifications", "Has Certifications"],
          ["hasWebsite", "Has Website"],
          ["hasOperatingHours", "Has Operating Hours"],
          ["hasReferences", "Has References"],
          ["hasLicenses", "Has Licenses"],
        ] as const).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="text-xs cursor-pointer">{label}</Label>
            <Switch
              id={key}
              checked={filters[key]}
              onCheckedChange={(checked) => update({ [key]: checked })}
            />
          </div>
        ))}
      </div>

      {/* Max Distance (only if location shared) */}
      {hasLocation && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Max Distance</Label>
            <Select value={String(filters.maxDistance)} onValueChange={(v) => update({ maxDistance: Number(v) })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}

export default function FilterSidebar(props: FilterSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 pb-8">
            <FilterControls {...props} />
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 px-4 pt-8">
            <SheetHeader className="sr-only">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Filter and sort directory listings</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div className="pr-4 pb-8">
                <FilterControls {...props} />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
