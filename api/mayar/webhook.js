import { donations } from "../_data.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { invoiceId, status } = req.body;

  if (!invoiceId || !status) {
    return res.status(400).json({ error: "Missing invoiceId or status" });
  }

  const donation = donations.find((d) => d.mayarInvoiceId === invoiceId);

  if (!donation) {
    return res.status(404).json({ error: "Donation not found" });
  }

  const newStatus = status === "PAID" ? "paid" : status === "FAILED" ? "failed" : "pending";

  res.status(200).json({ success: true, donationId: donation.id, newStatus });
}
