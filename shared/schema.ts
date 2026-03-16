import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "pendidikan", "kesehatan", "ekonomi", "bencana"
  targetAmount: integer("target_amount").notNull(),
  collectedAmount: integer("collected_amount").notNull().default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
});

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "zakat_maal", "zakat_penghasilan", "infaq", "sedekah"
  status: text("status").notNull().default("pending"), // "pending", "paid", "failed"
  paymentUrl: text("payment_url"),
  mayarInvoiceId: text("mayar_invoice_id"),
});

export const zakatCalculations = pgTable("zakat_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  totalAssets: real("total_assets").notNull(),
  zakatAmount: real("zakat_amount").notNull(),
  details: text("details").notNull(), // JSON string with breakdown
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, collectedAmount: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, status: true, paymentUrl: true, mayarInvoiceId: true });
export const insertZakatCalcSchema = createInsertSchema(zakatCalculations).omit({ id: true });

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type ZakatCalculation = typeof zakatCalculations.$inferSelect;
export type InsertZakatCalc = z.infer<typeof insertZakatCalcSchema>;
