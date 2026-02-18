const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?\d[\d\s\-().]{7,}\d)/g;
const LONG_DIGITS_RE = /\b\d{6,}\b/g;

export function redact(input: string): string {
  return input
    .replace(EMAIL_RE, '[EMAIL]')
    .replace(PHONE_RE, '[PHONE]')
    .replace(LONG_DIGITS_RE, '[DIGITS]');
}

export function safeLogInputs(inputs: {
  destination: string;
  tripLength?: number;
  pace?: string;
}): Record<string, unknown> {
  return {
    destination: redact(inputs.destination),
    tripLength: inputs.tripLength,
    pace: inputs.pace,
  };
}
