export function formatAddress(parts: {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country?: string | null;
}): string | null {
  const lines = [
    parts.address_line1,
    parts.address_line2,
    [parts.city, parts.state_province, parts.postal_code].filter(Boolean).join(", "),
    parts.country,
  ].filter((line): line is string => Boolean(line && line.trim()));

  return lines.length > 0 ? lines.join("\n") : null;
}
