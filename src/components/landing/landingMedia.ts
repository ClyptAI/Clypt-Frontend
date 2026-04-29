const BLOB_BASE_URL = "https://nifcdkmrbw3cwvgh.public.blob.vercel-storage.com";

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
  return `${BLOB_BASE_URL}/landing/${id}.mp4`;
}

export function getLandingClipPosterSrc(id: LandingClipId): string {
  return `${BLOB_BASE_URL}/landing-posters/${id}.jpg`;
}

export const landingPosterSrc = {
  heroFanoutCenter: `${BLOB_BASE_URL}/landing-posters/hero-fanout-center.png`,
  heroFanoutSide: `${BLOB_BASE_URL}/landing-posters/hero-fanout-side.png`,
} as const;

export const landingHeroImageSrc = {
  groundedRogan: `${BLOB_BASE_URL}/hero/grounded-rogan.jpg`,
  timelineRogan: `${BLOB_BASE_URL}/hero/timeline-rogan.jpg`,
  jayVenturaAvatar: `${BLOB_BASE_URL}/hero/jay-ventura-avatar.png`,
} as const;

export const landingPhaseFrameSrc = {
  phase1: `${BLOB_BASE_URL}/landing-assets/landing-phase1-frame.png`,
  phase5: `${BLOB_BASE_URL}/landing-assets/landing-phase5-frame.png`,
} as const;
