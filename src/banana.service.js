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

// Authentic Banana API puzzle samples for offline / network timeout fallback
const OFFLINE_PUZZLES = [
  {
    question: 'https://www.sanfoh.com/uob/banana/data/t1d12974cf5ff970d3e50437818n62.png',
    solution: 2
  },
  {
    question: 'https://www.sanfoh.com/uob/banana/data/t1ec02f6a3d044617a4ec3f22b9n11.png',
    solution: 1
  },
  {
    question: 'https://www.sanfoh.com/uob/banana/data/t1fd81573c8d3fe70235a566b72n3.png',
    solution: 3
  }
];

let simulateApiFailure = false;

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
    const randomFallback = OFFLINE_PUZZLES[Math.floor(Math.random() * OFFLINE_PUZZLES.length)];
    return {
      question: randomFallback.question,
      solution: randomFallback.solution,
      source: 'offline-fallback',
      message: 'Using offline puzzle pool'
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
      const randomFallback = OFFLINE_PUZZLES[Math.floor(Math.random() * OFFLINE_PUZZLES.length)];
      return {
        question: randomFallback.question,
        solution: randomFallback.solution,
        source: 'offline-fallback',
        errorDetails: `Primary: ${primaryErr.message} | Mirror: ${mirrorErr.message}`,
        message: 'Network offline or API unreachable; cached puzzle loaded.'
      };
    }
  }
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
  PRIMARY_URL,
  MIRROR_URL
};
