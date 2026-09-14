import type { Metadata } from "next";

interface GenerateMetadataOptions {
    title: string;
    description: string;
    path?: string; // e.g., "/admin/students" or `/enroll/${tutorId}`
    image?: string; // Optional custom OG image override
    type?: "website" | "article";
}

const BASE_URL = process.env.BASE_URL || "https://tqp.mssnoau.org";
const DEFAULT_OG_IMAGE = "/og-image.jpg"; // Stored in /public/og-image.png (1200x630)
const SITE_NAME = "TQP Structured Learning Management System";

/**
 * OSFA Metadata Generator
 * Generates uniform Next.js Metadata objects across static and dynamic routes.
 */
export function generateOSFAMetadata({
    title,
    description,
    path = "",
    image = DEFAULT_OG_IMAGE,
    type = "website",
}: GenerateMetadataOptions): Metadata {
    const formattedTitle = title.includes("TQP") ? title : `${title} | TQP System`;
    const fullUrl = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const imageUrl = image.startsWith("http") ? image : `${BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;

    return {
        title: formattedTitle,
        description,
        metadataBase: new URL(BASE_URL),
        alternates: {
            canonical: fullUrl,
        },
        openGraph: {
            title: formattedTitle,
            description,
            url: fullUrl,
            siteName: SITE_NAME,
            type,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: formattedTitle,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: formattedTitle,
            description,
            images: [imageUrl],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}