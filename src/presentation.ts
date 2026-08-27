export function summaryLabel(total: number, changed: number, problems: number): string {
  if (total === 0) return "No Files Selected";
  if (problems > 0) return `${total.toLocaleString()} Files · ${problems.toLocaleString()} Need Attention`;
  if (changed === 0) return `${total.toLocaleString()} Files · No Names Will Change`;
  return `${total.toLocaleString()} Files · ${changed.toLocaleString()} Ready To Save`;
}

export function renameButtonLabel(changed: number, busy: boolean): string {
  void changed;
  return busy ? "Saving…" : "Save As";
}
