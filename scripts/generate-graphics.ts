#!/usr/bin/env tsx

/**
 * Graphics Generation Utility for Curly Hair Certified
 *
 * Automatically generates custom graphics using Gemini 2.5 Flash Image API
 * by parsing prompt markdown files and creating images in the appropriate directories.
 *
 * Usage:
 *   npm run generate-graphics -- --all                              # Generate all graphics
 *   npm run generate-graphics -- --category hero                    # Generate hero graphics only
 *   npm run generate-graphics -- --graphics 1,2,3                   # Generate specific graphics
 *   npm run generate-graphics -- --dry-run                          # Preview without generating
 *   npm run generate-graphics -- --force                            # Overwrite existing files
 *   npm run generate-graphics -- --prompt-file logo-prompts.md      # Use custom prompt file
 *
 * Environment:
 *   GEMINI_API_KEY - Required: Your Gemini API key
 */

import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import { readFile, writeFile, mkdir, access, constants } from 'fs/promises';
import { resolve, dirname, basename, extname } from 'path';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Gemini API settings
  model: 'gemini-2.5-flash-image',
  responseModalities: ['IMAGE', 'TEXT'] as const,

  // Rate limiting (milliseconds between API calls)
  rateLimitDelay: 2000, // 2 seconds between calls

  // Retry settings
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds

  // Paths (defaults - can be overridden via CLI)
  defaultPromptsFile: 'graphics-prompts.md',
  baseOutputDir: resolve(process.cwd(), 'client/public'),
};

// ============================================================================
// Types
// ============================================================================

interface GraphicDefinition {
  number: number;
  title: string;
  purpose: string;
  location: string;
  prompt: string;
  category: string;
  fileName: string;
}

interface GenerationOptions {
  all?: boolean;
  category?: string;
  graphics?: number[];
  dryRun?: boolean;
  force?: boolean;
  promptFile?: string;
}

// ============================================================================
// Markdown Parser
// ============================================================================

/**
 * Parse a prompt markdown file to extract all graphic definitions
 */
async function parseGraphicsPrompts(promptFilePath: string): Promise<GraphicDefinition[]> {
  const content = await readFile(promptFilePath, 'utf-8');
  const graphics: GraphicDefinition[] = [];

  // Regular expression to match graphic sections
  // Looks for: ### NUMBER. Title
  const sectionRegex = /^### (\d+)\. (.+)$/gm;

  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const number = parseInt(match[1], 10);
    const title = match[2].trim();
    const sectionStart = match.index;

    // Find the next section or end of file
    const nextMatch = sectionRegex.exec(content);
    const sectionEnd = nextMatch ? nextMatch.index : content.length;

    // Reset regex for next iteration
    sectionRegex.lastIndex = sectionEnd;

    // Extract section content
    const sectionContent = content.slice(sectionStart, sectionEnd);

    // Extract purpose
    const purposeMatch = sectionContent.match(/\*\*Purpose:\*\* (.+)/);
    const purpose = purposeMatch ? purposeMatch[1].trim() : '';

    // Extract location
    const locationMatch = sectionContent.match(/\*\*Location:\*\* `(.+)`/);
    const location = locationMatch ? locationMatch[1].trim() : '';

    // Extract prompt (content between triple backticks after "**Prompt:**")
    const promptMatch = sectionContent.match(/\*\*Prompt:\*\*\s*```\s*([\s\S]*?)```/);
    const prompt = promptMatch ? promptMatch[1].trim() : '';

    // Skip if we couldn't extract essential info
    if (!location || !prompt) {
      console.warn(`⚠️  Skipping graphic ${number} (${title}) - missing location or prompt`);
      continue;
    }

    // Determine category from location path
    const pathParts = location.split('/');
    const category = pathParts[pathParts.length - 2] || 'unknown';
    const fileName = pathParts[pathParts.length - 1] || '';

    graphics.push({
      number,
      title,
      purpose,
      location,
      prompt,
      category,
      fileName,
    });
  }

  return graphics;
}

// ============================================================================
// File System Utilities
// ============================================================================

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists, create if not
 */
async function ensureDirectory(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
}

/**
 * Save binary file to disk
 */
async function saveBinaryFile(filePath: string, content: Buffer): Promise<void> {
  await ensureDirectory(filePath);
  await writeFile(filePath, content);
  console.log(`   ✅ Saved: ${filePath}`);
}

// ============================================================================
// Gemini API
// ============================================================================

/**
 * Generate image using Gemini API
 */
