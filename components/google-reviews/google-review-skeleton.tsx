import React from 'react';

const ReviewCardSkeleton = () => (
    <div 
        className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 animate-pulse"
    >
        <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
            
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="flex space-x-0.5">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
        
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-11/12 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        
        <div className="h-3 bg-gray-200 rounded w-1/4 mt-4 ml-auto"></div>
    </div>
);

export function GoogleReviewsSkeleton() {
    
    const skeletonCount = [1, 2, 3, 4]; 
    
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-10 mx-auto sm:mx-0"></div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {skeletonCount.map((i) => (
                    <ReviewCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}