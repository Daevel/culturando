-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "SalutationPreference" AS ENUM ('masculine', 'feminine', 'neutral');

-- CreateEnum
CREATE TYPE "BookVisibility" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "BookAvailability" AS ENUM ('available', 'consultation_only', 'loanable', 'unavailable');

-- CreateEnum
CREATE TYPE "BookPhysicalCondition" AS ENUM ('new', 'good', 'worn', 'damaged');

-- CreateEnum
CREATE TYPE "BookImageSource" AS ENUM ('user_upload', 'external_api');

-- CreateEnum
CREATE TYPE "LoanRequestType" AS ENUM ('consultation', 'loan', 'info');

-- CreateEnum
CREATE TYPE "LoanRequestStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "name" TEXT,
    "nickname" TEXT,
    "nicknameUpdatedAt" TIMESTAMP(3),
    "salutationPreference" "SalutationPreference" NOT NULL DEFAULT 'neutral',
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "addressLabel" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "region" TEXT,
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "description" TEXT,
    "publisher" TEXT,
    "publishedYear" INTEGER,
    "language" TEXT,
    "category" TEXT,
    "availability" "BookAvailability" NOT NULL DEFAULT 'available',
    "visibility" "BookVisibility" NOT NULL DEFAULT 'public',
    "physicalCondition" "BookPhysicalCondition" NOT NULL DEFAULT 'good',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookStats" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookLocation" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "addressLabel" TEXT NOT NULL,
    "city" TEXT,
    "province" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Italia',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "publicLatitude" DOUBLE PRECISION,
    "publicLongitude" DOUBLE PRECISION,
    "accuracyRadiusMeters" INTEGER NOT NULL DEFAULT 750,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookImage" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "source" "BookImageSource" NOT NULL DEFAULT 'user_upload',
    "alt" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRequest" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "LoanRequestType" NOT NULL DEFAULT 'consultation',
    "status" "LoanRequestStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_nickname_idx" ON "User"("nickname");

-- CreateIndex
CREATE INDEX "User_emailVerifiedAt_idx" ON "User"("emailVerifiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Book_ownerId_idx" ON "Book"("ownerId");

-- CreateIndex
CREATE INDEX "Book_isbn_idx" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE INDEX "Book_availability_idx" ON "Book"("availability");

-- CreateIndex
CREATE INDEX "Book_visibility_idx" ON "Book"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "BookStats_bookId_key" ON "BookStats"("bookId");

-- CreateIndex
CREATE INDEX "BookStats_viewCount_idx" ON "BookStats"("viewCount");

-- CreateIndex
CREATE UNIQUE INDEX "BookLocation_bookId_key" ON "BookLocation"("bookId");

-- CreateIndex
CREATE INDEX "BookLocation_city_idx" ON "BookLocation"("city");

-- CreateIndex
CREATE INDEX "BookLocation_province_idx" ON "BookLocation"("province");

-- CreateIndex
CREATE INDEX "BookLocation_region_idx" ON "BookLocation"("region");

-- CreateIndex
CREATE INDEX "BookLocation_country_idx" ON "BookLocation"("country");

-- CreateIndex
CREATE INDEX "BookImage_bookId_idx" ON "BookImage"("bookId");

-- CreateIndex
CREATE INDEX "BookImage_source_idx" ON "BookImage"("source");

-- CreateIndex
CREATE INDEX "BookImage_isPrimary_idx" ON "BookImage"("isPrimary");

-- CreateIndex
CREATE INDEX "LoanRequest_bookId_idx" ON "LoanRequest"("bookId");

-- CreateIndex
CREATE INDEX "LoanRequest_requesterId_idx" ON "LoanRequest"("requesterId");

-- CreateIndex
CREATE INDEX "LoanRequest_ownerId_idx" ON "LoanRequest"("ownerId");

-- CreateIndex
CREATE INDEX "LoanRequest_status_idx" ON "LoanRequest"("status");

-- CreateIndex
CREATE INDEX "LoanRequest_type_idx" ON "LoanRequest"("type");

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookStats" ADD CONSTRAINT "BookStats_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookLocation" ADD CONSTRAINT "BookLocation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookImage" ADD CONSTRAINT "BookImage_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

