import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, CreditCard, ArrowRight, Phone, BarChart3 } from "lucide-react";
import { formatCurrency, getCategoryLabel, getCategoryColor } from "@/lib/format";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Campaign, Donation } from "@shared/schema";

const campaignImages: Record<string, string> = {
  "camp-1": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
  "camp-2": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop",
  "camp-3": "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=400&fit=crop",
  "camp-4": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&h=400&fit=crop",
  "camp-5": "https://images.unsplash.com/photo-1585036156171-384164a8c521?w=800&h=400&fit=crop",
  "camp-6": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop",
};

const presetAmounts = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];

const donationTypes = [
  { value: "zakat_maal", label: "Zakat Maal" },
  { value: "zakat_penghasilan", label: "Zakat Penghasilan" },
  { value: "infaq", label: "Infaq" },
  { value: "sedekah", label: "Sedekah" },
];

export default function Donasi() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMobile, setDonorMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [result, setResult] = useState<Donation | null>(null);

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", params.id],
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/donations", {
        campaignId: params.id,
        donorName,
        donorEmail,
        donorMobile: donorMobile || undefined,
        amount: Number(amount),
        type,
      });
      return res.json();
    },
    onSuccess: (data: Donation) => {
      setResult(data);
      toast({
        title: "Donasi Berhasil Dibuat!",
        description: "Silakan lanjutkan pembayaran melalui Mayar.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Gagal Membuat Donasi",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorEmail || !amount || !type) {
      toast({ title: "Lengkapi semua field", variant: "destructive" });
      return;
    }
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Skeleton className="h-40 w-full rounded-xl mb-6" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Program tidak ditemukan</p>
      </div>
    );
  }

  const pct = Math.round((campaign.collectedAmount / campaign.targetAmount) * 100);

  // Success state
  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <Card className="text-center" data-testid="card-donasi-success">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Donasi Berhasil!</h2>
            <p className="text-muted-foreground mb-2">
              Terima kasih, <strong>{result.donorName}</strong>
            </p>
            <p className="text-2xl font-extrabold text-primary mb-2" data-testid="text-donasi-amount">
              {formatCurrency(result.amount)}
            </p>
            <Badge variant="secondary" className="mb-6 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Pembayaran Diterima
            </Badge>
            <p className="text-sm text-muted-foreground mb-6">
              Donasi Anda untuk <strong>{campaign?.title}</strong> telah berhasil diproses.
              Jazakallahu khairan atas kebaikan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/program">
                <Button variant="outline" className="gap-2 w-full" data-testid="button-donasi-lagi">
                  <CreditCard className="h-4 w-4" />
                  Donasi Lagi
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="gap-2 w-full" data-testid="button-lihat-dashboard">
                  <BarChart3 className="h-4 w-4" />
                  Lihat Dashboard
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Invoice: {result.mayarInvoiceId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Campaign Summary */}
      <Card className="mb-6" data-testid="card-campaign-summary">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={campaignImages[campaign.id] || `https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=200&h=200&fit=crop`}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Badge className={`mb-2 ${getCategoryColor(campaign.category)}`} variant="secondary">
                {getCategoryLabel(campaign.category)}
              </Badge>
              <h2 className="font-bold text-lg">{campaign.title}</h2>
              <Progress value={pct} className="h-1.5 mt-3 mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-primary font-semibold">{formatCurrency(campaign.collectedAmount)}</span>
                <span className="text-muted-foreground">target {formatCurrency(campaign.targetAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Form */}
      <Card data-testid="card-donasi-form">
        <CardHeader>
          <CardTitle className="text-lg">Form Donasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="donor-name">Nama Lengkap</Label>
              <Input
                id="donor-name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Masukkan nama Anda"
                required
                data-testid="input-donor-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor-email">Email</Label>
              <Input
                id="donor-email"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="email@contoh.com"
                required
                data-testid="input-donor-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor-mobile">Nomor HP (opsional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="donor-mobile"
                  type="tel"
                  value={donorMobile}
                  onChange={(e) => setDonorMobile(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="pl-10"
                  data-testid="input-donor-mobile"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jenis Donasi</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-donation-type">
                  <SelectValue placeholder="Pilih jenis donasi" />
                </SelectTrigger>
                <SelectContent>
                  {donationTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nominal Donasi</Label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
                {presetAmounts.map(preset => (
                  <Button
                    key={preset}
                    type="button"
                    variant={Number(amount) === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(String(preset))}
                    data-testid={`button-preset-${preset}`}
                    className="text-xs"
                  >
                    {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}K`}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Input
                  type="number"
                  min="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Masukkan nominal lain"
                  className="pl-10"
                  required
                  data-testid="input-donation-amount"
                />
              </div>
              {amount && (
                <p className="text-sm font-medium text-primary" data-testid="text-amount-preview">
                  {formatCurrency(Number(amount))}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={mutation.isPending}
              data-testid="button-submit-donasi"
            >
              {mutation.isPending ? (
                "Memproses..."
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Bayar via Mayar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
