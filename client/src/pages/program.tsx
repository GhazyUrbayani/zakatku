import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp } from "lucide-react";
import { formatCurrency, getCategoryLabel, getCategoryColor } from "@/lib/format";
import type { Campaign } from "@shared/schema";

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
              <Card
                key={campaign.id}
                className="overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-md group"
                data-testid={`card-campaign-${campaign.id}`}
              >
                <div className="h-44 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                  <TrendingUp className="h-20 w-20 text-primary/20 group-hover:scale-110 transition-transform duration-300" />
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

                  <Link href={`/donasi/${campaign.id}`}>
                    <Button className="w-full gap-2" data-testid={`button-donasi-${campaign.id}`}>
                      <Heart className="h-4 w-4" /> Donasi Sekarang
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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
