const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("client source does not encode a literal credential", () => {
  const source = path.join(__dirname, "..", "src");
  const violations = [];
  for (const file of fs.readdirSync(source, { recursive: true })) {
    if (!/\.(js|jsx)$/.test(file)) continue;
    const content = fs.readFileSync(path.join(source, file), "utf8");
    if (/\bbtoa\s*\(\s*["']/.test(content)) violations.push(file);
  }
  // Report only locations, never source lines or credential values.
  assert.equal(violations.length, 0, `Embedded credential locations: ${violations.join(", ")}`);
});
