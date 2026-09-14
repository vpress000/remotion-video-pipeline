import { Config } from "@remotion/cli/config";

// Default render settings. Override per-invocation with CLI flags.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setConcurrency(null); // let Remotion pick based on the host

export {};
