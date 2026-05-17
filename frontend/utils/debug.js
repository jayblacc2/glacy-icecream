const DEBUG = false;

function debugLog(...args) {
  if (DEBUG) {
    console.log("[Glacy]", ...args);
  }
}

function debugWarn(...args) {
  if (DEBUG) {
    console.warn("[Glacy]", ...args);
  }
}

function debugError(...args) {
  console.error("[Glacy]", ...args);
}

export { debugLog, debugWarn, debugError };
