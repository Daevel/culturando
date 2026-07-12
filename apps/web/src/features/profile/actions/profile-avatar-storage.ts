import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { assets } from "@culturando/assets";

const MAX_PROFILE_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const ALLOWED_PROFILE_AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type SaveProfileAvatarResult = {
  url: string | undefined;
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

export async function saveProfileAvatar(
  value: FormDataEntryValue | null,
): Promise<SaveProfileAvatarResult> {
  if (!(value instanceof File) || value.size === 0) {
    return {
      url: undefined,
      error: undefined,
    };
  }

  const extension =
    ALLOWED_PROFILE_AVATAR_TYPES[value.type as keyof typeof ALLOWED_PROFILE_AVATAR_TYPES];

  if (!extension) {
    return {
      url: undefined,
      error: "Carica un avatar in formato JPG, PNG o WebP.",
    };
  }

  if (value.size > MAX_PROFILE_AVATAR_SIZE_BYTES) {
    return {
      url: undefined,
      error: "L'avatar non può superare 2 MB.",
    };
  }

  const fileBuffer = Buffer.from(await value.arrayBuffer());
  const fileName = `${randomUUID()}.${extension}`;
  const r2Config = getR2Config();

  if (r2Config) {
    return saveProfileAvatarToR2({
      config: r2Config,
      contentType: value.type,
      fileBuffer,
      fileName,
    });
  }

  return saveProfileAvatarLocally({ fileBuffer, fileName });
}

async function saveProfileAvatarToR2({
  config,
  contentType,
  fileBuffer,
  fileName,
}: {
  config: R2Config;
  contentType: string;
  fileBuffer: Buffer;
  fileName: string;
}): Promise<SaveProfileAvatarResult> {
  const key = `profile-avatars/${fileName}`;
  const client = getR2Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    }),
  );

  return {
    url: `${config.publicUrl}/${key}`,
    error: undefined,
  };
}

async function saveProfileAvatarLocally({
  fileBuffer,
  fileName,
}: {
  fileBuffer: Buffer;
  fileName: string;
}): Promise<SaveProfileAvatarResult> {
  const uploadDirectory = getLocalProfileAvatarUploadDirectory();

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(join(uploadDirectory, fileName), fileBuffer);

  return {
    url: assets.uploads.profileAvatar(fileName),
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

function getLocalProfileAvatarUploadDirectory() {
  const appPublicPath = join("apps", "web", "public");

  if (process.cwd().endsWith(`${sep}apps${sep}web`)) {
    return join(process.cwd(), "public", "uploads", "profile-avatars");
  }

  return join(process.cwd(), appPublicPath, "uploads", "profile-avatars");
}
