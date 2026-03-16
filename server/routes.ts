import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCampaignSchema, insertDonationSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === CAMPAIGNS ===
  app.get("/api/campaigns", async (_req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign tidak ditemukan" });
    res.json(campaign);
  });

  app.post("/api/campaigns", async (req, res) => {
    const parsed = insertCampaignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const campaign = await storage.createCampaign(parsed.data);
    res.status(201).json(campaign);
  });

  // === DONATIONS ===
  app.get("/api/donations", async (_req, res) => {
    const donations = await storage.getDonations();
    res.json(donations);
  });

  app.get("/api/donations/campaign/:id", async (req, res) => {
    const donations = await storage.getDonationsByCampaign(req.params.id);
    res.json(donations);
  });

  app.post("/api/donations", async (req, res) => {
    const parsed = insertDonationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const donation = await storage.createDonation(parsed.data);

    // ===== MAYAR PAYMENT INTEGRATION =====
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;

    if (MAYAR_API_KEY) {
      // Production mode: call Mayar API
      try {
        const campaign = await storage.getCampaign(parsed.data.campaignId);
        const campaignTitle = campaign ? campaign.title : "Program Donasi ZakatKu";
        const typeLabel =
          parsed.data.type === "zakat_maal" ? "Zakat Maal" :
          parsed.data.type === "zakat_penghasilan" ? "Zakat Penghasilan" :
          parsed.data.type === "infaq" ? "Infaq" : "Sedekah";

        const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const origin = req.headers.origin || req.headers.referer || "https://zakatku-mayar.vercel.app";

        const donorMobile = (req.body as Record<string, unknown>).donorMobile as string | undefined;

        const mayarPayload = {
          name: parsed.data.donorName,
          email: parsed.data.donorEmail,
          mobile: donorMobile || "08000000000",
          description: `${typeLabel} - ${campaignTitle} | ZakatKu`,
          expiredAt,
          redirectUrl: `${origin}/#/dashboard`,
          items: [{
            quantity: 1,
            rate: parsed.data.amount,
            description: `Donasi ${campaignTitle}`,
          }],
          extraData: {
            noCustomer: parsed.data.donorEmail,
            idProd: parsed.data.campaignId,
            donationId: donation.id,
            donationType: parsed.data.type,
          },
        };

        const mayarResponse = await fetch("https://api.mayar.id/hl/v1/invoice/create", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${MAYAR_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mayarPayload),
        });

        const mayarData = await mayarResponse.json() as {
          statusCode: number;
          messages: string;
          data?: { id: string; link: string; transactionId: string; expiredAt: number };
        };

        if (mayarData.statusCode === 200 && mayarData.data) {
          const updated = await storage.updateDonationStatus(
            donation.id,
            "pending",
            mayarData.data.link,
            mayarData.data.id
          );
          return res.status(201).json(updated);
        } else {
          console.error("Mayar API error:", mayarData);
          return res.status(502).json({
            error: "Gagal membuat invoice Mayar",
            detail: mayarData.messages || "Unknown error",
          });
        }
      } catch (error: unknown) {
        console.error("Mayar API call failed:", error);
        return res.status(502).json({
          error: "Gagal menghubungi Mayar API",
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      // Demo mode: generate mock Mayar payment link
      const invoiceId = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
      const paymentUrl = `https://mayar.id/pay/demo-${invoiceId}`;

      const updated = await storage.updateDonationStatus(donation.id, "pending", paymentUrl, invoiceId);
      res.status(201).json(updated);
    }
  });

  // === ZAKAT CALCULATOR ===
  app.post("/api/zakat/calculate", async (req, res) => {
    const { type, ...assets } = req.body;

    if (!type) return res.status(400).json({ error: "Jenis zakat harus diisi" });

    let totalAssets = 0;
    let zakatAmount = 0;
    let details: Record<string, unknown> = {};
    const GOLD_PRICE_PER_GRAM = 1000000; // Rp 1,000,000 per gram (approx)
    const NISAB_GOLD_GRAMS = 85;
    const NISAB_MAAL = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM; // ~Rp85,000,000
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
        const jenisIrigasi = assets.jenisIrigasi || "irigasi"; // "irigasi" or "tadah_hujan"
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

    const calc = await storage.createZakatCalculation({
      type,
      totalAssets,
      zakatAmount,
      details: JSON.stringify(details),
    });

    res.json({ ...calc, details });
  });

  // === STATS ===
  app.get("/api/stats", async (_req, res) => {
    const campaigns = await storage.getCampaigns();
    const donations = await storage.getDonations();
    const paidDonations = donations.filter(d => d.status === "paid");

    const totalCollected = paidDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonors = new Set(paidDonations.map(d => d.donorEmail)).size;
    const activeCampaigns = campaigns.filter(c => c.isActive).length;
    const avgDonation = paidDonations.length > 0 ? Math.round(totalCollected / paidDonations.length) : 0;

    res.json({
      totalCollected,
      totalDonors,
      activeCampaigns,
      avgDonation,
    });
  });

  // === MAYAR WEBHOOK ===
  app.post("/api/mayar/webhook", async (req, res) => {
    const payload = req.body;

    console.log("Mayar webhook received:", JSON.stringify(payload, null, 2));

    if (!payload || !payload.event) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const { event, data } = payload;

    if (event === "payment.received") {
      if (!data) {
        return res.status(400).json({ error: "Missing data in webhook payload" });
      }

      const donationId = data.extraData?.donationId;
      const campaignId = data.extraData?.campaignId;

      if (donationId) {
        await storage.updateDonationStatus(donationId, "paid");
      }

      if (campaignId && data.amount) {
        await storage.updateCampaignCollected(campaignId, data.amount);
      }

      return res.status(200).json({
        success: true,
        message: "Payment processed",
        donationId,
        campaignId,
      });
    }

    if (event === "payment.reminder") {
      console.log("Payment reminder for:", data?.customerEmail);
      return res.status(200).json({ success: true, message: "Reminder acknowledged" });
    }

    return res.status(200).json({ success: true, message: `Event ${event} acknowledged` });
  });

  return httpServer;
}
