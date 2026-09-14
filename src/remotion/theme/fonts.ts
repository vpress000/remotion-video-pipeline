import { loadFont } from "@remotion/google-fonts/Montserrat";

// Loads Montserrat for both the Studio preview and server-side renders.
const loaded = loadFont();

export const fontFamily = loaded.fontFamily;
