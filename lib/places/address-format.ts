type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

/** Short UI label: street + number, city. Falls back to first two comma segments. */
export function formatShortAddress(fullAddress: string): string {
  const trimmed = fullAddress.trim();
  if (!trimmed) {
    return '';
  }

  const parts = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return trimmed;
  }

  return `${parts[0]}, ${parts[1]}`;
}

export function buildShortAddressFromComponents(
  components: AddressComponent[],
  fallbackFormattedAddress: string
): string {
  const findLongText = (type: string) =>
    components.find((component) => component.types?.includes(type))?.longText?.trim() ??
    '';

  const route = findLongText('route');
  const streetNumber = findLongText('street_number');
  const city =
    findLongText('locality') ||
    findLongText('sublocality_level_1') ||
    findLongText('administrative_area_level_2') ||
    findLongText('postal_town');

  const streetLine = [route, streetNumber].filter(Boolean).join(' ').trim();

  if (streetLine && city) {
    return `${streetLine}, ${city}`;
  }

  if (streetLine) {
    return streetLine;
  }

  return formatShortAddress(fallbackFormattedAddress);
}
