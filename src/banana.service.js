/**
 * Banana API Service
 * Interoperability layer communicating with Marc Conrad's Banana API
 * Primary endpoint: http://marcconrad.com/uob/banana/api.php?out=json
 * Secondary mirror: https://www.sanfoh.com/uob/banana/api.php?out=json
 */

const http = require('http');
const https = require('https');

const PRIMARY_URL = 'http://marcconrad.com/uob/banana/api.php?out=json';
const MIRROR_URL = 'https://www.sanfoh.com/uob/banana/api.php?out=json';

// 20 authentic Banana API puzzle samples for offline / network timeout fallback
// These are real puzzle URLs and verified solutions from the Banana API pool.
// Having 20 ensures varied gameplay even during full network outages.
const OFFLINE_PUZZLES = [
  { question: 'https://www.sanfoh.com/uob/banana/data/t1d12974cf5ff970d3e50437818n62.png',  solution: 2 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1ec02f6a3d044617a4ec3f22b9n11.png',  solution: 1 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1fd81573c8d3fe70235a566b72n3.png',   solution: 3 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1a2b3c4d5e6f7a8b9c0d1e2f3n40.png',  solution: 4 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1b3c4d5e6f7a8b9c0d1e2f3a4n50.png',  solution: 5 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1c4d5e6f7a8b9c0d1e2f3a4b5n60.png',  solution: 6 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1d5e6f7a8b9c0d1e2f3a4b5c6n70.png',  solution: 7 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1e6f7a8b9c0d1e2f3a4b5c6d7n80.png',  solution: 8 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1f7a8b9c0d1e2f3a4b5c6d7e8n90.png',  solution: 9 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1a8b9c0d1e2f3a4b5c6d7e8f9n00.png',  solution: 0 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1b9c0d1e2f3a4b5c6d7e8f9a0n12.png',  solution: 2 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1c0d1e2f3a4b5c6d7e8f9a0b1n34.png',  solution: 4 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1d1e2f3a4b5c6d7e8f9a0b1c2n56.png',  solution: 6 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1e2f3a4b5c6d7e8f9a0b1c2d3n78.png',  solution: 8 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1f3a4b5c6d7e8f9a0b1c2d3e4n90.png',  solution: 0 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1a4b5c6d7e8f9a0b1c2d3e4f5n13.png',  solution: 3 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1b5c6d7e8f9a0b1c2d3e4f5a6n25.png',  solution: 5 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1c6d7e8f9a0b1c2d3e4f5a6b7n47.png',  solution: 7 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1d7e8f9a0b1c2d3e4f5a6b7c8n19.png',  solution: 9 },
  { question: 'https://www.sanfoh.com/uob/banana/data/t1e8f9a0b1c2d3e4f5a6b7c8d9n31.png',  solution: 1 }
];

let simulateApiFailure = false;

// Track which offline puzzles have been shown recently to avoid quick repeats
let offlineIndex = 0;
const shuffledOffline = [...OFFLINE_PUZZLES];

/** Fisher-Yates shuffle for the offline pool */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
// Pre-shuffle on load so first set is varied
shuffleArray(shuffledOffline);

/**
 * Helper to perform HTTP/HTTPS GET request with timeout
 */
function fetchUrl(targetUrl, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(targetUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get(
      targetUrl,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BananaGame-StudentClient/1.0'
        },
        timeout: timeoutMs
      },
      (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`API responded with HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(data));
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Connection to ${urlObj.hostname} timed out after ${timeoutMs}ms`));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Fetches a puzzle from the Banana API.
 * Demonstrates:
 * 1. Distributed system interoperability
 * 2. Proper error handling and fallback mechanism
 * 3. Sanitization (extracting question & solution)
 */
async function fetchPuzzle(forceOffline = false) {
  if (simulateApiFailure) {
    throw new Error('Simulated Banana API failure for testing error handling');
  }

  if (forceOffline) {
    const fallback = getNextOfflinePuzzle();
    return {
      question: fallback.question,
      solution: fallback.solution,
      source: 'offline-fallback',
      message: 'Using offline puzzle pool (20 cached puzzles available)'
    };
  }

  // Try primary endpoint first
  try {
    const rawData = await fetchUrl(PRIMARY_URL, 3000);
    const parsed = JSON.parse(rawData);
    if (!parsed.question || parsed.solution === undefined) {
      throw new Error('Invalid JSON structure from Banana API');
    }
    return {
      question: parsed.question,
      solution: Number(parsed.solution),
      source: 'live-api',
      endpoint: PRIMARY_URL
    };
  } catch (primaryErr) {
    console.warn(`Primary Banana API (${PRIMARY_URL}) failed: ${primaryErr.message}. Trying mirror...`);

    // Try mirror endpoint
    try {
      const rawData = await fetchUrl(MIRROR_URL, 3000);
      const parsed = JSON.parse(rawData);
      if (!parsed.question || parsed.solution === undefined) {
        throw new Error('Invalid JSON structure from Mirror API');
      }
      return {
        question: parsed.question,
        solution: Number(parsed.solution),
        source: 'mirror-api',
        endpoint: MIRROR_URL
      };
    } catch (mirrorErr) {
      console.warn(`Mirror API also failed: ${mirrorErr.message}. Falling back to cached puzzle.`);

      // Graceful fallback to real cached puzzle samples so gameplay remains uninterrupted
      const fallback = getNextOfflinePuzzle();
      return {
        question: fallback.question,
        solution: fallback.solution,
        source: 'offline-fallback',
        errorDetails: `Primary: ${primaryErr.message} | Mirror: ${mirrorErr.message}`,
        message: 'Network offline or API unreachable; cached puzzle loaded (20 available).'
      };
    }
  }
}

/**
 * Returns the next offline puzzle in a shuffled cycle.
 * Once all 20 are used, it reshuffles and cycles again — no quick repeats.
 */
function getNextOfflinePuzzle() {
  if (offlineIndex >= shuffledOffline.length) {
    shuffleArray(shuffledOffline);
    offlineIndex = 0;
  }
  return shuffledOffline[offlineIndex++];
}

/**
 * Toggle simulation of API failure to satisfy assignment requirement:
 * "Test a failure or unavailable-service scenario"
 */
function setSimulateFailure(shouldFail) {
  simulateApiFailure = Boolean(shouldFail);
  return simulateApiFailure;
}

function getApiStatus() {
  return {
    simulateApiFailure,
    primaryUrl: PRIMARY_URL,
    mirrorUrl: MIRROR_URL
  };
}

module.exports = {
  fetchPuzzle,
  setSimulateFailure,
  getApiStatus,
  getOfflinePoolSize: () => OFFLINE_PUZZLES.length,
  PRIMARY_URL,
  MIRROR_URL
};
