import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { formatCurrency, getCategoryLabel, getCategoryColor } from "@/lib/format";
import type { Campaign } from "@shared/schema";

const campaignImages: Record<string, string> = {
  "camp-1": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
  "camp-2": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop",
  "camp-3": "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=400&fit=crop",
  "camp-4": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&h=400&fit=crop",
  "camp-5": "https://images.unsplash.com/photo-1585036156171-384164a8c521?w=800&h=400&fit=crop",
  "camp-6": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop",
};

const categories = [
  { value: "semua", label: "Semua" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "ekonomi", label: "Ekonomi" },
  { value: "bencana", label: "Bencana" },
];

export default function Program() {
  const [filter, setFilter] = useState("semua");

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const filtered = campaigns?.filter(c => {
    if (filter === "semua") return true;
    return c.category === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-program-title">Program Donasi</h1>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          Pilih program donasi yang sesuai dengan niat baik Anda
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex justify-center">
        <div className="flex flex-wrap gap-2 justify-center" data-testid="filter-categories">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={filter === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat.value)}
              data-testid={`filter-${cat.value}`}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-44 w-full" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map(campaign => {
            const pct = Math.round((campaign.collectedAmount / campaign.targetAmount) * 100);
            return (
              <Link key={campaign.id} href={`/donasi/${campaign.id}`}>
                <Card
                  className="overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-md group cursor-pointer h-full"
                  data-testid={`card-campaign-${campaign.id}`}
                >
                  <div className="h-44 relative overflow-hidden">
                    <img
                      src={campaignImages[campaign.id] || `https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=400&fit=crop`}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-5">
                    <Badge className={`mb-3 ${getCategoryColor(campaign.category)}`} variant="secondary">
                      {getCategoryLabel(campaign.category)}
                    </Badge>
                    <h3 className="font-bold text-base mb-2">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>

                    <Progress value={pct} className="h-2 mb-3" />

                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-primary">{formatCurrency(campaign.collectedAmount)}</span>
                      <span className="text-muted-foreground font-medium">{pct}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      dari target {formatCurrency(campaign.targetAmount)}
                    </p>

                    <div className="w-full gap-2 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium" data-testid={`button-donasi-${campaign.id}`}>
                      <Heart className="h-4 w-4" /> Donasi Sekarang
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {filtered?.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada program di kategori ini</p>
        </div>
      )}
    </div>
  );
}
