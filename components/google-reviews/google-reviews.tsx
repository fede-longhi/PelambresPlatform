'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GoogleReviewsSkeleton } from './google-review-skeleton';
import { GOOGLE_WRITEREVIEW_URI } from '@/lib/consts';

const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_PELAMBRES_PLACE_ID || '';

interface Review {
	author_name: string;
	profile_photo_url: string;
	author_uri: string;
	rating: number;
	relative_time_description: string;
	text: string;
	google_maps_uri: string;
}

interface PlaceDetails {
	name: string;
	rating: number;
	user_ratings_total: number;
	reviews: Review[];
}

interface GoogleReviewsProps {
	showTimeDescription?: boolean;
}

type StarRatingProps = {
	rating: number;
	className?: string;
};

function StarRating({ rating, className }: StarRatingProps) {
	const stars = [];
	const fullStars = Math.floor(rating);
	const partialStarValue = rating - fullStars;

	for (let starIndex = 1; starIndex <= 5; starIndex++) {
		if (starIndex <= fullStars) {
			stars.push(
				<Star
					key={starIndex}
					className="h-4 w-4 fill-yellow-500 text-yellow-500"
					aria-hidden="true"
				/>
			);
		} else if (starIndex === fullStars + 1 && partialStarValue > 0) {
			stars.push(
				<div key={starIndex} className="relative h-4 w-4" aria-hidden="true">
					<Star className="absolute h-4 w-4 fill-muted text-muted" />
					<div
						className="absolute overflow-hidden"
						style={{ width: `${partialStarValue * 100}%` }}
					>
						<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
					</div>
				</div>
			);
		} else {
			stars.push(
				<Star key={starIndex} className="h-4 w-4 text-muted" aria-hidden="true" />
			);
		}
	}

	return (
		<span className={className}>
			<span className="sr-only">Calificación: {rating.toFixed(1)} de 5 estrellas</span>
			<span className="flex space-x-0.5" aria-hidden="true">
				{stars}
			</span>
		</span>
	);
}

export function GoogleReviews({ showTimeDescription = true }: GoogleReviewsProps) {
	const [data, setData] = useState<PlaceDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchReviews() {
			try {
				const response = await fetch('/api/google-reviews');

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'No se pudieron cargar las reseñas');
				}

				const result: PlaceDetails = await response.json();
				setData(result);
			} catch (err) {
				let errorMessage = 'No pudimos cargar las reseñas. Intentá de nuevo más tarde.';

				if (err instanceof Error) {
					errorMessage = err.message;
				} else if (
					typeof err === 'object' &&
					err !== null &&
					'message' in err &&
					typeof err.message === 'string'
				) {
					errorMessage = err.message;
				}

				setError(errorMessage);
				console.error('Error getting reviews:', err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchReviews();
	}, []);

	if (isLoading) {
		return <GoogleReviewsSkeleton />;
	}

	if (error) {
		return (
			<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center" role="alert">
				<p className="text-sm font-medium text-destructive">{error}</p>
			</div>
		);
	}

	if (!data || !data.reviews || data.reviews.length === 0) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				Aún no hay reseñas para mostrar.
			</div>
		);
	}

	const reviewsToShow = data.reviews.slice(0, 4);

	return (
		<div className="mx-auto">
			<h2 className="mb-6 flex flex-wrap items-center gap-3 text-3xl font-extrabold text-heading-foreground">
				Comentarios de Nuestros Clientes
				<span className="flex items-center gap-1">
					<StarRating rating={data.rating} />
					<span className="text-xl font-semibold" aria-hidden="true">
						{data.rating.toFixed(1)}
					</span>
				</span>
			</h2>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{reviewsToShow.map((review, index) => (
					<div
						key={index}
						className="rounded-lg border border-border bg-background p-6 shadow-lg transition duration-300 hover:shadow-xl"
					>
						<div className="mb-4 flex items-start">
							{review.profile_photo_url ? (
								<Image
									src={review.profile_photo_url}
									alt=""
									aria-hidden="true"
									className="mr-3 h-10 w-10 rounded-full object-cover"
									width={40}
									height={40}
								/>
							) : (
								<div
									className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
									aria-hidden="true"
								>
									{review.author_name.charAt(0)}
								</div>
							)}

							<div>
								<p className="font-semibold text-foreground">{review.author_name}</p>
								<StarRating rating={review.rating} className="mt-1" />
							</div>
						</div>

						<p className="mb-3 line-clamp-4 text-sm italic text-muted-foreground">
							&ldquo;{review.text}&rdquo;
						</p>

						{showTimeDescription && (
							<p className="text-right text-xs text-muted-foreground">
								{review.relative_time_description}
							</p>
						)}
					</div>
				))}
			</div>

			<div className="mt-8 text-center">
				<Link
					href={`${GOOGLE_WRITEREVIEW_URI}?placeid=${GOOGLE_PLACE_ID}`}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Ver y escribir más reseñas en Google (se abre en una pestaña nueva)"
					className="inline-flex items-center rounded-full border border-transparent bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					Ver y Escribir más Reseñas en Google
				</Link>
			</div>
		</div>
	);
}
