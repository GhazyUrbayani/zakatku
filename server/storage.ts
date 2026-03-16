import {
  type Campaign, type InsertCampaign,
  type Donation, type InsertDonation,
  type ZakatCalculation, type InsertZakatCalc,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignCollected(id: string, amount: number): Promise<Campaign | undefined>;

  getDonations(): Promise<Donation[]>;
  getDonationsByCampaign(campaignId: string): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonationStatus(id: string, status: string, paymentUrl?: string, mayarInvoiceId?: string): Promise<Donation | undefined>;

  createZakatCalculation(calc: InsertZakatCalc): Promise<ZakatCalculation>;
  getZakatCalculations(): Promise<ZakatCalculation[]>;
}

export class MemStorage implements IStorage {
  private campaigns: Map<string, Campaign>;
  private donations: Map<string, Donation>;
  private zakatCalculations: Map<string, ZakatCalculation>;

  constructor() {
    this.campaigns = new Map();
    this.donations = new Map();
    this.zakatCalculations = new Map();
    this.seed();
  }

  private seed() {
    const seedCampaigns: Campaign[] = [
      {
        id: "camp-1",
        title: "Beasiswa Yatim Ramadhan",
        description: "Program beasiswa pendidikan untuk 200 anak yatim di seluruh Indonesia. Bantu mereka meraih cita-cita melalui pendidikan berkualitas di bulan penuh berkah ini.",
        category: "pendidikan",
        targetAmount: 50000000,
        collectedAmount: 32500000,
        imageUrl: null,
        isActive: true,
      },
      {
        id: "camp-2",
        title: "Operasi Katarak Gratis",
        description: "Membantu 500 lansia penderita katarak mendapatkan operasi gratis agar bisa kembali melihat dunia. Program ini bekerja sama dengan rumah sakit mata terkemuka.",
        category: "kesehatan",
        targetAmount: 100000000,
        collectedAmount: 67000000,
        imageUrl: null,
        isActive: true,
      },
      {
        id: "camp-3",
        title: "Modal UMKM Mustahik",
        description: "Memberikan modal usaha kepada 100 mustahik agar bisa mandiri secara ekonomi. Setiap penerima mendapat pelatihan bisnis dan pendampingan selama 6 bulan.",
        category: "ekonomi",
        targetAmount: 75000000,
        collectedAmount: 45000000,
        imageUrl: null,
        isActive: true,
      },
      {
        id: "camp-4",
        title: "Bantuan Bencana Banjir",
        description: "Tanggap darurat untuk korban banjir di Kalimantan Selatan. Dana digunakan untuk logistik, evakuasi, dan pembangunan kembali rumah warga terdampak.",
        category: "bencana",
        targetAmount: 200000000,
        collectedAmount: 128000000,
        imageUrl: null,
        isActive: true,
      },
      {
        id: "camp-5",
        title: "Pembangunan Masjid Dhuafa",
        description: "Membangun masjid layak di 5 desa terpencil yang belum memiliki tempat ibadah memadai. Masjid juga akan berfungsi sebagai pusat kegiatan warga.",
        category: "pendidikan",
        targetAmount: 150000000,
        collectedAmount: 89000000,
        imageUrl: null,
        isActive: true,
      },
      {
        id: "camp-6",
        title: "Paket Sembako Ramadhan",
        description: "Distribusi 10.000 paket sembako untuk keluarga kurang mampu selama bulan Ramadhan. Setiap paket berisi beras, minyak, gula, dan kebutuhan pokok lainnya.",
        category: "ekonomi",
        targetAmount: 30000000,
        collectedAmount: 21000000,
        imageUrl: null,
        isActive: true,
      },
    ];

    for (const c of seedCampaigns) {
      this.campaigns.set(c.id, c);
    }

    // Seed some demo donations
    const seedDonations: Donation[] = [
      { id: "don-1", campaignId: "camp-1", donorName: "Ahmad Fauzi", donorEmail: "ahmad@email.com", amount: 500000, type: "zakat_maal", status: "paid", paymentUrl: null, mayarInvoiceId: null },
      { id: "don-2", campaignId: "camp-2", donorName: "Siti Nurhaliza", donorEmail: "siti@email.com", amount: 1000000, type: "infaq", status: "paid", paymentUrl: null, mayarInvoiceId: null },
      { id: "don-3", campaignId: "camp-3", donorName: "Budi Santoso", donorEmail: "budi@email.com", amount: 250000, type: "sedekah", status: "paid", paymentUrl: null, mayarInvoiceId: null },
      { id: "don-4", campaignId: "camp-4", donorName: "Dewi Kartika", donorEmail: "dewi@email.com", amount: 2000000, type: "zakat_penghasilan", status: "paid", paymentUrl: null, mayarInvoiceId: null },
      { id: "don-5", campaignId: "camp-1", donorName: "Rafi Pratama", donorEmail: "rafi@email.com", amount: 750000, type: "zakat_maal", status: "paid", paymentUrl: null, mayarInvoiceId: null },
      { id: "don-6", campaignId: "camp-6", donorName: "Aisyah Rahman", donorEmail: "aisyah@email.com", amount: 300000, type: "sedekah", status: "pending", paymentUrl: "https://mayar.id/pay/demo-inv-6", mayarInvoiceId: "inv-6" },
      { id: "don-7", campaignId: "camp-2", donorName: "Hasan Abdullah", donorEmail: "hasan@email.com", amount: 1500000, type: "zakat_maal", status: "paid", paymentUrl: null, mayarInvoiceId: null },
      { id: "don-8", campaignId: "camp-5", donorName: "Fatimah Zahra", donorEmail: "fatimah@email.com", amount: 5000000, type: "infaq", status: "paid", paymentUrl: null, mayarInvoiceId: null },
    ];

    for (const d of seedDonations) {
      this.donations.set(d.id, d);
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insert: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = { ...insert, id, collectedAmount: 0, imageUrl: insert.imageUrl ?? null, isActive: insert.isActive ?? true };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaignCollected(id: string, amount: number): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    campaign.collectedAmount += amount;
    return campaign;
  }

  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(d => d.campaignId === campaignId);
  }

  async createDonation(insert: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const donation: Donation = {
      ...insert,
      id,
      status: "pending",
      paymentUrl: null,
      mayarInvoiceId: null,
    };
    this.donations.set(id, donation);
    return donation;
  }

  async updateDonationStatus(id: string, status: string, paymentUrl?: string, mayarInvoiceId?: string): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) return undefined;
    donation.status = status;
    if (paymentUrl) donation.paymentUrl = paymentUrl;
    if (mayarInvoiceId) donation.mayarInvoiceId = mayarInvoiceId;
    return donation;
  }

  async createZakatCalculation(insert: InsertZakatCalc): Promise<ZakatCalculation> {
    const id = randomUUID();
    const calc: ZakatCalculation = { ...insert, id };
    this.zakatCalculations.set(id, calc);
    return calc;
  }

  async getZakatCalculations(): Promise<ZakatCalculation[]> {
    return Array.from(this.zakatCalculations.values());
  }
}

export const storage = new MemStorage();
