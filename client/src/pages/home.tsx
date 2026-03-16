import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, Eye, CreditCard, BarChart3, Heart, ArrowRight } from "lucide-react";
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

function IslamicPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            <path d="M30 15L37.5 22.5L30 30L22.5 22.5Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            <path d="M30 30L37.5 37.5L30 45L22.5 37.5Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      </svg>
    </div>
  );
}

export default function Home() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const featuredCampaigns = campaigns?.filter(c => c.isActive).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        <IslamicPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium" data-testid="badge-ramadhan">
            🌙 Ramadhan 1447H / 2026
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight" data-testid="text-hero-title">
            Tunaikan Zakat, Tutup Gap{" "}
            <span className="text-primary">Rp286 Triliun</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Potensi zakat Indonesia mencapai Rp327 triliun, namun baru Rp41 triliun yang terhimpun.
            Bersama ZakatKu, hitung zakat Anda dengan akurat dan salurkan ke program terpercaya.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/kalkulator">
              <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-hitung-zakat">
                <Calculator className="h-5 w-5" />
                Hitung Zakat
              </Button>
            </Link>
            <Link href="/program">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-donasi-sekarang">
                <Heart className="h-5 w-5" />
                Donasi Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary text-primary-foreground py-6" data-testid="section-stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "Rp327T", label: "Potensi Zakat" },
              { value: "Rp41T", label: "Terhimpun" },
              { value: "87%", label: "Gap Zakat" },
              { value: "192 Juta", label: "Muzakki" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xl sm:text-2xl font-extrabold" data-testid={`stat-value-${stat.label}`}>{stat.value}</div>
                <div className="text-xs sm:text-sm opacity-80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ZakatKu */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-mengapa-title">Mengapa ZakatKu?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Platform zakat modern yang menggabungkan teknologi AI dengan nilai-nilai Islam
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calculator,
                title: "AI Calculator",
                desc: "Hitung zakat maal, penghasilan, emas, pertanian & perdagangan secara akurat dengan kalkulator berbasis AI",
              },
              {
                icon: Eye,
                title: "Transparan",
                desc: "Pantau setiap rupiah donasi Anda melalui dashboard transparansi real-time yang bisa diakses publik",
              },
              {
                icon: CreditCard,
                title: "Pembayaran Mayar",
                desc: "Bayar zakat dan donasi dengan mudah melalui berbagai metode pembayaran via Mayar payment gateway",
              },
              {
                icon: BarChart3,
                title: "Impact Tracking",
                desc: "Lacak dampak donasi Anda dengan laporan berkala dan update program yang didanai",
              },
            ].map((feature, i) => (
              <Card key={i} className="border border-border hover:border-primary/30 transition-colors" data-testid={`card-feature-${i}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-program-title">Program Unggulan</h2>
              <p className="mt-2 text-muted-foreground">Salurkan donasi ke program-program terpercaya</p>
            </div>
            <Link href="/program">
              <Button variant="ghost" className="hidden sm:flex gap-2" data-testid="button-lihat-semua">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCampaigns?.map(campaign => {
                const pct = Math.round((campaign.collectedAmount / campaign.targetAmount) * 100);
                return (
                  <Link key={campaign.id} href={`/donasi/${campaign.id}`}>
                    <Card className="overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-md group cursor-pointer h-full" data-testid={`card-campaign-${campaign.id}`}>
                      <div className="h-40 relative overflow-hidden">
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
                        <h3 className="font-bold text-base mb-2 line-clamp-1">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>
                        <Progress value={pct} className="h-2 mb-3" />
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-primary">{formatCurrency(campaign.collectedAmount)}</span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-4">
                          dari target {formatCurrency(campaign.targetAmount)}
                        </div>
                        <div className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-4 py-2 text-sm font-medium" data-testid={`button-donasi-${campaign.id}`}>
                          Donasi Sekarang
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/program">
              <Button variant="outline" className="gap-2">
                Lihat Semua Program <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
