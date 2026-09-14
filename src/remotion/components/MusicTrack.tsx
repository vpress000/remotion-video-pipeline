import React from "react";
import { Audio, staticFile } from "remotion";
import type { Music } from "../../schema/video-spec";

const isRemote = (src: string): boolean => /^https?:\/\//i.test(src);

/**
 * Background music. Renders nothing (silent) until you drop a royalty-free
 * track into public/audio and set `music.trackSrc` in the VideoSpec.
 */
export const MusicTrack: React.FC<{ music: Music }> = ({ music }) => {
  if (!music.trackSrc) return null;
  const src = isRemote(music.trackSrc) ? music.trackSrc : staticFile(`audio/${music.trackSrc}`);
  return <Audio src={src} volume={music.volume} />;
};
