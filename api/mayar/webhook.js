// Mayar Webhook Handler
// Receives payment notifications from Mayar
//
// Mayar webhook event types:
// - payment.received: Customer has completed payment
// - payment.reminder: Customer hasn't paid after 29 minutes
//
// Webhook payload (payment.received):
// {
//   "event": "payment.received",
//   "data": {
//     "id": "...",
//     "status": true,
//     "customerName": "...",
//     "customerEmail": "...",
//     "amount": 100000,
//     "productName": "...",
//     "productType": "...",
//     "extraData": { "donationId": "...", "campaignId": "...", "donationType": "..." },
//     ...
//   }
// }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body;

  // Log webhook for debugging
  console.log("Mayar webhook received:", JSON.stringify(payload, null, 2));

  // Validate webhook payload
  if (!payload || !payload.event) {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  const { event, data } = payload;

  // Handle payment.received event
  if (event === "payment.received") {
    if (!data) {
      return res.status(400).json({ error: "Missing data in webhook payload" });
    }

    // Extract donation info from extraData
    const donationId = data.extraData?.donationId;
    const campaignId = data.extraData?.campaignId;
    const donationType = data.extraData?.donationType;

    console.log("Payment received:", {
      event,
      donationId,
      campaignId,
      donationType,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      status: data.status,
    });

    // In a real production app with a database:
    // 1. Update donation status to "paid"
    // 2. Update campaign collectedAmount
    // 3. Send thank-you email to donor
    //
    // Example:
    // await db.update(donations).set({ status: "paid" }).where(eq(donations.id, donationId));
    // await db.update(campaigns).set({
    //   collectedAmount: sql`collected_amount + ${data.amount}`
    // }).where(eq(campaigns.id, campaignId));

    // Return 200 to acknowledge receipt
    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      donationId,
      campaignId,
    });
  }

  // Handle payment.reminder event
  if (event === "payment.reminder") {
    console.log("Payment reminder:", {
      customerName: data?.customerName,
      customerEmail: data?.customerEmail,
    });

    return res.status(200).json({
      success: true,
      message: "Reminder acknowledged",
    });
  }

  // Handle other events
  console.log("Unhandled webhook event:", event);
  return res.status(200).json({
    success: true,
    message: `Event ${event} acknowledged`,
  });
}
