/**
 * seedMarcCache.js — Fetches and persists 20 authentic puzzles directly
 * from Marc Conrad's Banana API into src/data/marc_cache.json.
 * Run with: node src/scripts/seedMarcCache.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PRIMARY_URL = 'https://www.sanfoh.com/uob/banana/api.php?out=json';
const MIRROR_URL = 'http://marcconrad.com/uob/banana/api.php?out=json';
const CACHE_FILE = path.join(__dirname, '../data/marc_cache.json');
const TARGET_COUNT = 20;

function fetchUrl(targetUrl, timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(targetUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get(
      targetUrl,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BananaGame-SeedScript/2.0'
        },
        timeout: timeoutMs
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          return resolve(fetchUrl(redirectUrl, timeoutMs));
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve(body));
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timed out after ${timeoutMs}ms`));
    });

    req.on('error', err => reject(err));
  });
}

function fetchImageAsDataUri(imageUrl, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(imageUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get(
      imageUrl,
      {
        headers: {
          'User-Agent': 'BananaGame-SeedScript/2.0',
          'Accept': 'image/png,image/jpeg,image/*,*/*'
        },
        timeout: timeoutMs
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, imageUrl).href;
          return resolve(fetchImageAsDataUri(redirectUrl, timeoutMs));
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Image HTTP ${res.statusCode}: ${res.statusMessage}`));
        }

        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length < 50) {
            return reject(new Error('Image payload too small.'));
          }
          const contentType = res.headers['content-type'] || 'image/png';
          resolve(`data:${contentType};base64,${buffer.toString('base64')}`);
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Image fetch timed out after ${timeoutMs}ms`));
    });

    req.on('error', err => reject(err));
  });
}

async function seedCache() {
  console.log('====================================================');
  console.log('🍌 Seeding Authentic Marc Conrad Banana API Cache');
  console.log(`🎯 Target: ${TARGET_COUNT} Verified Puzzles`);
  console.log(`📁 Destination: ${CACHE_FILE}`);
  console.log('====================================================');

  let cache = [];
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (Array.isArray(existing)) {
        cache = existing;
        console.log(`Found ${cache.length} previously cached puzzles on disk.`);
      }
    } catch {
      cache = [];
    }
  }

  let attempts = 0;
  const maxAttempts = TARGET_COUNT * 3;

  while (cache.length < TARGET_COUNT && attempts < maxAttempts) {
    attempts++;
    process.stdout.write(`Fetching puzzle #${cache.length + 1}... `);

    try {
      let raw;
      try {
        raw = await fetchUrl(PRIMARY_URL);
      } catch (e) {
        raw = await fetchUrl(MIRROR_URL);
      }

      const parsed = JSON.parse(raw);
      if (!parsed.question || parsed.solution === undefined) {
        throw new Error('Malformed payload from Marc Conrad API.');
      }

      const solution = Number(parsed.solution);
      const dataUri = await fetchImageAsDataUri(parsed.question);

      const exists = cache.some(p => p.solution === solution && p.question === dataUri);
      if (!exists) {
        cache.push({
          question: dataUri,
          solution,
          cachedAt: new Date().toISOString()
        });
        console.log(`Done! (Solution: ${solution}) [${cache.length}/${TARGET_COUNT}]`);
      } else {
        console.log(`Duplicate skipped.`);
      }

      // Small pause between queries to be respectful to Marc's server
      await new Promise(r => setTimeout(r, 350));
    } catch (err) {
      console.log(`Failed (${err.message}). Retrying...`);
      await new Promise(r => setTimeout(r, 600));
    }
  }

  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');

  console.log('====================================================');
  console.log(`✅ Successfully saved ${cache.length} authentic Marc Conrad Banana API puzzles to cache.`);
  console.log('====================================================');
}

seedCache().catch(err => {
  console.error('Fatal error during cache seeding:', err);
  process.exit(1);
});

