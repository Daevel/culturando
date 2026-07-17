import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { assets } from "@culturando/assets";
import sharp from "sharp";

const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const THUMBNAIL_CONTENT_TYPE = "image/webp";
const THUMBNAIL_EXTENSION = "webp";

const ALLOWED_COVER_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type SaveCoverImageResult = {
  url: string | undefined;
  thumbnailUrl: string | undefined;
  error: string | undefined;
};

type SaveCoverImagesResult = {
  images: Array<{
    url: string;
    thumbnailUrl?: string;
  }>;
  error: string | undefined;
};

type R2Config = {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  publicUrl: string;
};

let r2Client: S3Client | undefined;

export async function saveCoverImage(
  value: FormDataEntryValue | null,
): Promise<SaveCoverImageResult> {
  if (!(value instanceof File) || value.size === 0) {
    return {
      url: undefined,
      thumbnailUrl: undefined,
      error: undefined,
    };
  }

  const extension = ALLOWED_COVER_IMAGE_TYPES[value.type as keyof typeof ALLOWED_COVER_IMAGE_TYPES];

  if (!extension) {
    return {
      url: undefined,
      thumbnailUrl: undefined,
      error: "Carica una copertina in formato JPG, PNG o WebP.",
    };
  }

  if (value.size > MAX_COVER_IMAGE_SIZE_BYTES) {
    return {
      url: undefined,
      thumbnailUrl: undefined,
      error: "La copertina non può superare 5 MB.",
    };
  }

  const fileBuffer = Buffer.from(await value.arrayBuffer());

  return saveCoverImageBuffer({
    contentType: value.type,
    extension,
    fileBuffer,
  });
}

export async function saveCoverImages(
  values: FormDataEntryValue[],
): Promise<SaveCoverImagesResult> {
  const images: SaveCoverImagesResult["images"] = [];

  for (const value of values) {
    const result = await saveCoverImage(value);

    if (result.error) {
      return {
        images: [],
        error: result.error,
      };
    }

    if (result.url) {
      images.push({
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
      });
    }
  }

  return {
    images,
    error: undefined,
  };
}

export async function saveRemoteCoverImage(url: string): Promise<SaveCoverImageResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        url: undefined,
        thumbnailUrl: undefined,
        error: undefined,
      };
    }

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim();
    const extension = contentType
      ? ALLOWED_COVER_IMAGE_TYPES[contentType as keyof typeof ALLOWED_COVER_IMAGE_TYPES]
      : undefined;

    if (!contentType || !extension) {
      return {
        url: undefined,
        thumbnailUrl: undefined,
        error: undefined,
      };
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer());

    if (fileBuffer.byteLength > MAX_COVER_IMAGE_SIZE_BYTES) {
      return {
        url: undefined,
        thumbnailUrl: undefined,
        error: undefined,
      };
    }

    return saveCoverImageBuffer({
      contentType,
      extension,
      fileBuffer,
    });
  } catch {
    return {
      url: undefined,
      thumbnailUrl: undefined,
      error: undefined,
    };
  }
}

async function saveCoverImageBuffer({
  contentType,
  extension,
  fileBuffer,
}: {
  contentType: string;
  extension: string;
  fileBuffer: Buffer;
}): Promise<SaveCoverImageResult> {
  const fileName = `${randomUUID()}.${extension}`;
  const thumbnailFileName = `thumb-${randomUUID()}.${THUMBNAIL_EXTENSION}`;
  const thumbnailBuffer = await generateCoverThumbnail(fileBuffer);
  const r2Config = getR2Config();

  if (r2Config) {
    return saveCoverImageToR2({
      config: r2Config,
      contentType,
      fileBuffer,
      fileName,
      thumbnailBuffer,
      thumbnailFileName,
    });
  }

  return saveCoverImageLocally({ fileBuffer, fileName, thumbnailBuffer, thumbnailFileName });
}

async function generateCoverThumbnail(fileBuffer: Buffer) {
  return sharp(fileBuffer)
    .resize({
      fit: "inside",
      height: 480,
      width: 320,
      withoutEnlargement: true,
    })
    .webp({ quality: 72 })
    .toBuffer();
}

async function saveCoverImageToR2({
  config,
  contentType,
  fileBuffer,
  fileName,
  thumbnailBuffer,
  thumbnailFileName,
}: {
  config: R2Config;
  contentType: string;
  fileBuffer: Buffer;
  fileName: string;
  thumbnailBuffer: Buffer;
  thumbnailFileName: string;
}): Promise<SaveCoverImageResult> {
  const key = `book-covers/${fileName}`;
  const thumbnailKey = `book-covers/thumbnails/${thumbnailFileName}`;
  const client = getR2Client(config);

  await Promise.all([
    client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    ),
    client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: THUMBNAIL_CONTENT_TYPE,
      }),
    ),
  ]);

  return {
    url: `${config.publicUrl}/${key}`,
    thumbnailUrl: `${config.publicUrl}/${thumbnailKey}`,
    error: undefined,
  };
}

async function saveCoverImageLocally({
  fileBuffer,
  fileName,
  thumbnailBuffer,
  thumbnailFileName,
}: {
  fileBuffer: Buffer;
  fileName: string;
  thumbnailBuffer: Buffer;
  thumbnailFileName: string;
}): Promise<SaveCoverImageResult> {
  const uploadDirectory = getLocalCoverUploadDirectory();
  const thumbnailDirectory = join(uploadDirectory, "thumbnails");

  // The prototype stores a real WebP thumbnail so cards/details do not need the full cover.
  await mkdir(thumbnailDirectory, { recursive: true });
  await Promise.all([
    writeFile(join(uploadDirectory, fileName), fileBuffer),
    writeFile(join(thumbnailDirectory, thumbnailFileName), thumbnailBuffer),
  ]);

  return {
    url: assets.uploads.bookCover(fileName),
    thumbnailUrl: assets.uploads.bookCover(`thumbnails/${thumbnailFileName}`),
    error: undefined,
  };
}

function getR2Client(config: R2Config) {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return r2Client;
}

function getR2Config(): R2Config | undefined {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const publicUrl = normalizePublicUrl(process.env.R2_PUBLIC_URL);
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!accountId || !bucketName || !accessKeyId || !secretAccessKey || !endpoint || !publicUrl) {
    return undefined;
  }

  return {
    accountId,
    bucketName,
    accessKeyId,
    secretAccessKey,
    endpoint,
    publicUrl,
  };
}

function normalizePublicUrl(value: string | undefined) {
  return value?.trim().replace(/\/$/, "") || undefined;
}

function getLocalCoverUploadDirectory() {
  const appPublicPath = join("apps", "web", "public");

  if (process.cwd().endsWith(`${sep}apps${sep}web`)) {
    return join(process.cwd(), "public", "uploads", "book-covers");
  }

  return join(process.cwd(), appPublicPath, "uploads", "book-covers");
}
