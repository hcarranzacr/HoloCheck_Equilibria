/**
 * WMEA SDK Loader
 * Singleton pattern to load NuraLogix Web Measurement Embedded App SDK
 */

type WmeaModule = {
  default: any;
  faceAttributeValue: any;
};

declare global {
   
  var __WMEA_SDK__: Promise<WmeaModule> | undefined;
}

const SDK_URL =
  "https://unpkg.com/@nuralogix.ai/web-measurement-embedded-app/lib/index.mjs";

export function loadWmeaSdk(): Promise<WmeaModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("WMEA SDK can only be loaded in the browser"));
  }

  if (!globalThis.__WMEA_SDK__) {
    globalThis.__WMEA_SDK__ = import(
      /* webpackIgnore: true */
      SDK_URL
    ) as Promise<WmeaModule>;
  }

  return globalThis.__WMEA_SDK__!;
}