import type { SVGAttributes } from 'react';

/**
 * The mark: a lens with a radar sweep across its first quarter, the same
 * drawing as public/clearsight-logo.svg without its background square.
 *
 * The ring and the pupil take currentColor so the mark follows whatever
 * surface it sits on; the sweep stays sky blue everywhere.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="162 162 700 700"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            {...props}
        >
            <path
                d="M 852,512 A 340,340 0 1,1 512,172 L 512,262 A 250,250 0 1,0 762,512 Z"
                fill="currentColor"
            />
            <path
                d="M 512,172 A 340,340 0 0,1 852,512 L 762,512 A 250,250 0 0,0 512,262 Z"
                fill="#38bdf8"
            />
            <circle cx="512" cy="512" r="54" fill="currentColor" />
        </svg>
    );
}
