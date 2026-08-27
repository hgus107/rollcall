import assert from "node:assert/strict";
import test from "node:test";
import { renameButtonLabel, summaryLabel } from "../src/presentation.ts";

test("summary explains empty, blocked, unchanged, and ready queues", () => {
  assert.equal(summaryLabel(0, 0, 0), "No Files Selected");
  assert.equal(summaryLabel(12, 8, 4), "12 Files · 4 Need Attention");
  assert.equal(summaryLabel(12, 0, 0), "12 Files · No Names Will Change");
  assert.equal(summaryLabel(12, 12, 0), "12 Files · 12 Ready To Save");
});

test("save action uses a simple label and shows busy state", () => {
  assert.equal(renameButtonLabel(1, false), "Save As");
  assert.equal(renameButtonLabel(2, false), "Save As");
  assert.equal(renameButtonLabel(2, true), "Saving…");
});
