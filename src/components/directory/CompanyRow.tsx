"use client";

import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CompanyCard from "@/components/CompanyCard";
import FavouriteButton from "@/components/FavouriteButton";
import StarRating from "@/components/directory/StarRating";

interface CompanyRowProps {
  company: {
    id: string;
    name: string;
    abn: string;
    licenses: string[];
    social_links: Record<string, string>;
    google_reviews_url?: string;
    location: { address: string; lat: number; long: number; region: string };
    services: string[];
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    years_in_business?: number;
    number_of_employees?: number;
    certifications: string[];
    insurance_details?: string;
    operating_hours?: string;
    payment_methods: string[];
    areas_serviced: string[];
    references: string[];
    subscription_tier?: string;
    [key: string]: unknown;
  };
  reviewData?: { average: number; count: number };
  isExpanded: boolean;
  onToggle: () => void;
}

const tierColors: Record<string, string> = {
  enterprise: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  pro: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  basic: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function CompanyRow({ company, reviewData, isExpanded, onToggle }: CompanyRowProps) {
  const tier = company.subscription_tier?.toLowerCase() || "basic";
  const visibleServices = company.services.slice(0, 3);
  const overflowCount = Math.max(0, company.services.length - 3);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border">
          {/* Left: Name, tier, rating, region */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium uppercase ${tierColors[tier] || tierColors.basic}`}>
                {tier}
              </Badge>
              <span className="font-semibold text-foreground dark:text-white truncate">
                {company.name}
              </span>
              {reviewData && reviewData.count > 0 && (
                <StarRating rating={reviewData.average} count={reviewData.count} />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
              <span>{company.location.region}</span>
              {company.years_in_business && (
                <>
                  <span>·</span>
                  <span>{company.years_in_business} yrs</span>
                </>
              )}
            </div>
          </div>

          {/* Middle: Service badges */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {visibleServices.map((svc) => (
              <Badge key={svc} variant="outline" className="text-xs">
                {svc}
              </Badge>
            ))}
            {overflowCount > 0 && (
              <span className="text-xs text-muted-foreground">+{overflowCount}</span>
            )}
          </div>

          {/* Right: Favourite + chevron */}
          <div className="flex items-center gap-1 shrink-0">
            <FavouriteButton companyId={company.id} />
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-4 bg-muted/30 border-b border-border">
          <CompanyCard company={company} embedded />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
