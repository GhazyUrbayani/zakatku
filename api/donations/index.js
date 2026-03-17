import { donations, campaigns } from "../_data.js";
import { randomUUID } from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json(donations);
  }

  if (req.method === "POST") {
    const { campaignId, donorName, donorEmail, donorMobile, amount, type } = req.body;

    if (!campaignId || !donorName || !donorEmail || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const campaign = campaigns.find((c) => c.id === campaignId);
    const campaignTitle = campaign ? campaign.title : "Program Donasi ZakatKu";

    const donationId = `don-${randomUUID().slice(0, 8)}`;
    const numAmount = Number(amount);

    // ===== DEMO MODE (Mayar payment simulation) =====
    // Generates a demo invoice without calling Mayar API.
    // When Mayar account is verified, switch back to production mode.
    const invoiceId = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;

    const donation = {
      id: donationId,
      campaignId,
      donorName,
      donorEmail,
      amount: numAmount,
      type,
      status: "paid",
      paymentUrl: null,
      mayarInvoiceId: invoiceId,
    };

    // Persist in-memory so GET /api/donations and /api/stats reflect changes
    donations.push(donation);

    // Update campaign collected amount in-memory
    if (campaign) {
      campaign.collectedAmount += numAmount;
    }

    return res.status(201).json(donation);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
