export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000_000) return `Rp${(amount / 1_000_000_000_000).toFixed(0)}T`;
  if (amount >= 1_000_000_000) return `Rp${(amount / 1_000_000_000).toFixed(0)}M`;
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(0)} Juta`;
  if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)}K`;
  return `Rp${amount}`;
}

export function maskName(name: string): string {
  if (name.length <= 3) return name[0] + "***";
  return name[0] + name[1] + "***" + name[name.length - 1];
}

export function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    zakat_maal: "Zakat Maal",
    zakat_penghasilan: "Zakat Penghasilan",
    infaq: "Infaq",
    sedekah: "Sedekah",
  };
  return map[type] || type;
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    pendidikan: "Pendidikan",
    kesehatan: "Kesehatan",
    ekonomi: "Ekonomi",
    bencana: "Bencana",
  };
  return map[category] || category;
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    pendidikan: "bg-primary/10 text-primary",
    kesehatan: "bg-red-500/10 text-red-600 dark:text-red-400",
    ekonomi: "bg-secondary/10 text-secondary dark:text-secondary",
    bencana: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };
  return map[category] || "bg-muted text-muted-foreground";
}