async function generateImage(
  ai: GoogleGenAI,
  graphic: GraphicDefinition,
  attempt = 1
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    console.log(`   🎨 Generating image (attempt ${attempt}/${CONFIG.maxRetries})...`);

    const config = {
      responseModalities: CONFIG.responseModalities,
    };

    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: graphic.prompt,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model: CONFIG.model,
      config,
      contents,
    });

    // Collect image data from stream
    for await (const chunk of response) {
      if (!chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        // Text response, log it
        if (chunk.text) {
          console.log(`   💬 API: ${chunk.text}`);
        }
        continue;
      }

      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      if (inlineData.data && inlineData.mimeType) {
        const buffer = Buffer.from(inlineData.data, 'base64');
        return {
          buffer,
          mimeType: inlineData.mimeType,
        };
      }
    }

    // No image data received
    throw new Error('No image data received from API');

  } catch (error) {
    console.error(`   ❌ Error generating image: ${error}`);

    // Retry if we haven't exceeded max retries
    if (attempt < CONFIG.maxRetries) {
      console.log(`   ⏳ Retrying in ${CONFIG.retryDelay / 1000} seconds...`);
      await sleep(CONFIG.retryDelay);
      return generateImage(ai, graphic, attempt + 1);
    }

    return null;
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Main Generation Logic
// ============================================================================

/**
 * Generate a single graphic
 */
async function generateSingleGraphic(
  ai: GoogleGenAI,
  graphic: GraphicDefinition,
  options: GenerationOptions
): Promise<boolean> {
  console.log(`\n📝 [${graphic.number}] ${graphic.title}`);
  console.log(`   Category: ${graphic.category}`);
  console.log(`   Output: ${graphic.location}`);

  if (options.dryRun) {
    console.log(`   🔍 DRY RUN - Would generate this image`);
    return true;
  }

  // Check if file exists
  const outputPath = resolve(process.cwd(), graphic.location.replace(/^\//, ''));
  const exists = await fileExists(outputPath);

  if (exists && !options.force) {
    console.log(`   ⏭️  File exists, skipping (use --force to overwrite)`);
    return true;
  }

  // Generate image
  const result = await generateImage(ai, graphic);

  if (!result) {
    console.error(`   ❌ Failed to generate after ${CONFIG.maxRetries} attempts`);
    return false;
  }

  // Determine file extension
  const requestedExt = extname(graphic.fileName).toLowerCase();
  const generatedExt = mime.getExtension(result.mimeType) || '';

  // Save with the correct extension
  let finalPath = outputPath;
  if (requestedExt && generatedExt && requestedExt !== `.${generatedExt}`) {
    console.log(`   ℹ️  Note: Requested ${requestedExt}, got .${generatedExt}`);
    finalPath = outputPath.replace(new RegExp(`${requestedExt}$`), `.${generatedExt}`);
  }

  await saveBinaryFile(finalPath, result.buffer);

  // Rate limiting
  console.log(`   ⏳ Waiting ${CONFIG.rateLimitDelay / 1000}s before next generation...`);
  await sleep(CONFIG.rateLimitDelay);

  return true;
}

/**
 * Filter graphics based on options
 */
function filterGraphics(
  allGraphics: GraphicDefinition[],
  options: GenerationOptions
): GraphicDefinition[] {
  if (options.graphics && options.graphics.length > 0) {
    return allGraphics.filter(g => options.graphics!.includes(g.number));
  }

  if (options.category) {
    return allGraphics.filter(g => g.category === options.category);
  }

  if (options.all) {
    return allGraphics;
  }

  return [];
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎨 Curly Hair Certified - Graphics Generation Utility\n');

  // Parse command line arguments
  const args = process.argv.slice(2);

  // Helper function to get argument value
  const getArgValue = (flag: string): string | undefined => {
    const equalSignArg = args.find(arg => arg.startsWith(`${flag}=`));
    if (equalSignArg) {
      return equalSignArg.split('=')[1];
    }
    const flagIndex = args.indexOf(flag);
    if (flagIndex !== -1 && flagIndex + 1 < args.length) {
      const nextArg = args[flagIndex + 1];
      // Make sure next arg is not another flag
      if (!nextArg.startsWith('--')) {
        return nextArg;
      }
    }
    return undefined;
  };

  const options: GenerationOptions = {
    all: args.includes('--all'),
    category: getArgValue('--category'),
    graphics: getArgValue('--graphics')?.split(',').map(Number).filter(n => !isNaN(n)),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    promptFile: getArgValue('--prompt-file') || CONFIG.defaultPromptsFile,
  };

  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    console.error('Please set your Gemini API key in Replit Secrets or .env file');
    process.exit(1);
  }

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Resolve prompt file path
  const promptFilePath = resolve(process.cwd(), options.promptFile!);

  // Validate prompt file exists
  try {
    await access(promptFilePath, constants.F_OK);
  } catch {
    console.error(`❌ Error: Prompt file not found: ${options.promptFile}`);
    console.error(`   Looked in: ${promptFilePath}`);
    console.error('\nAvailable prompt files:');
    console.error('  - graphics-prompts.md (default)');
    console.error('  - logo-prompts.md');
    process.exit(1);
  }

  // Parse graphics prompts
  console.log(`📖 Parsing ${options.promptFile}...\n`);
  const allGraphics = await parseGraphicsPrompts(promptFilePath);
  console.log(`✅ Found ${allGraphics.length} graphic definitions\n`);

  // Filter based on options
  const graphicsToGenerate = filterGraphics(allGraphics, options);

  if (graphicsToGenerate.length === 0) {
    console.log('ℹ️  No graphics selected to generate.');
    console.log('\nUsage:');
    console.log('  --all                    Generate all graphics');
    console.log('  --category <name>        Generate graphics in a category');
    console.log('  --graphics <1,2,3>       Generate specific graphics by number');
    console.log('  --prompt-file <file>     Use custom prompt file (default: graphics-prompts.md)');
    console.log('  --dry-run                Preview without generating');
    console.log('  --force                  Overwrite existing files');
    console.log(`\nCurrent prompt file: ${options.promptFile}`);
    console.log('\nAvailable categories:');
    const categories = [...new Set(allGraphics.map(g => g.category))];
    categories.forEach(cat => {
      const count = allGraphics.filter(g => g.category === cat).length;
      console.log(`  - ${cat} (${count} graphics)`);
    });
    process.exit(0);
  }

  console.log(`🚀 Generating ${graphicsToGenerate.length} graphic(s)...\n`);
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be created\n');
  }

  // Generate each graphic
  let successCount = 0;
  let failCount = 0;

  for (const graphic of graphicsToGenerate) {
    const success = await generateSingleGraphic(ai, graphic, options);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Generation Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Total: ${graphicsToGenerate.length}`);
  console.log('='.repeat(60) + '\n');

  if (failCount > 0) {
    console.log('⚠️  Some graphics failed to generate. Check errors above.');
    process.exit(1);
  }

  console.log('✨ All graphics generated successfully!\n');
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
