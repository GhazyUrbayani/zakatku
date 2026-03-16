import { donations } from "../_data.js";
import { randomUUID } from "crypto";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json(donations);
  }

  if (req.method === "POST") {
    const { campaignId, donorName, donorEmail, amount, type } = req.body;

    if (!campaignId || !donorName || !donorEmail || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = `don-${randomUUID().slice(0, 8)}`;
    const invoiceId = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
    const paymentUrl = `https://mayar.id/pay/demo-${invoiceId}`;

    const donation = {
      id,
      campaignId,
      donorName,
      donorEmail,
      amount: Number(amount),
      type,
      status: "pending",
      paymentUrl,
      mayarInvoiceId: invoiceId,
    };

    return res.status(201).json(donation);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
