'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';

const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_PELAMBRES_PLACE_ID || "";

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

export function GoogleReviews() {
	const [data, setData] = useState<PlaceDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchReviews() {
			try {
				const response = await fetch('/api/google-reviews');
				console.log('fetch response', response);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Fallo al cargar las reseñas');
				}

				const result: PlaceDetails = await response.json();
				setData(result);
			} catch (err: any) {
				setError(err.message);
				console.error("Error al obtener reseñas:", err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchReviews();
	}, []);

	const renderStars = (rating: number) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const partialStarValue = rating - fullStars;

		for (let i = 1; i <= 5; i++) {
			if (i <= fullStars) {
				stars.push(
					<Star
						key={i}
						className="w-4 h-4 text-yellow-500 fill-yellow-500"
					/>
				);
			} else if (i === fullStars + 1 && partialStarValue > 0) {
				stars.push(
					<div key={i} className="relative w-4 h-4">
						<Star
							className="absolute w-4 h-4 text-gray-300 fill-gray-300"
						/>
						<div
							className="absolute overflow-hidden"
							style={{ width: `${partialStarValue * 100}%` }}
						>
							<Star
								className="w-4 h-4 text-yellow-500 fill-yellow-500"
							/>
						</div>
					</div>
				);
			} else {
				stars.push(
					<Star
						key={i}
						className="w-4 h-4 text-gray-300"
					/>
				);
			}
		}
		return <div className="flex space-x-0.5">{stars}</div>;
	};

	if (isLoading) {
		return <div className="text-center p-8">Cargando comentarios...</div>;
	}

	if (error) {
		return <div className="text-center p-8 text-red-500">Error: {error}</div>;
	}

	if (!data || !data.reviews || data.reviews.length === 0) {
		return <div className="text-center p-8 text-gray-500">Aún no hay reseñas para mostrar.</div>;
	}

	const reviewsToShow = data.reviews.slice(0, 4);

	return (
		<div className="mx-auto">
			<h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
				Comentarios de Nuestros Clientes
				<span className="ml-3 flex items-center">
					{renderStars(data.rating)}
					<span className="ml-1 text-xl font-semibold">{data.rating.toFixed(1)}</span>
				</span>
			</h2>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{reviewsToShow.map((review, index) => (
					<div
						key={index}
						className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl"
					>
						<div className="flex items-start mb-4">
							{review.profile_photo_url ? (
								<Image
									src={review.profile_photo_url}
									alt={review.author_name}
									className="w-10 h-10 rounded-full object-cover mr-3"
									width={40}
									height={40}
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 mr-3">
									{review.author_name.charAt(0)}
								</div>
							)}

							<div>
								<p className="font-semibold text-gray-900">{review.author_name}</p>
								{renderStars(review.rating)}
							</div>
						</div>

						<p className="text-sm text-gray-600 mb-3 italic line-clamp-4">
							"{review.text}"
						</p>

						<p className="text-xs text-gray-400 text-right">{review.relative_time_description}</p>
					</div>
				))}
			</div>

			{/* Enlace para ver más reseñas en Google */}
			<div className="mt-8 text-center">
				<a
					href={`https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Ver y Escribir más Reseñas en Google
				</a>
			</div>
		</div>
	);
}