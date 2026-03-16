import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, CheckCircle2, XCircle, ArrowRight, Coins, Briefcase, Wheat, Gem, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface CalcResult {
  totalAssets: number;
  nisab: number;
  meetsNisab: boolean;
  zakatAmount: number;
  rate: string;
  breakdown: Record<string, number | string>;
}

function CurrencyInput({ label, value, onChange, id }: { label: string; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
        <Input
          id={id}
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
          placeholder="0"
          data-testid={`input-${id}`}
        />
      </div>
    </div>
  );
}

function ResultCard({ result, type }: { result: CalcResult | null; type: string }) {
  if (!result) return null;
  return (
    <Card className="mt-6 border-2 border-primary/20 bg-primary/5" data-testid="card-calc-result">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {result.meetsNisab ? (
            <Badge className="bg-primary/10 text-primary gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mencapai Nisab
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Belum Mencapai Nisab
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Aset</p>
            <p className="font-bold text-lg" data-testid="text-total-assets">
              {type === "zakat_pertanian" ? `${result.totalAssets.toLocaleString('id-ID')} kg` : formatCurrency(result.totalAssets)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nisab</p>
            <p className="font-semibold text-base" data-testid="text-nisab">
              {type === "zakat_pertanian" ? `${result.nisab.toLocaleString('id-ID')} kg` : formatCurrency(result.nisab)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tarif Zakat</p>
            <p className="font-semibold text-base">{result.rate}</p>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-4">
          <p className="text-sm text-muted-foreground mb-1">Zakat yang harus dibayar</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary" data-testid="text-zakat-amount">
            {type === "zakat_pertanian" ? `${result.zakatAmount.toLocaleString('id-ID')} kg` : formatCurrency(result.zakatAmount)}
          </p>
        </div>

        {result.meetsNisab && result.zakatAmount > 0 && (
          <Link href="/program">
            <Button className="mt-4 gap-2 w-full sm:w-auto" data-testid="button-bayar-zakat">
              Bayar Zakat <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// === ZAKAT MAAL ===
function ZakatMaalTab() {
  const [vals, setVals] = useState({ tabungan: "", deposito: "", investasi: "", properti: "", hutang: "" });
  const set = (key: string) => (v: string) => setVals(p => ({ ...p, [key]: v }));

  const NISAB = 85000000;
  const total = (Number(vals.tabungan) || 0) + (Number(vals.deposito) || 0) + (Number(vals.investasi) || 0) + (Number(vals.properti) || 0) - (Number(vals.hutang) || 0);
  const meetsNisab = total >= NISAB;
  const zakatAmount = meetsNisab ? total * 0.025 : 0;

  const result: CalcResult | null = (vals.tabungan || vals.deposito || vals.investasi || vals.properti)
    ? { totalAssets: total, nisab: NISAB, meetsNisab, zakatAmount, rate: "2,5%", breakdown: vals as any }
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Tabungan" value={vals.tabungan} onChange={set("tabungan")} id="maal-tabungan" />
        <CurrencyInput label="Deposito" value={vals.deposito} onChange={set("deposito")} id="maal-deposito" />
        <CurrencyInput label="Investasi (Saham, Reksadana)" value={vals.investasi} onChange={set("investasi")} id="maal-investasi" />
        <CurrencyInput label="Properti (Non-Pribadi)" value={vals.properti} onChange={set("properti")} id="maal-properti" />
        <CurrencyInput label="Hutang (Pengurang)" value={vals.hutang} onChange={set("hutang")} id="maal-hutang" />
      </div>
      <ResultCard result={result} type="zakat_maal" />
    </div>
  );
}

// === ZAKAT PENGHASILAN ===
function ZakatPenghasilanTab() {
  const [vals, setVals] = useState({ gaji: "", bonus: "", pendapatanLain: "" });
  const set = (key: string) => (v: string) => setVals(p => ({ ...p, [key]: v }));

  const NISAB = 6650000;
  const total = (Number(vals.gaji) || 0) + (Number(vals.bonus) || 0) + (Number(vals.pendapatanLain) || 0);
  const meetsNisab = total >= NISAB;
  const zakatAmount = meetsNisab ? total * 0.025 : 0;

  const result: CalcResult | null = vals.gaji
    ? { totalAssets: total, nisab: NISAB, meetsNisab, zakatAmount, rate: "2,5%", breakdown: vals as any }
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Gaji Bulanan" value={vals.gaji} onChange={set("gaji")} id="penghasilan-gaji" />
        <CurrencyInput label="Bonus / THR" value={vals.bonus} onChange={set("bonus")} id="penghasilan-bonus" />
        <CurrencyInput label="Pendapatan Lain" value={vals.pendapatanLain} onChange={set("pendapatanLain")} id="penghasilan-lain" />
      </div>
      <ResultCard result={result} type="zakat_penghasilan" />
    </div>
  );
}

// === ZAKAT EMAS ===
function ZakatEmasTab() {
  const [beratEmas, setBeratEmas] = useState("");
  const [hargaPerGram, setHargaPerGram] = useState("1000000");

  const NISAB = 85;
  const berat = Number(beratEmas) || 0;
  const harga = Number(hargaPerGram) || 0;
  const total = berat * harga;
  const meetsNisab = berat >= NISAB;
  const zakatAmount = meetsNisab ? total * 0.025 : 0;

  const result: CalcResult | null = beratEmas
    ? { totalAssets: total, nisab: NISAB * harga, meetsNisab, zakatAmount, rate: "2,5%", breakdown: { beratEmas: berat, hargaPerGram: harga } }
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emas-berat">Berat Emas (gram)</Label>
          <Input
            id="emas-berat"
            type="number"
            min="0"
            step="0.01"
            value={beratEmas}
            onChange={(e) => setBeratEmas(e.target.value)}
            placeholder="0"
            data-testid="input-emas-berat"
          />
          <p className="text-xs text-muted-foreground">Nisab: 85 gram emas</p>
        </div>
        <CurrencyInput label="Harga Emas per Gram" value={hargaPerGram} onChange={setHargaPerGram} id="emas-harga" />
      </div>
      <ResultCard result={result} type="zakat_emas" />
    </div>
  );
}

// === ZAKAT PERTANIAN ===
function ZakatPertanianTab() {
  const [hasilPanen, setHasilPanen] = useState("");
  const [jenisIrigasi, setJenisIrigasi] = useState("irigasi");

  const NISAB = 653;
  const hasil = Number(hasilPanen) || 0;
  const rate = jenisIrigasi === "tadah_hujan" ? 0.10 : 0.05;
  const meetsNisab = hasil >= NISAB;
  const zakatAmount = meetsNisab ? hasil * rate : 0;

  const result: CalcResult | null = hasilPanen
    ? { totalAssets: hasil, nisab: NISAB, meetsNisab, zakatAmount, rate: jenisIrigasi === "tadah_hujan" ? "10%" : "5%", breakdown: { hasilPanen: hasil, jenisIrigasi } }
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pertanian-hasil">Hasil Panen (kg)</Label>
          <Input
            id="pertanian-hasil"
            type="number"
            min="0"
            value={hasilPanen}
            onChange={(e) => setHasilPanen(e.target.value)}
            placeholder="0"
            data-testid="input-pertanian-hasil"
          />
          <p className="text-xs text-muted-foreground">Nisab: 653 kg gabah/beras</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pertanian-irigasi">Jenis Pengairan</Label>
          <Select value={jenisIrigasi} onValueChange={setJenisIrigasi}>
            <SelectTrigger data-testid="select-pertanian-irigasi">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="irigasi">Irigasi (5%)</SelectItem>
              <SelectItem value="tadah_hujan">Tadah Hujan (10%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ResultCard result={result} type="zakat_pertanian" />
    </div>
  );
}

// === ZAKAT PERDAGANGAN ===
function ZakatPerdaganganTab() {
  const [vals, setVals] = useState({ asetDagang: "", piutang: "", hutangDagang: "" });
  const set = (key: string) => (v: string) => setVals(p => ({ ...p, [key]: v }));

  const NISAB = 85000000;
  const total = (Number(vals.asetDagang) || 0) + (Number(vals.piutang) || 0) - (Number(vals.hutangDagang) || 0);
  const meetsNisab = total >= NISAB;
  const zakatAmount = meetsNisab ? total * 0.025 : 0;

  const result: CalcResult | null = vals.asetDagang
    ? { totalAssets: total, nisab: NISAB, meetsNisab, zakatAmount, rate: "2,5%", breakdown: vals as any }
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput label="Aset Dagang" value={vals.asetDagang} onChange={set("asetDagang")} id="dagang-aset" />
        <CurrencyInput label="Piutang Dagang" value={vals.piutang} onChange={set("piutang")} id="dagang-piutang" />
        <CurrencyInput label="Hutang Dagang" value={vals.hutangDagang} onChange={set("hutangDagang")} id="dagang-hutang" />
      </div>
      <ResultCard result={result} type="zakat_perdagangan" />
    </div>
  );
}

export default function Kalkulator() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calculator className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-kalkulator-title">Kalkulator Zakat</h1>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          Hitung kewajiban zakat Anda secara akurat berdasarkan ketentuan syariah Islam
        </p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="zakat_maal" data-testid="tabs-zakat-type">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1 bg-muted p-1">
              <TabsTrigger value="zakat_maal" className="text-xs sm:text-sm gap-1.5 py-2" data-testid="tab-zakat-maal">
                <Wallet className="h-3.5 w-3.5 hidden sm:block" /> Maal
              </TabsTrigger>
              <TabsTrigger value="zakat_penghasilan" className="text-xs sm:text-sm gap-1.5 py-2" data-testid="tab-zakat-penghasilan">
                <Briefcase className="h-3.5 w-3.5 hidden sm:block" /> Penghasilan
              </TabsTrigger>
              <TabsTrigger value="zakat_emas" className="text-xs sm:text-sm gap-1.5 py-2" data-testid="tab-zakat-emas">
                <Gem className="h-3.5 w-3.5 hidden sm:block" /> Emas
              </TabsTrigger>
              <TabsTrigger value="zakat_pertanian" className="text-xs sm:text-sm gap-1.5 py-2" data-testid="tab-zakat-pertanian">
                <Wheat className="h-3.5 w-3.5 hidden sm:block" /> Pertanian
              </TabsTrigger>
              <TabsTrigger value="zakat_perdagangan" className="col-span-2 sm:col-span-1 text-xs sm:text-sm gap-1.5 py-2" data-testid="tab-zakat-perdagangan">
                <Coins className="h-3.5 w-3.5 hidden sm:block" /> Perdagangan
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="zakat_maal"><ZakatMaalTab /></TabsContent>
              <TabsContent value="zakat_penghasilan"><ZakatPenghasilanTab /></TabsContent>
              <TabsContent value="zakat_emas"><ZakatEmasTab /></TabsContent>
              <TabsContent value="zakat_pertanian"><ZakatPertanianTab /></TabsContent>
              <TabsContent value="zakat_perdagangan"><ZakatPerdaganganTab /></TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
