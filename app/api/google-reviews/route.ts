import { NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_PELAMBRES_PLACE_ID;
const REVALIDATION_TIME = 60 * 60 * 24;
const NEW_PLACES_API_BASE_URL = 'https://places.googleapis.com/v1/places';
const LANGUAGE_CODE = 'es';


// 1. Interfaz para la reseña cruda que viene de Google API (New)
interface GoogleReview {
    authorAttribution: {
        displayName: string;
        photoUri: string;
        uri: string;
    };
    rating: number;
    relativePublishTimeDescription: string;
    text: {
        text: string;
        languageCode: string;
    };
    googleMapsUri: string;
}

export async function GET() {
    if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
        console.error('Error: GOOGLE_PLACES_API_KEY o GOOGLE_PLACE_ID no están definidos.');
        return NextResponse.json({ error: 'Configuración de API missing' }, { status: 500 });
    }

    console.log('Fetching Google Reviews for Place ID:', GOOGLE_PLACE_ID);
    console.log(`${NEW_PLACES_API_BASE_URL}/${GOOGLE_PLACE_ID}`);
    const url = `${NEW_PLACES_API_BASE_URL}/${GOOGLE_PLACE_ID}?languageCode=${LANGUAGE_CODE}`;

    const fieldMask = [
        'id',
        'displayName',
        'rating',
        'userRatingCount',
        'reviews.authorAttribution',
        'reviews.rating',
        'reviews.relativePublishTimeDescription',
        'reviews.text',
        'reviews.googleMapsUri',
    ].join(',');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                'X-Goog-FieldMask': fieldMask,
                'X-Goog-User-Preferred-Language': LANGUAGE_CODE,
            },
            next: {
                revalidate: REVALIDATION_TIME,
            },
        });

        const data = await response.json();

        if (data.error) {
            console.error('Error fetching Google Reviews:', data.error.message);
            return NextResponse.json({ error: data.error }, { status: 400 });
        }

        const formattedData = {
            name: data.displayName.text,
            rating: data.rating,
            user_ratings_total: data.userRatingCount,
            reviews: (data.reviews as GoogleReview[]).map((review: GoogleReview) => ({
                author_name: review.authorAttribution.displayName,
                profile_photo_url: review.authorAttribution.photoUri,
                author_uri: review.authorAttribution.uri,
                rating: review.rating,
                relative_time_description: review.relativePublishTimeDescription,
                text: review.text.text,
                google_maps_uri: review.googleMapsUri,
            })),
        }

        return NextResponse.json(formattedData);

    } catch (error) {
        console.error('Server error fetching Google Reviews:', error);
        return NextResponse.json({ error: 'Fallo al conectar con la API de Google' }, { status: 500 });
    }
}