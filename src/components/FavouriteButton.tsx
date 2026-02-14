"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import { toggleFavourite } from "@/lib/supabaseHelpers";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavouriteButtonProps {
  companyId: string;
}

export default function FavouriteButton({ companyId }: FavouriteButtonProps) {
  const { session } = useSession();
  const [isFavourited, setIsFavourited] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    const checkFavourite = async () => {
      const { data } = await supabase
        .from("favourites")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("company_id", companyId)
        .single();

      if (data) setIsFavourited(true);
    };
    checkFavourite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, companyId]);

  const handleToggle = async () => {
    if (!session) {
      router.push("/auth/signup");
      return;
    }

    setLoading(true);
    try {
      const result = await toggleFavourite(supabase, session.user.id, companyId);
      setIsFavourited(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={loading}
      className="h-8 w-8 shrink-0"
      aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isFavourited ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
        }`}
      />
    </Button>
  );
}
