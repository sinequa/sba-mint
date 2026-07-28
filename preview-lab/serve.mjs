/*
 * Zero-dependency static server for preview-lab.
 *
 * The lab must be served over http (not file://) so that the iframe and the host
 * page are same-origin and the runner can read the iframe DOM. The document root
 * is the repository root, because the fixtures load the real
 * ../../src/assets/preview.{js,css}.
 *
 *   node preview-lab/serve.mjs [--port 4300] [--root .]
 *
 * When `?ci=1` is used, the lab POSTs its results to /_lab-results; standalone,
 * they are written to preview-lab/.last-run.json and summarised on stdout.
 */
import { createServer as createHttpServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { deflateSync } from "node:zlib";

const MIME = {
  ".html": "text/html; charset=utf-8",
  // Office exports use .htm, and serving those as octet-stream means the frame never
  // parses as HTML -- the document loads, has a body, and contains nothing.
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const RESULTS_PATH = "/_lab-results";
const PROFILE_PATH = "/_lab-profile";
const IMAGE_PATH = "/_lab-image";

// --- generated images -------------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/**
 * A solid-colour PNG of the requested size, built with nothing but zlib.
 *
 * Fixtures captured from converters that emit `<img>` without width/height
 * attributes need a real bitmap: the intrinsic size *is* the layout. Serving it
 * with a delay reproduces, deterministically, the late reflow such a preview goes
 * through — which is what the passage frames have to survive.
 */
function png(width, height, shade) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: truecolour
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    raw[row] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      // A faint checkerboard, so a shifted image is visible to the naked eye too.
      const tint = ((x >> 5) + (y >> 5)) % 2 ? 8 : 0;
      raw[row + 1 + x * 3] = shade - tint;
      raw[row + 2 + x * 3] = shade - tint;
      raw[row + 3 + x * 3] = shade;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function serveImage(request, response) {
  const query = new URLSearchParams(request.url.split("?")[1] || "");
  const width = Math.min(4000, Math.max(1, Number(query.get("w")) || 960));
  const height = Math.min(4000, Math.max(1, Number(query.get("h")) || 540));
  const delay = Math.min(5000, Math.max(0, Number(query.get("ms")) || 0));
  const shade = Math.min(255, Math.max(0, Number(query.get("shade")) || 232));
  const body = png(width, height, shade);
  setTimeout(() => {
    response
      .writeHead(200, {
        "content-type": "image/png",
        "content-length": body.length,
        "cache-control": "no-store"
      })
      .end(body);
  }, delay);
}

/**
 * @param {object} options
 * @param {string} options.root  document root
 * @param {(results: unknown) => void} [options.onResults] called when the lab POSTs its assertion run
 * @param {(profile: unknown) => void} [options.onProfile] called when the lab POSTs a profiling run
 */
export function createServer({ root, onResults, onProfile }) {
  const documentRoot = resolve(root);

  return createHttpServer((request, response) => {
    // Two separate paths, so an assertion run and a profiling run can never be
    // mistaken for one another by whichever runner is listening.
    const posted = request.method === "POST" ? request.url.split("?")[0] : null;
    if (posted === RESULTS_PATH || posted === PROFILE_PATH) {
      const isProfile = posted === PROFILE_PATH;
      readBody(request)
        .then(body => {
          let results = null;
          try {
            results = JSON.parse(body);
          } catch {
            results = { error: "invalid JSON", raw: body.slice(0, 500) };
          }
          response.writeHead(204).end();
          const handler = isProfile ? onProfile : onResults;
          if (handler) handler(results);
          else void writeFile(join(documentRoot, "preview-lab", isProfile ? ".last-profile.json" : ".last-run.json"), JSON.stringify(results, null, 2));
        })
        .catch(() => response.writeHead(400).end());
      return;
    }

    if (request.url.split("?")[0] === IMAGE_PATH) {
      serveImage(request, response);
      return;
    }

    void serveFile(documentRoot, request, response);
  });
}

async function serveFile(documentRoot, request, response) {
  const requested = decodeURIComponent(request.url.split("?")[0]);
  let target = resolve(join(documentRoot, normalize(requested)));

  // Never escape the document root.
  if (target !== documentRoot && !target.startsWith(documentRoot + sep)) {
    response.writeHead(403).end("forbidden");
    return;
  }

  try {
    let info = await stat(target);
    if (info.isDirectory()) {
      target = join(target, "index.html");
      info = await stat(target);
    }
    response.writeHead(200, {
      "content-type": MIME[extname(target).toLowerCase()] || "application/octet-stream",
      "content-length": info.size,
      // Fixtures are reloaded many times per run; never serve a stale copy.
      "cache-control": "no-store"
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("not found: " + requested);
  }
}

function readBody(request) {
  return new Promise((resolvePromise, rejectPromise) => {
    const chunks = [];
    request.on("data", chunk => chunks.push(chunk));
    request.on("end", () => resolvePromise(Buffer.concat(chunks).toString("utf8")));
    request.on("error", rejectPromise);
  });
}

// --- standalone -------------------------------------------------------------

function parseArgs(argv) {
  const options = { port: 4300, root: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--port") options.port = Number(argv[++i]);
    else if (argv[i] === "--root") options.root = argv[++i];
  }
  return options;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("serve.mjs")) {
  const options = parseArgs(process.argv.slice(2));
  createServer(options).listen(options.port, () => {
    process.stdout.write(`preview-lab served from ${resolve(options.root)}\n`);
    process.stdout.write(`  → http://localhost:${options.port}/preview-lab/\n`);
  });
}
