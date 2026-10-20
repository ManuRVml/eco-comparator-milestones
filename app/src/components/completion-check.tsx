export function CompletionCheck({ complete, label, id }: { complete: boolean; label: string; id: string }) {
  if (!complete) return null;
  return <span className="completion-check" role="img" aria-label={label} data-testid={`check-${id}`}>✓</span>;
}
