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
    const { campaignId, donorName, donorEmail, amount, type } = req.body;

    if (!campaignId || !donorName || !donorEmail || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const campaign = campaigns.find((c) => c.id === campaignId);
    const campaignTitle = campaign ? campaign.title : "Program Donasi ZakatKu";

    const donationId = `don-${randomUUID().slice(0, 8)}`;
    const numAmount = Number(amount);

    // ===== MAYAR PAYMENT INTEGRATION =====
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;

    if (MAYAR_API_KEY) {
      // Production mode: call Mayar API to create invoice
      try {
        const expiredAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();

        const mayarPayload = {
          name: donorName,
          email: donorEmail,
          description: `${type === "zakat_maal" ? "Zakat Maal" : type === "zakat_penghasilan" ? "Zakat Penghasilan" : type === "infaq" ? "Infaq" : "Sedekah"} - ${campaignTitle} | ZakatKu`,
          expiredAt,
          redirectUrl: `${req.headers.origin || req.headers.referer || "https://zakatku-mayar.vercel.app"}/#/dashboard`,
          items: [
            {
              quantity: 1,
              rate: numAmount,
              description: `Donasi ${campaignTitle}`,
            },
          ],
          extraData: {
            donationId,
            campaignId,
            donationType: type,
          },
        };

        // Add mobile if available (optional in our form)
        if (req.body.donorMobile) {
          mayarPayload.mobile = req.body.donorMobile;
        }

        const mayarResponse = await fetch(
          "https://api.mayar.id/hl/v1/invoice/create",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${MAYAR_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mayarPayload),
          }
        );

        const mayarData = await mayarResponse.json();

        if (mayarData.statusCode === 200 && mayarData.data) {
          const donation = {
            id: donationId,
            campaignId,
            donorName,
            donorEmail,
            amount: numAmount,
            type,
            status: "pending",
            paymentUrl: mayarData.data.link,
            mayarInvoiceId: mayarData.data.id,
          };

          return res.status(201).json(donation);
        } else {
          // Mayar API returned an error - log and fallback to demo mode
          console.error("Mayar API error:", mayarData);
          return res.status(502).json({
            error: "Gagal membuat invoice Mayar",
            detail: mayarData.messages || "Unknown error",
          });
        }
      } catch (error) {
        console.error("Mayar API call failed:", error);
        return res.status(502).json({
          error: "Gagal menghubungi Mayar API",
          detail: error.message,
        });
      }
    } else {
      // Demo mode: no Mayar API key configured
      const invoiceId = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
      const paymentUrl = `https://mayar.id/pay/demo-${invoiceId}`;

      const donation = {
        id: donationId,
        campaignId,
        donorName,
        donorEmail,
        amount: numAmount,
        type,
        status: "pending",
        paymentUrl,
        mayarInvoiceId: invoiceId,
      };

      return res.status(201).json(donation);
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
