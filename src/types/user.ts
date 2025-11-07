import { z } from "zod";

export const SpotifyUserProfileShape = {
    country: z.string().optional(),
    display_name: z.string().optional(),
    email: z.string().optional(),
    explicit_content: z
        .object({
            filter_enabled: z.boolean(),
            filter_locked: z.boolean(),
        })
        .optional(),
    external_urls: z.object({
        spotify: z.string(),
    }),
    followers: z.object({
        href: z.string().nullable(),
        total: z.number(),
    }),
    href: z.string(),
    id: z.string(),
    images: z
        .array(
            z.object({
                url: z.string(),
                height: z.number().nullable(),
                width: z.number().nullable(),
            }),
        )
        .optional(),
    product: z.string().optional(),
    type: z.string(),
    uri: z.string(),
};

export const SpotifyUserProfileSchema = z.object(SpotifyUserProfileShape);

export type SpotifyUserProfile = z.infer<typeof SpotifyUserProfileSchema>;
