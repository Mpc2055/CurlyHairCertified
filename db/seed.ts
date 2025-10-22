import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { salons, stylists, certifications, stylistCertifications } from '@shared/schema';
import type { InsertSalon, InsertStylist, InsertCertification, InsertStylistCertification } from '@shared/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

// Helper to generate ID from name
function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

// Helper to parse price from string like "$110.00"
function parsePrice(priceStr: string | undefined): string | undefined {
  if (!priceStr) return undefined;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return cleaned || undefined;
}

// Helper to check if string is truthy checkbox value
function isChecked(value: string | undefined): boolean {
  return value === 'checked' || value === 'TRUE' || value === 'true';
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Read and parse Certifications CSV
    console.log('📖 Reading Certifications CSV...');
    const certificationsCSV = readFileSync(
      join(process.cwd(), 'attached_assets', 'Certifications-Grid view.csv'),
      'utf-8'
    );
    const certificationsData = parse(certificationsCSV, {
      columns: true,
      skip_empty_lines: true,
      bom: true, // Handle BOM
    }) as Array<{
      'Certification Name': string;
      'Certification Level': string;
      'Issuing Organization': string;
      'Description': string;
    }>;

    console.log(`Found ${certificationsData.length} certifications`);

    // Insert certifications
    const certificationRecords: InsertCertification[] = certificationsData.map((cert) => ({
      id: generateId(cert['Certification Name']),
      name: cert['Certification Name'],
      level: cert['Certification Level'] || null,
      organization: cert['Issuing Organization'] || null,
      description: cert['Description'] || null,
    }));

    await db.insert(certifications).values(certificationRecords).onConflictDoNothing();
    console.log(`✅ Inserted ${certificationRecords.length} certifications`);

    // 2. Read and parse Salons CSV
    console.log('📖 Reading Salons CSV...');
    const salonsCSV = readFileSync(
      join(process.cwd(), 'attached_assets', 'Salons-Grid view.csv'),
      'utf-8'
    );
    const salonsData = parse(salonsCSV, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    }) as Array<{
      'Salon Name': string;
      'Street Address': string;
      'Suite or Unit': string;
      'City': string;
      'State': string;
      'ZIP Code': string;
      'Phone Number': string;
      'Website': string;
      'Salon Photo': string;
      'Full Address': string;
    }>;

    console.log(`Found ${salonsData.length} salons`);

    // Insert salons (without lat/lng - will be geocoded later)
    const salonRecords: InsertSalon[] = salonsData.map((salon) => ({
      id: generateId(salon['Salon Name']),
      name: salon['Salon Name'],
      streetAddress: salon['Street Address'],
      suiteUnit: salon['Suite or Unit'] || null,
      city: salon['City'],
      state: salon['State'],
      zipCode: salon['ZIP Code'],
      phone: salon['Phone Number'] || null,
      website: salon['Website'] || null,
      photo: salon['Salon Photo'] || null,
      lat: null, // Will be geocoded
      lng: null, // Will be geocoded
      fullAddress: salon['Full Address'],
    }));

    await db.insert(salons).values(salonRecords).onConflictDoNothing();
    console.log(`✅ Inserted ${salonRecords.length} salons`);

    // 3. Read and parse Stylists CSV
    console.log('📖 Reading Stylists CSV...');
    const stylistsCSV = readFileSync(
      join(process.cwd(), 'attached_assets', 'Stylists-Grid view.csv'),
      'utf-8'
    );
    const stylistsData = parse(stylistsCSV, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    }) as Array<{
      'Stylist Name': string;
      'Salon': string;
      'Phone': string;
      'Email': string;
      'Website': string;
      'Instagram Handle': string;
      'Certifications': string;
      'Verified': string;
      'Profile Photo': string;
      'Online Curly Cut Booking?': string;
      'Curly Cut Price': string;
    }>;

    console.log(`Found ${stylistsData.length} stylists`);

    // Insert stylists
    const stylistRecords: InsertStylist[] = stylistsData.map((stylist) => ({
      id: generateId(stylist['Stylist Name']),
      name: stylist['Stylist Name'],
      salonId: generateId(stylist['Salon']),
      phone: stylist['Phone'] || null,
      email: stylist['Email'] || null,
      website: stylist['Website'] || null,
      instagram: stylist['Instagram Handle'] || null,
      verified: isChecked(stylist['Verified']),
      profilePhoto: stylist['Profile Photo'] || null,
      canBookOnline: isChecked(stylist['Online Curly Cut Booking?']),
      curlyCutPrice: parsePrice(stylist['Curly Cut Price']),
    }));

    await db.insert(stylists).values(stylistRecords).onConflictDoNothing();
    console.log(`✅ Inserted ${stylistRecords.length} stylists`);

    // 4. Create stylist-certification relationships
    console.log('🔗 Creating stylist-certification relationships...');
    const stylistCertificationRecords: InsertStylistCertification[] = [];

    for (const stylist of stylistsData) {
      const stylistId = generateId(stylist['Stylist Name']);
      const certNames = stylist['Certifications']
        ? stylist['Certifications'].split(',').map(c => c.trim())
        : [];

      for (const certName of certNames) {
        if (certName) {
          stylistCertificationRecords.push({
            stylistId,
            certificationId: generateId(certName),
          });
        }
      }
    }

    if (stylistCertificationRecords.length > 0) {
      await db.insert(stylistCertifications).values(stylistCertificationRecords).onConflictDoNothing();
      console.log(`✅ Created ${stylistCertificationRecords.length} stylist-certification relationships`);
    }

    console.log('🎉 Database seed completed successfully!');
    console.log(`
Summary:
- Certifications: ${certificationRecords.length}
- Salons: ${salonRecords.length}
- Stylists: ${stylistRecords.length}
- Stylist-Certification Links: ${stylistCertificationRecords.length}
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('✅ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
