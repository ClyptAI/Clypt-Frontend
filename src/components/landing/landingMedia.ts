const BLOB_BASE_URL = "https://nifcdkmrbw3cwvgh.public.blob.vercel-storage.com/landing";
const POSTER_BASE_PATH = "/images/landing-posters";

export const landingClipIds = [
  "dwarkesh_sg_0007_cand_01_vertical_rfdetr_karaoke",
  "dwarkesh_sg_0015_cand_01_vertical_rfdetr_karaoke",
  "mrbeast_sg_0001_cand_01_vertical_rfdetr_karaoke",
  "pete_sg_0008_cand_01_vertical_rfdetr_karaoke",
  "pete_sg_0012_cand_01_vertical_rfdetr_karaoke",
  "sg_0002_cand_01_vertical_rfdetr_karaoke",
  "sg_0003_cand_01_vertical_rfdetr_karaoke",
  "sg_0005_cand_01_vertical_rfdetr_karaoke",
] as const;

export type LandingClipId = (typeof landingClipIds)[number];

export function getLandingClipVideoSrc(id: LandingClipId): string {
  return `${BLOB_BASE_URL}/${id}.mp4`;
}

export function getLandingClipPosterSrc(id: LandingClipId): string {
  return `${POSTER_BASE_PATH}/${id}.jpg`;
}
