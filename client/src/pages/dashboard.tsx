import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, FolderOpen, TrendingUp, BarChart3 } from "lucide-react";
import { formatCurrency, maskName, getTypeLabel } from "@/lib/format";
import type { Campaign, Donation } from "@shared/schema";

interface Stats {
  totalCollected: number;
  totalDonors: number;
  activeCampaigns: number;
  avgDonation: number;
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge className="bg-primary/10 text-primary">Lunas</Badge>;
    case "pending":
      return <Badge variant="secondary">Menunggu</Badge>;
    case "failed":
      return <Badge variant="destructive">Gagal</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations"],
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-dashboard-title">Dashboard Transparansi</h1>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          Pantau secara transparan bagaimana donasi Anda disalurkan
        </p>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={DollarSign}
            label="Total Terhimpun"
            value={formatCurrency(stats.totalCollected)}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={Users}
            label="Total Donatur"
            value={String(stats.totalDonors)}
            color="bg-secondary/10 text-secondary"
          />
          <StatCard
            icon={FolderOpen}
            label="Program Aktif"
            value={String(stats.activeCampaigns)}
            color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Rata-rata Donasi"
            value={formatCurrency(stats.avgDonation)}
            color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <Card data-testid="card-recent-donations">
          <CardHeader>
            <CardTitle className="text-base">Donasi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {donationsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donatur</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations?.slice(0, 8).map(donation => (
                      <TableRow key={donation.id} data-testid={`row-donation-${donation.id}`}>
                        <TableCell className="font-medium text-sm">
                          {maskName(donation.donorName)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getTypeLabel(donation.type)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatCurrency(donation.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(donation.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Progress */}
        <Card data-testid="card-campaign-progress">
          <CardHeader>
            <CardTitle className="text-base">Progress Program</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="space-y-5">
                {campaigns?.map(campaign => {
                  const pct = Math.round((campaign.collectedAmount / campaign.targetAmount) * 100);
                  return (
                    <div key={campaign.id} data-testid={`progress-campaign-${campaign.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium truncate pr-4">{campaign.title}</p>
                        <span className="text-sm font-bold text-primary flex-shrink-0">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2 mb-1" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(campaign.collectedAmount)}</span>
                        <span>{formatCurrency(campaign.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
