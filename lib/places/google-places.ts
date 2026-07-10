import { buildShortAddressFromComponents } from '@/lib/places/address-format';
import { NEW_PLACES_API_BASE_URL } from '@/lib/consts';

const LANGUAGE_CODE = 'es';
const REGION_CODE = 'AR';
/** Martínez, Buenos Aires — bias autocomplete toward local addresses */
const LOCATION_BIAS = {
  circle: {
    center: { latitude: -34.4929125, longitude: -58.5192373 },
    radius: 50000.0,
  },
};

export type PlaceAutocompleteSuggestion = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceAddressDetails = {
  formattedAddress: string;
  shortAddress: string;
};

function getPlacesApiKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || null;
}

export async function fetchPlaceAutocompleteSuggestions(input: {
  query: string;
  sessionToken: string;
}): Promise<PlaceAutocompleteSuggestion[]> {
  const apiKey = getPlacesApiKey();

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY no está configurada.');
  }

  const trimmedQuery = input.query.trim();
  if (trimmedQuery.length < 2) {
    return [];
  }

  const response = await fetch(`${NEW_PLACES_API_BASE_URL}:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      input: trimmedQuery,
      languageCode: LANGUAGE_CODE,
      regionCode: REGION_CODE,
      includedRegionCodes: ['ar'],
      locationBias: LOCATION_BIAS,
      sessionToken: input.sessionToken,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Places autocomplete failed:', response.status, errorBody);
    throw new Error('No se pudieron obtener sugerencias de dirección.');
  }

  const data = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
  };

  return (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is NonNullable<typeof prediction> => Boolean(prediction?.placeId))
    .map((prediction) => ({
      placeId: prediction.placeId!,
      text: prediction.text?.text ?? '',
      mainText: prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? '',
      secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
    }));
}

export async function fetchPlaceAddressDetails(input: {
  placeId: string;
  sessionToken: string;
}): Promise<PlaceAddressDetails | null> {
  const apiKey = getPlacesApiKey();

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY no está configurada.');
  }

  const placeId = input.placeId.replace(/^places\//, '');
  const url = new URL(`${NEW_PLACES_API_BASE_URL}/${placeId}`);
  url.searchParams.set('languageCode', LANGUAGE_CODE);
  url.searchParams.set('regionCode', REGION_CODE);
  url.searchParams.set('sessionToken', input.sessionToken);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,formattedAddress,displayName,addressComponents',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Place details failed:', response.status, errorBody);
    throw new Error('No se pudo obtener la dirección seleccionada.');
  }

  const data = (await response.json()) as {
    formattedAddress?: string;
    displayName?: { text?: string };
    addressComponents?: Array<{
      longText?: string;
      shortText?: string;
      types?: string[];
    }>;
  };

  const formattedAddress =
    data.formattedAddress?.trim() || data.displayName?.text?.trim() || '';

  if (!formattedAddress) {
    return null;
  }

  return {
    formattedAddress,
    shortAddress: buildShortAddressFromComponents(
      data.addressComponents ?? [],
      formattedAddress
    ),
  };
}
