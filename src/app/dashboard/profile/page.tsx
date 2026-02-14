"use client"; // Client-side for form and maps interactions

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // Assumes lib/supabaseClient.ts exists
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Input } from "@/components/ui/input"; // Shadcn Input
import { Label } from "@/components/ui/label"; // Shadcn Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Shadcn Select
import { Textarea } from "@/components/ui/textarea"; // Shadcn Textarea
import { useToast } from "@/hooks/use-toast"; // Shadcn Toast hook
import { Loader2, Upload } from "lucide-react"; // Icons for loading/upload
import { z } from "zod"; // For validation
import { GoogleMap, LoadScript, Autocomplete } from "@react-google-maps/api"; // For location autocomplete
import { getDistance } from "geolib"; // For potential distance calcs (future)

// Zod schema for validation (required fields per DB)
const profileSchema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  abn: z.string().length(11, { message: "ABN must be 11 digits" }), // Basic check; future API validation
  location: z.object({
    address: z.string().min(1, { message: "Address is required" }),
    lat: z.number(),
    long: z.number(),
    region: z.string().min(1, { message: "Region is required" }),
  }),
  services: z.array(z.string()).min(1, { message: "At least one service is required" }),
  // Optionals: No validation enforcement
});

// Predefined services (expandable from DB in future)
const availableServices = ["Plumbing", "Electrical", "Carpentry", "Painting", "Landscaping", "Roofing"];

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    abn: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    years_in_business: 0,
    number_of_employees: 0,
    certifications: [] as string[],
    insurance_details: "",
    operating_hours: "",
    payment_methods: [] as string[],
    areas_serviced: [] as string[],
    references: [] as string[],
    social_links: {} as Record<string, string>,
    google_reviews_url: "",
    licenses: [] as File[],
    location: { address: "", lat: 0, long: 0, region: "" },
    services: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true; // Flag to prevent multiple runs

    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/auth/login");

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load profile." });
      } else if (data && isMounted) {
        setFormData({
          ...formData,
          ...data,
          licenses: [], // Files not fetched; show uploaded URLs later
        });
      }
      setLoading(false);
    };
    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const long = place.geometry.location.lng();
        const address = place.formatted_address || "";
        const region = place.address_components?.find((comp) =>
          comp.types.includes("administrative_area_level_1")
        )?.long_name || "NSW"; // Default to NSW; extract from place

        setFormData((prev) => ({
          ...prev,
          location: { address, lat, long, region },
        }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, licenses: Array.from(e.target.files) }));
    }
  };

  const uploadLicenses = async (userId: string) => {
    const uploadPromises = formData.licenses.map(async (file, index) => {
      const { data, error } = await supabase.storage
        .from("licenses")
        .upload(`${userId}/license_${index}_${file.name}`, file);

      if (error) throw error;
      return data.path; // Store path for JSONB
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      // Validate required fields
      profileSchema.parse({
        name: formData.name,
        abn: formData.abn,
        location: formData.location,
        services: formData.services,
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      let licenseUrls: string[] = [];
      if (formData.licenses.length > 0) {
        licenseUrls = await uploadLicenses(session.user.id);
      }

      const updateData = {
        ...formData,
        licenses: licenseUrls.length > 0 ? licenseUrls : formData.licenses, // JSONB array of URLs
        verified: false, // Pending admin approval
      };

      const { error } = await supabase
        .from("companies")
        .update(updateData)
        .eq("user_id", session.user.id);

      if (error) throw error;

      toast({ title: "Success", description: "Profile updated! Awaiting admin approval." });
      // Future: Trigger edge function for admin notification
      router.push("/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(fieldErrors);
      } else {
        toast({ variant: "destructive", title: "Error", description: error.message || "Update failed." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground dark:text-white">Company Profile Onboarding</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4 bg-card dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">Basic Info</h2>
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="abn">ABN</Label>
            <Input id="abn" name="abn" value={formData.abn} onChange={handleInputChange} />
            {errors.abn && <p className="text-sm text-destructive">{errors.abn}</p>}
            {/* // Future: ABN validation via API */}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4 bg-card dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">Location</h2>
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} libraries={["places"]}>
            <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
              <Input placeholder="Search address..." />
            </Autocomplete>
          </LoadScript>
          {errors["location.address"] && <p className="text-sm text-destructive">{errors["location.address"]}</p>}
          <Input
            name="region"
            value={formData.location.region}
            onChange={(e) => setFormData((prev) => ({ ...prev, location: { ...prev.location, region: e.target.value } }))}
            placeholder="Region (e.g., Northern Beaches, NSW)"
          />
          {errors["location.region"] && <p className="text-sm text-destructive">{errors["location.region"]}</p>}
        </div>

        {/* Services */}
        <div className="space-y-4 bg-card dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableServices.map((service) => (
              <Button
                key= {service}
                variant={formData.services.includes(service) ? "default" : "outline"}
                onClick={() => handleMultiSelect(service)}
                type="button"
              >
                {service}
              </Button>
            ))}
          </div>
          {errors.services && <p className="text-sm text-destructive">{errors.services}</p>}
        </div>

        {/* Licenses & Files */}
        <div className="space-y-4 bg-card dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">Licenses</h2>
          <Label htmlFor="licenses" className="flex items-center space-x-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Upload Licenses</span>
          </Label>
          <Input id="licenses" type="file" multiple onChange={handleFileChange} className="hidden" />
          {formData.licenses.length > 0 && (
            <p className="text-sm text-muted-foreground">{formData.licenses.length} files selected</p>
          )}
        </div>

        {/* Additional Fields (Optionals) */}
        <div className="space-y-4 bg-card dark:bg-gray-800 p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold text-foreground dark:text-white">Additional Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={formData.website} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
            {/* Add more fields like years_in_business (Input type="number"), etc., similarly */}
          </div>
        </div>

        <Button type="submit" className="md:col-span-2" disabled={submitting}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitting ? "Submitting..." : "Submit Profile"}
        </Button>
      </form>
    </div>
  );
}
