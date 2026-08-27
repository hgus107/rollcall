import assert from "node:assert/strict";
import test from "node:test";
import { previewBrowserRename } from "../src/browser-preview.ts";
import { buildRenameRules } from "../src/rule-builder.ts";

const baseInputs = {
  prefix: "Holiday-",
  suffix: "",
  find: "IMG_",
  replace: "Photo-",
  useRegex: false,
  caseStyle: "title",
  counterStart: 1,
  counterPadding: 3,
  numberPosition: "end",
  datePosition: "beginning",
  dateSource: "today",
  dateFormat: "yyyy-mm-dd",
};

test("positive: browser file selection previews Add Text and preserves extensions", () => {
  const preview = previewBrowserRename(
    [{ path: "Photos/IMG_1001.JPG", name: "IMG_1001.JPG" }],
    buildRenameRules("add-text", baseInputs),
  );
  assert.equal(preview.items[0].proposedName, "Holiday-IMG_1001.JPG");
  assert.equal(preview.items[0].target, "Photos/Holiday-IMG_1001.JPG");
  assert.equal(preview.changed, 1);
  assert.equal(preview.ready, true);
});

test("negative: duplicate targets and reserved names block a batch", () => {
  const duplicate = previewBrowserRename(
    [
      { path: "one.txt", name: "one.txt" },
      { path: "two.txt", name: "two.txt" },
    ],
    { ...buildRenameRules("add-text", baseInputs), template: "same" },
  );
  assert.equal(duplicate.conflicts, 2);
  assert.equal(duplicate.ready, false);

  const acrossFolders = previewBrowserRename(
    [
      { path: "one/report.txt", name: "report.txt" },
      { path: "two/report.txt", name: "report.txt" },
    ],
    buildRenameRules("add-text", { ...baseInputs, prefix: "Final-", suffix: "" }),
  );
  assert.equal(acrossFolders.conflicts, 2);

  const reserved = previewBrowserRename(
    [{ path: "one.txt", name: "one.txt" }],
    { ...buildRenameRules("add-text", baseInputs), template: "CON" },
  );
  assert.equal(reserved.invalid, 1);
});

test("positive: Replace Text identifies only filenames that contain the Find value", () => {
  const preview = previewBrowserRename(
    [
      { path: "abcd-report.txt", name: "abcd-report.txt" },
      { path: "notes.txt", name: "notes.txt" },
    ],
    buildRenameRules("replace-text", { ...baseInputs, find: "abcd", replace: "xyz" }),
  );
  assert.equal(preview.items[0].matched, true);
  assert.equal(preview.items[0].proposedName, "xyz-report.txt");
  assert.equal(preview.items[1].matched, false);
  assert.equal(preview.items[1].status, "unchanged");
});

test("boundary: filenames at 255 bytes pass and 256 bytes fail", () => {
  const file = [{ path: "x.txt", name: "x.txt" }];
  const allowed = previewBrowserRename(file, {
    ...buildRenameRules("add-text", baseInputs),
    template: "a".repeat(251),
  });
  assert.equal(allowed.invalid, 0);

  const tooLong = previewBrowserRename(file, {
    ...buildRenameRules("add-text", baseInputs),
    template: "a".repeat(252),
  });
  assert.equal(tooLong.invalid, 1);
});

test("edge: regex captures, case changes, numbering, and invalid regex are handled", () => {
  const regex = previewBrowserRename(
    [{ path: "scan_2026_invoice.pdf", name: "scan_2026_invoice.pdf" }],
    {
      ...buildRenameRules("replace-text", { ...baseInputs, find: "scan_\\d+_(.*)", replace: "$1", useRegex: true }),
      caseStyle: "upper",
    },
  );
  assert.equal(regex.items[0].proposedName, "INVOICE.pdf");

  const numbered = previewBrowserRename(
    [{ path: "image.png", name: "image.png" }],
    buildRenameRules("add-numbers", { ...baseInputs, counterStart: 0, counterPadding: 4 }),
  );
  assert.equal(numbered.items[0].proposedName, "image-000.png");

  const modified = new Date(2026, 7, 27).getTime();
  const dated = previewBrowserRename(
    [{ path: "image.png", name: "image.png", modifiedMs: modified }],
    buildRenameRules("add-date", { ...baseInputs, dateSource: "modified", dateFormat: "mm-dd-yyyy" }),
  );
  assert.equal(dated.items[0].proposedName, "08-27-2026-image.png");

  assert.throws(
    () =>
      previewBrowserRename(
        [{ path: "image.png", name: "image.png" }],
        buildRenameRules("replace-text", { ...baseInputs, find: "[", useRegex: true }),
      ),
    /Regex Error/u,
  );
});
