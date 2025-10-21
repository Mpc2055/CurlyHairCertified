# Curly Hair Certified - Data Model Schema

## Overview

Three tables in Airtable with relationships between them. Data flows from Airtable API to the front-end map/directory.

---

## Tables & Relationships

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│   Salons    │──────<│   Stylists   │>──────│ Certifications  │
│             │  1:N  │              │  M:N  │                 │
└─────────────┘       └──────────────┘       └─────────────────┘
```

- One **Salon** can have many **Stylists**
- One **Stylist** can have multiple **Certifications**
- One **Certification** can belong to multiple **Stylists**

---

## 1. Salons Table

### Purpose
Physical locations where stylists work

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `Salon Name` | Text | ✅ | Display name |
| `Street Address` | Text | ✅ | For geocoding |
| `Suite or Unit` | Text | | Optional |
| `City` | Text | ✅ | |
| `State` | Text | ✅ | |
| `ZIP Code` | Text | ✅ | |
| `Phone Number` | Phone | | Salon's main phone |
| `Website` | URL | | |
| `Salon Photo` | Attachment | | Optional hero image |
| `Stylists` | Linked Record | | → Links to Stylists table |
| `Full Address` | Formula | | Auto-generated for display |
| `Number of Stylists` | Count | | Auto-count of linked stylists |

### Key for App
- Use full address for Google Maps geocoding
- Group stylists by salon for map pins

---

## 2. Stylists Table

### Purpose
Individual curly hair specialists

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `Stylist Name` | Text | ✅ | Display name |
| `Salon` | Linked Record | ✅ | → Links to Salons table |
| `Phone` | Phone | | Stylist's direct contact |
| `Email` | Email | | |
| `Website` | URL | | Personal site or booking page |
| `Instagram Handle` | Text | | Format: `@username` |
| `Certifications` | Linked Record | | → Links to Certifications table (multi-select) |
| `Verified` | Checkbox | | Has certification been verified? |
| `Profile Photo` | Attachment | | Headshot or work photo |
| `Online Curly Cut Booking?` | Checkbox | | Can book online? |
| `Curly Cut Price` | Currency | | Base price for curly cut |

### Key for App
- Instagram Handle → Make clickable link (strip @ if needed)
- Group by Salon for display
- Use Verified status to show badge

---

## 3. Certifications Table

### Purpose
Types of curly hair certifications/training

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `Certification Name` | Text | ✅ | e.g., "Rëzo Level 1 Cut" |
| `Certification Level` | Single Select | | Basic, Advanced, Master |
| `Issuing Organization` | Text | | e.g., "Rëzo Academy" |
| `Description` | Long Text | | What the certification covers |
| `Certification Photo` | Attachment | | Badge/logo image |
| `Stylists with Certification` | Linked Record | | → Links to Stylists table |
| `Number of Stylists` | Count | | Auto-count |
| `Certification Popularity` | Formula | | Common, Rare, etc. |

### Key for App
- Use for filter options
- Display as badges on stylist cards
- Show issuing organization as hover tooltip

---

## Data Relationships (Visual)

```
┌───────────────────────────────┐
│ Salon: "Bangz Salon"          │
│ Address: 807 Liberty St       │
│ Stylists: [6]                 │ ─┐
└───────────────────────────────┘  │
                                   │
        ┌──────────────────────────┘
        │
        ├─> ┌─────────────────────────────────────┐
        │   │ Stylist: "Tammy Allen"              │
        │   │ Salon: → Bangz Salon                │
        │   │ Instagram: @bangzsalon_rochester    │
        │   │ Certifications: → [Certified Ouidad®]│
        │   │ Price: $105                         │
        │   └─────────────────────────────────────┘
        │
        ├─> ┌─────────────────────────────────────┐
        │   │ Stylist: "Sofia Alvarez"            │
        │   │ Salon: → Bangz Salon                │
        │   │ Instagram: @sofia_alvarez_hair      │
        │   │ Certifications: → [Certified Ouidad®]│
        │   │ Price: $105                         │
        │   └─────────────────────────────────────┘
        │
        └─> ... (4 more stylists)
```

---

## API Data Flow

```
Airtable API
    ↓
Fetch 3 tables
    ↓
Transform & Merge Data
    ↓
Group Stylists by Salon
    ↓
Geocode Salon Addresses
    ↓
Render on Map + List
```

---

## Required Transformations

1. **Geocoding:** Convert salon addresses → lat/lng for map pins
2. **Grouping:** Merge stylists array into their parent salon object
3. **Certification Lookup:** Expand linked record IDs to full certification details
4. **Instagram Formatting:** Ensure handles have @ prefix for display

---

## Example JSON Structure (After Transform)

```json
{
  "salons": [
    {
      "id": "rec123",
      "name": "Bangz Salon",
      "address": "807 Liberty Street, Penfield, NY 14526",
      "lat": 43.1566,
      "lng": -77.4366,
      "phone": "585-248-8140",
      "website": "bangzsalon.com",
      "stylists": [
        {
          "id": "recABC",
          "name": "Tammy Allen",
          "instagram": "@bangzsalon_rochester",
          "photo": "url...",
          "certifications": ["Certified Ouidad®"],
          "price": 105,
          "canBookOnline": true,
          "phone": "585-248-8140",
          "email": "bangzsalonrochester@gmail.com"
        }
      ]
    }
  ]
}
```

---

## Notes for Implementation

- Salon addresses must be geocoded once and cached (don't geocode on every page load)
- Instagram handles may or may not have @ prefix in Airtable—normalize in code
- Some stylists share salon phone/email—show at salon level, not repeated per stylist
- Certifications are stored as comma-separated text in Stylists table—parse into array

---

**That's the data model.** Three simple tables with clear relationships. Ready for Replit Agent to consume via Airtable API.
