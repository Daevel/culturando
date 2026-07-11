const publicAssetBasePath = "";

function assetPath(path: `/${string}`) {
  return `${publicAssetBasePath}${path}` as const;
}

export const assets = {
  favicon: assetPath("/logo/favicon.ico"),
  logo: {
    fullDark: assetPath("/logo/logo-full-dark.svg"),
    fullLight: assetPath("/logo/logo-full-light.svg"),
    markDark: assetPath("/logo/logo-mark-dark.svg"),
    markLight: assetPath("/logo/logo-mark-light.svg"),
  },
  icons: {
    appleTouch: assetPath("/logo/apple-touch-icon.png"),
    favicon16: assetPath("/logo/favicon-16x16.png"),
    favicon32: assetPath("/logo/favicon-32x32.png"),
    icon192: assetPath("/logo/icon-192.png"),
    icon512: assetPath("/logo/icon-512.png"),
    manifest: assetPath("/logo/site.webmanifest"),
  },
  images: {
    loginPage: assetPath("/images/login-page-image.png"),
  },
  uploads: {
    bookCover: (fileName: string) => assetPath(`/uploads/book-covers/${fileName}`),
  },
} as const;

export type AppAssets = typeof assets;
