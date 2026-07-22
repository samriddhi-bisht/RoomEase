const { createWorker } = require('tesseract.js');

// Tesseract.js spins up a whole recognition engine per call, which is heavy
// — this is exactly the kind of blocking, CPU-bound work that should never
// run directly inside a request handler on Node's single event-loop thread
// in a production system (it'd stall every other request). We call it from
// kycService in a fire-and-await way here for simplicity, but the honest
// note for the README is: a real deployment would offload this to a queue
// or worker process instead.
async function extractText(imagePath) {
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(imagePath);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

// Rough heuristic: look for a date-shaped substring (dd/mm/yyyy etc). Good
// enough to flag a scan where nothing date-like was read at all; not a
// real ID-parsing library.
function extractDob(text) {
  const match = text.match(/(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/);
  return match ? match[0] : null;
}

module.exports = { extractText, extractDob };
