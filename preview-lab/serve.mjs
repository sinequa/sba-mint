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

const MIME = {
  ".html": "text/html; charset=utf-8",
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

/**
 * @param {object} options
 * @param {string} options.root  document root
 * @param {(results: unknown) => void} [options.onResults] called when the lab POSTs its run
 */
export function createServer({ root, onResults }) {
  const documentRoot = resolve(root);

  return createHttpServer((request, response) => {
    if (request.method === "POST" && request.url.split("?")[0] === RESULTS_PATH) {
      readBody(request)
        .then(body => {
          let results = null;
          try {
            results = JSON.parse(body);
          } catch {
            results = { error: "invalid JSON", raw: body.slice(0, 500) };
          }
          response.writeHead(204).end();
          if (onResults) onResults(results);
          else void writeFile(join(documentRoot, "preview-lab", ".last-run.json"), JSON.stringify(results, null, 2));
        })
        .catch(() => response.writeHead(400).end());
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
