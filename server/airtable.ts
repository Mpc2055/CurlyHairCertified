import Airtable from "airtable";
import { Certification, Stylist, Salon } from "@shared/schema";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

interface AirtableCertification {
  id: string;
  fields: {
    "Certification Name": string;
    "Certification Level"?: string;
    "Issuing Organization"?: string;
    Description?: string;
  };
}

interface AirtableStylist {
  id: string;
  fields: {
    "Stylist Name": string;
    Salon?: string[];
    Phone?: string;
    Email?: string;
    Website?: string;
    "Instagram Handle"?: string;
    Certifications?: string[];
    Verified?: boolean;
    "Profile Photo"?: Array<{ url: string }>;
    "Online Curly Cut Booking?"?: boolean;
    "Curly Cut Price"?: number;
  };
}

interface AirtableSalon {
  id: string;
  fields: {
    "Salon Name": string;
    "Street Address": string;
    "Suite or Unit"?: string;
    City: string;
    State: string;
    "ZIP Code": string;
    "Phone Number"?: string;
    Website?: string;
    "Salon Photo"?: Array<{ url: string }>;
  };
}

export async function fetchCertifications(): Promise<Map<string, Certification>> {
  const certMap = new Map<string, Certification>();

  const records = await base<AirtableCertification>("Certifications")
    .select()
    .all();

  records.forEach((record) => {
    const cert: Certification = {
      id: record.id,
      name: record.fields["Certification Name"],
      level: record.fields["Certification Level"],
      organization: record.fields["Issuing Organization"],
      description: record.fields.Description,
    };
    certMap.set(record.id, cert);
  });

  return certMap;
}

export async function fetchStylists(
  certMap: Map<string, Certification>
): Promise<Map<string, Stylist[]>> {
  const stylistsBySalon = new Map<string, Stylist[]>();

  const records = await base<AirtableStylist>("Stylists").select().all();

  records.forEach((record) => {
    const fields = record.fields;
    
    // Get certifications for this stylist
    const certifications: Certification[] = [];
    if (fields.Certifications) {
      fields.Certifications.forEach((certId) => {
        const cert = certMap.get(certId);
        if (cert) certifications.push(cert);
      });
    }

    // Normalize Instagram handle
    let instagram = fields["Instagram Handle"];
    if (instagram && !instagram.startsWith("@")) {
      instagram = `@${instagram}`;
    }

    const stylist: Stylist = {
      id: record.id,
      name: fields["Stylist Name"],
      phone: fields.Phone,
      email: fields.Email,
      website: fields.Website,
      instagram,
      photo: fields["Profile Photo"]?.[0]?.url,
      verified: fields.Verified || false,
      canBookOnline: fields["Online Curly Cut Booking?"] || false,
      price: fields["Curly Cut Price"],
      certifications,
    };

    // Group by salon (use first salon if multiple)
    const salonId = fields.Salon?.[0];
    if (salonId) {
      if (!stylistsBySalon.has(salonId)) {
        stylistsBySalon.set(salonId, []);
      }
      stylistsBySalon.get(salonId)!.push(stylist);
    }
  });

  return stylistsBySalon;
}

export async function fetchSalons(): Promise<AirtableSalon[]> {
  const records = await base<AirtableSalon>("Salons").select().all();
  return records.map((record) => ({
    id: record.id,
    fields: record.fields,
  }));
}
