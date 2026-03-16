import { randomUUID } from "crypto";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, ...assets } = req.body;

  if (!type) return res.status(400).json({ error: "Jenis zakat harus diisi" });

  let totalAssets = 0;
  let zakatAmount = 0;
  let details = {};
  const GOLD_PRICE_PER_GRAM = 1000000;
  const NISAB_GOLD_GRAMS = 85;
  const NISAB_MAAL = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM;
  const NISAB_PENGHASILAN_MONTHLY = 6650000;
  const NISAB_PERTANIAN_KG = 653;

  switch (type) {
    case "zakat_maal": {
      const tabungan = Number(assets.tabungan) || 0;
      const deposito = Number(assets.deposito) || 0;
      const investasi = Number(assets.investasi) || 0;
      const properti = Number(assets.properti) || 0;
      const hutang = Number(assets.hutang) || 0;
      totalAssets = tabungan + deposito + investasi + properti - hutang;
      const meetsNisab = totalAssets >= NISAB_MAAL;
      zakatAmount = meetsNisab ? totalAssets * 0.025 : 0;
      details = {
        type: "Zakat Maal",
        breakdown: { tabungan, deposito, investasi, properti, hutang },
        totalAssets,
        nisab: NISAB_MAAL,
        meetsNisab,
        rate: "2.5%",
        zakatAmount,
      };
      break;
    }
    case "zakat_penghasilan": {
      const gaji = Number(assets.gaji) || 0;
      const bonus = Number(assets.bonus) || 0;
      const pendapatanLain = Number(assets.pendapatanLain) || 0;
      totalAssets = gaji + bonus + pendapatanLain;
      const meetsNisab = totalAssets >= NISAB_PENGHASILAN_MONTHLY;
      zakatAmount = meetsNisab ? totalAssets * 0.025 : 0;
      details = {
        type: "Zakat Penghasilan",
        breakdown: { gaji, bonus, pendapatanLain },
        totalAssets,
        nisab: NISAB_PENGHASILAN_MONTHLY,
        meetsNisab,
        rate: "2.5%",
        zakatAmount,
      };
      break;
    }
    case "zakat_emas": {
      const beratEmas = Number(assets.beratEmas) || 0;
      const hargaPerGram = Number(assets.hargaPerGram) || GOLD_PRICE_PER_GRAM;
      totalAssets = beratEmas * hargaPerGram;
      const meetsNisab = beratEmas >= NISAB_GOLD_GRAMS;
      zakatAmount = meetsNisab ? totalAssets * 0.025 : 0;
      details = {
        type: "Zakat Emas & Perak",
        breakdown: { beratEmas, hargaPerGram },
        totalAssets,
        nisabGram: NISAB_GOLD_GRAMS,
        meetsNisab,
        rate: "2.5%",
        zakatAmount,
      };
      break;
    }
    case "zakat_pertanian": {
      const hasilPanen = Number(assets.hasilPanen) || 0;
      const jenisIrigasi = assets.jenisIrigasi || "irigasi";
      totalAssets = hasilPanen;
      const meetsNisab = hasilPanen >= NISAB_PERTANIAN_KG;
      const rate = jenisIrigasi === "tadah_hujan" ? 0.10 : 0.05;
      zakatAmount = meetsNisab ? hasilPanen * rate : 0;
      details = {
        type: "Zakat Pertanian",
        breakdown: { hasilPanen, jenisIrigasi },
        totalAssets,
        nisabKg: NISAB_PERTANIAN_KG,
        meetsNisab,
        rate: jenisIrigasi === "tadah_hujan" ? "10%" : "5%",
        zakatAmount,
        unit: "kg",
      };
      break;
    }
    case "zakat_perdagangan": {
      const asetDagang = Number(assets.asetDagang) || 0;
      const piutang = Number(assets.piutang) || 0;
      const hutangDagang = Number(assets.hutangDagang) || 0;
      totalAssets = asetDagang + piutang - hutangDagang;
      const meetsNisab = totalAssets >= NISAB_MAAL;
      zakatAmount = meetsNisab ? totalAssets * 0.025 : 0;
      details = {
        type: "Zakat Perdagangan",
        breakdown: { asetDagang, piutang, hutangDagang },
        totalAssets,
        nisab: NISAB_MAAL,
        meetsNisab,
        rate: "2.5%",
        zakatAmount,
      };
      break;
    }
    default:
      return res.status(400).json({ error: "Jenis zakat tidak valid" });
  }

  const calc = {
    id: randomUUID(),
    type,
    totalAssets,
    zakatAmount,
    details,
  };

  res.status(200).json(calc);
}
