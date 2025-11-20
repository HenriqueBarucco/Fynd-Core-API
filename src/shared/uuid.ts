import { randomBytes } from 'node:crypto';

const UUID_V8_VARIANT_MASK = 0x3f;
const UUID_V8_VARIANT_VALUE = 0x80;
const UUID_V8_VERSION_MASK = 0x0f;
const UUID_V8_VERSION_VALUE = 0x80;

export function generateUuidV8(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & UUID_V8_VERSION_MASK) | UUID_V8_VERSION_VALUE;
  bytes[8] = (bytes[8] & UUID_V8_VARIANT_MASK) | UUID_V8_VARIANT_VALUE;
  const hex = bytes.toString('hex');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function isUuidV8(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
