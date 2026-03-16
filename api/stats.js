import { campaigns, donations } from "./_data.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const paidDonations = donations.filter((d) => d.status === "paid");

  const totalCollected = paidDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalDonors = new Set(paidDonations.map((d) => d.donorEmail)).size;
  const activeCampaigns = campaigns.filter((c) => c.isActive).length;
  const avgDonation =
    paidDonations.length > 0
      ? Math.round(totalCollected / paidDonations.length)
      : 0;

  res.status(200).json({
    totalCollected,
    totalDonors,
    activeCampaigns,
    avgDonation,
  });
}
