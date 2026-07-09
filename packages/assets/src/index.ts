const publicAssetBasePath = "";

function assetPath(path: `/${string}`) {
  return `${publicAssetBasePath}${path}` as const;
}

export const assets = {
  favicon: assetPath("/favicon.ico"),
  images: {
    loginPage: assetPath("/images/login-page-image.png"),
  },
  uploads: {
    bookCover: (fileName: string) => assetPath(`/uploads/book-covers/${fileName}`),
  },
} as const;

export type AppAssets = typeof assets;
