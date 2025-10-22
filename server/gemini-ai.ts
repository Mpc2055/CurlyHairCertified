import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

// System prompt from PROMPT-ONLY.md
const SYSTEM_PROMPT = `You are an AI assistant that creates compelling 2-3 paragraph summaries (200-250 words) of hair stylists for a directory listing interface.

The directory already shows: name, salon, location, star rating, review count, price, certifications, and contact icons. Your summary adds personality and helps users understand what makes this stylist unique and who they're best suited for.

**Search Strategy:**

Conduct 4-5 targeted web searches focusing on these sources:
1. Google Business Profile and Google reviews
2. Yelp business listings and reviews
3. Instagram (search for the provided handle)
4. Facebook business pages
5. Reddit discussions (search "[stylist name] [city]" or "[salon name]")
6. Local news or blog features

Prioritize: Google/Yelp reviews > Instagram presence > Facebook > Industry directories > Reddit/Forums

**Summary Structure:**

Paragraph 1 (3-4 sentences): Professional background, certifications, years of experience (if found), what makes them unique, signature approach or philosophy

Paragraph 2 (3-4 sentences): Client experience patterns from reviews - what do clients consistently praise? Communication style, teaching approach, specific strengths

Paragraph 3 (2-3 sentences): Ideal client match and best suited for. Who should book with this stylist? What makes them stand out from competitors?

**Key Guidelines:**
- Target length: 200-250 words total
- Only include information verified through your searches
- Look for patterns across multiple reviews, not individual comments
- Use phrases like "clients consistently mention..." or "reviews frequently highlight..."
- Never use direct quotes from reviews
- If limited information found, work with certifications and be honest about growing online presence
- Explain what certifications mean (e.g., "DevaCurl certification specializes in dry-cutting technique for curls")
- Focus on differentiation - what makes THIS stylist unique?

**Tone:** Professional but approachable, scannable, distinctive, objective`;

export interface StylistData {
  name: string;
  salonName: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  price?: number;
  certifications: string[];
  googleRating?: number;
  googleReviewCount?: number;
}

export interface AISummaryResult {
  summary: string;
  sources: string; // JSON string of grounding sources
  generatedAt: Date;
}

/**
 * Generate AI summary for a stylist using Gemini 2.5 Flash with Google Search grounding
 */
export async function generateStylistSummary(stylistData: StylistData): Promise<AISummaryResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  console.log(`[gemini-ai] Generating summary for: ${stylistData.name}`);

  // Construct user prompt from template
  const userPrompt = `Generate an AI summary for this stylist:

Name: ${stylistData.name}
Business: ${stylistData.salonName}
Location: ${stylistData.city}, ${stylistData.state}
Phone: ${stylistData.phone || 'Not available'}
Email: ${stylistData.email || 'Not available'}
Website: ${stylistData.website || 'Not available'}
Instagram: ${stylistData.instagram || 'Not available'}
Price: ${stylistData.price ? `$${stylistData.price} for curly cut` : 'Not specified'}
Certifications: ${stylistData.certifications.length > 0 ? stylistData.certifications.join(', ') : 'Not specified'}
Star Rating: ${stylistData.googleRating ? stylistData.googleRating.toFixed(1) : 'Not rated'}
Review Count: ${stylistData.googleReviewCount || 0}

Search for information about this stylist focusing on Google/Yelp reviews, Instagram, Facebook, and any Reddit discussions or local features. Generate a 2-3 paragraph AI summary (200-250 words) following your instructions.`;

  try {
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    // Combine system prompt and user prompt into a single prompt
    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: fullPrompt, // Simple string format as per official docs
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 8192, // Very high to accommodate thinking tokens + output
        temperature: 0.7, // Some creativity but still factual
        // Thinking budget to limit internal reasoning tokens
        thinkingConfig: {
          thinkingBudget: 2048, // Limit thinking tokens to leave room for output
        },
      },
    });

    // Extract text from response
    const summary = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text) || '';
    const finishReason = response.candidates?.[0]?.finishReason;

    console.log(`[gemini-ai] Generated summary: ${summary.length} characters`);
    if (finishReason === 'MAX_TOKENS') {
      console.warn(`[gemini-ai] WARNING: Response was truncated due to MAX_TOKENS. Consider increasing maxOutputTokens.`);
    }
    if (summary.length > 0) {
      console.log(`[gemini-ai] Preview: ${summary.substring(0, 150)}...`);
    }

    // Extract grounding metadata
    const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata || {};
    const webSearchQueries = groundingMetadata.webSearchQueries || [];
    const groundingSupports = groundingMetadata.groundingSupports || [];

    const sources = JSON.stringify({
      searchQueries: webSearchQueries.filter((q: string) => q && q.trim().length > 0), // Filter empty queries
      groundingSupportsCount: groundingSupports.length,
      generatedAt: new Date().toISOString(),
    });

    console.log(`[gemini-ai] Summary generated successfully for ${stylistData.name}`);
    console.log(`[gemini-ai] Grounding: ${webSearchQueries.filter((q: string) => q && q.trim()).length} search queries, ${groundingSupports.length} grounding supports`);

    return {
      summary: summary.trim(),
      sources,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error(`[gemini-ai] Error generating summary for ${stylistData.name}:`, error);
    throw new Error(`Failed to generate AI summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate that a summary meets the quality requirements
 */
export function validateSummary(summary: string): { valid: boolean; reason?: string } {
  const wordCount = summary.split(/\s+/).length;

  if (wordCount < 150) {
    return { valid: false, reason: 'Summary too short (< 150 words)' };
  }

  if (wordCount > 350) {
    return { valid: false, reason: 'Summary too long (> 350 words)' };
  }

  if (summary.length < 50) {
    return { valid: false, reason: 'Summary content too brief' };
  }

  return { valid: true };
}
