export const isAppleDevice =
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
