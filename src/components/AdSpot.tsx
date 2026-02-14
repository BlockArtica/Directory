import Image from "next/image"; // For optimized images
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"; // Shadcn Card for framing

interface AdSpotProps {
  spot: number;
  imageUrl?: string;
  linkUrl?: string;
}

export default function AdSpot({ spot, imageUrl, linkUrl }: AdSpotProps) {
  const placeholderImage = "/placeholder-ad.png"; // Add static placeholder in public/
  const placeholderLink = "#"; // Fallback

  return (
    <Card className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
      <CardContent className="p-0">
        <Link href={linkUrl || placeholderLink} target="_blank" rel="noopener noreferrer">
          <div className="relative h-32 md:h-48">
            <Image
              src={imageUrl || placeholderImage}
              alt={`Ad Spot ${spot}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={spot === 1} // Priority for first spot
              unoptimized
            />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
