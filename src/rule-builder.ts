export type RenameFunction = "add-text" | "replace-text" | "change-case" | "add-numbers" | "add-date";

export type RenameRules = {
  template: string;
  find: string;
  replace: string;
  useRegex: boolean;
  caseStyle: string;
  counterStart: number;
  counterPadding: number;
  dateSource: string;
  dateFormat: string;
};

export type RuleInputs = {
  prefix: string;
  suffix: string;
  find: string;
  replace: string;
  useRegex: boolean;
  caseStyle: string;
  counterStart: number;
  counterPadding: number;
  numberPosition: string;
  datePosition: string;
  dateSource: string;
  dateFormat: string;
};

function clampedInteger(value: number, fallback: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(minimum, Math.min(Math.trunc(value), maximum));
}

export function buildRenameRules(selectedFunction: string, inputs: RuleInputs): RenameRules {
  const counterStart = clampedInteger(inputs.counterStart, 1, 0, 999_999);
  const counterPadding = clampedInteger(inputs.counterPadding, 3, 1, 3);

  switch (selectedFunction as RenameFunction) {
    case "add-text":
      return {
        template: `${inputs.prefix}{name}${inputs.suffix}`,
        find: "",
        replace: "",
        useRegex: false,
        caseStyle: "keep",
        counterStart,
        counterPadding,
        dateSource: "today",
        dateFormat: "yyyy-mm-dd",
      };
    case "replace-text":
      return {
        template: "{name}",
        find: inputs.find,
        replace: inputs.replace,
        useRegex: inputs.useRegex,
        caseStyle: "keep",
        counterStart,
        counterPadding,
        dateSource: "today",
        dateFormat: "yyyy-mm-dd",
      };
    case "change-case":
      return {
        template: "{name}",
        find: "",
        replace: "",
        useRegex: false,
        caseStyle: inputs.caseStyle,
        counterStart,
        counterPadding,
        dateSource: "today",
        dateFormat: "yyyy-mm-dd",
      };
    case "add-numbers":
      if (!["beginning", "end"].includes(inputs.numberPosition)) throw new Error("Select A Number Position.");
      return {
        template: inputs.numberPosition === "beginning" ? "{n}-{name}" : "{name}-{n}",
        find: "",
        replace: "",
        useRegex: false,
        caseStyle: "keep",
        counterStart,
        counterPadding,
        dateSource: "today",
        dateFormat: "yyyy-mm-dd",
      };
    case "add-date":
      if (!["beginning", "end"].includes(inputs.datePosition)) throw new Error("Select A Date Position.");
      if (!["today", "modified"].includes(inputs.dateSource)) throw new Error("Select A Date Source.");
      if (!["yyyy-mm-dd", "mm-dd-yyyy", "dd-mm-yyyy"].includes(inputs.dateFormat)) {
        throw new Error("Select A Date Format.");
      }
      return {
        template: inputs.datePosition === "beginning" ? "{date}-{name}" : "{name}-{date}",
        find: "",
        replace: "",
        useRegex: false,
        caseStyle: "keep",
        counterStart,
        counterPadding,
        dateSource: inputs.dateSource,
        dateFormat: inputs.dateFormat,
      };
    default:
      throw new Error("Choose A Supported Rename Function.");
  }
}
