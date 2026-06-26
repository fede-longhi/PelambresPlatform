import path from 'path';
import { existsSync } from 'fs';

/** Relative URL path served from `public/`. */
export function getCourseSlidesUrl(slug: string): string {
    return `/course-slides/${slug}/`;
}

/** Absolute filesystem path to the slide deck HTML file. */
export function getCourseSlidesFilePath(slug: string): string {
    return path.join(process.cwd(), 'public', 'course-slides', slug, 'index.html');
}

export function courseSlidesExist(slug: string): boolean {
    return existsSync(getCourseSlidesFilePath(slug));
}
