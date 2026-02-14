import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Phone, Mail, Star, Calendar, Users, Shield, Clock, CreditCard, Map, Book } from "lucide-react";
import { getDistance } from "geolib";
import FavouriteButton from "@/components/FavouriteButton";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    abn: string;
    licenses: string[]; // JSONB URLs
    social_links: Record<string, string>; // JSONB
    google_reviews_url?: string;
    location: { address: string; lat: number; long: number; region: string }; // JSONB
    services: string[]; // Array
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    years_in_business?: number;
    number_of_employees?: number;
    certifications: string[]; // Array
    insurance_details?: string;
    operating_hours?: string;
    payment_methods: string[]; // Array
    areas_serviced: string[]; // Array
    references: string[]; // Array
  };
  userLocation?: { lat: number; long: number }; // Optional for distance
}

export default function CompanyCard({ company, userLocation }: CompanyCardProps) {
  const distance = userLocation
    ? Math.round(getDistance({ latitude: userLocation.lat, longitude: userLocation.long }, { latitude: company.location.lat, longitude: company.location.long }) / 1000) // km
    : null;

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-bold text-foreground dark:text-white">{company.name}</CardTitle>
          <FavouriteButton companyId={company.id} />
        </div>
        <CardDescription className="text-muted-foreground dark:text-gray-300 line-clamp-2">
          {company.description || "No description available."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2 text-sm text-foreground dark:text-white">
          <div className="flex items-center text-muted-foreground dark:text-gray-400">
            <MapPin className="mr-2 h-4 w-4" />
            {company.location.address} ({company.location.region})
            {distance !== null && ` - ${distance} km away`}
          </div>
          {company.years_in_business && (
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {company.years_in_business} years in business
            </div>
          )}
          {company.number_of_employees && (
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {company.number_of_employees} employees
            </div>
          )}
          {company.insurance_details && (
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Insurance: {company.insurance_details}
            </div>
          )}
          {company.operating_hours && (
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Hours: {company.operating_hours}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {company.services.map((service) => (
              <Badge key={service} variant="secondary" className="bg-secondary dark:bg-gray-700 text-secondary-foreground dark:text-gray-300">
                {service}
              </Badge>
            ))}
          </div>
          {company.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {company.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="border-primary text-primary">
                  {cert}
                </Badge>
              ))}
            </div>
          )}
          {company.payment_methods.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
              <CreditCard className="mr-2 h-4 w-4" />
              Payments: {company.payment_methods.join(", ")}
            </div>
          )}
          {company.areas_serviced.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
              <Map className="mr-2 h-4 w-4" />
              Areas: {company.areas_serviced.join(", ")}
            </div>
          )}
          {company.references.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
              <Book className="mr-2 h-4 w-4" />
              References: {company.references.join(", ")}
            </div>
          )}
          {company.licenses.length > 0 && (
            <div className="text-sm text-muted-foreground dark:text-gray-400">
              Licenses: {company.licenses.length} uploaded
            </div>
          )}
          {Object.keys(company.social_links).length > 0 && (
            <div className="text-sm text-muted-foreground dark:text-gray-400">
              Social: {Object.values(company.social_links).join(", ")}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border dark:border-gray-700 pt-4">
        {company.website && (
          <Link href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
            <Globe className="mr-1 h-4 w-4" /> Website
          </Link>
        )}
        {company.phone && (
          <Link href={`tel:${company.phone}`} className="flex items-center text-primary hover:underline">
            <Phone className="mr-1 h-4 w-4" /> Call
          </Link>
        )}
        {company.email && (
          <Link href={`mailto:${company.email}`} className="flex items-center text-primary hover:underline">
            <Mail className="mr-1 h-4 w-4" /> Email
          </Link>
        )}
        {company.google_reviews_url && (
          <Link href={company.google_reviews_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
            <Star className="mr-1 h-4 w-4" /> Reviews
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
