import { get, set, del } from "idb-keyval";

const KYC_DOCUMENT_KEY = "onboarding-kyc-document";
const KYC_DOCUMENT_BACK_KEY = "onboarding-kyc-document-back";
const KYC_SELFIE_KEY = "onboarding-kyc-selfie";

type KycFileKey = "kycDocument" | "kycDocumentBack" | "kycSelfie";

const STORAGE_KEYS: Record<KycFileKey, string> = {
  kycDocument: KYC_DOCUMENT_KEY,
  kycDocumentBack: KYC_DOCUMENT_BACK_KEY,
  kycSelfie: KYC_SELFIE_KEY,
};

type StoredFileMeta = {
  blob: Blob;
  fileName: string;
  type: string;
};

function blobToFile(blob: Blob, fileName: string, type: string): File {
  return new File([blob], fileName, { type });
}

function getStorageKey(key: KycFileKey): string {
  return STORAGE_KEYS[key];
}

export async function saveKycFile(key: KycFileKey, file: File): Promise<void> {
  const storageKey = getStorageKey(key);
  const meta: StoredFileMeta = {
    blob: file,
    fileName: file.name,
    type: file.type,
  };
  await set(storageKey, meta);
}

export async function loadKycFiles(): Promise<Record<KycFileKey, File | null>> {
  const [docMeta, docBackMeta, selfieMeta] = await Promise.all([
    get<StoredFileMeta>(KYC_DOCUMENT_KEY),
    get<StoredFileMeta>(KYC_DOCUMENT_BACK_KEY),
    get<StoredFileMeta>(KYC_SELFIE_KEY),
  ]);

  const restore = (meta: StoredFileMeta | undefined) =>
    meta ? blobToFile(meta.blob, meta.fileName, meta.type) : null;

  return {
    kycDocument: restore(docMeta),
    kycDocumentBack: restore(docBackMeta),
    kycSelfie: restore(selfieMeta),
  };
}

export async function clearKycFile(key: KycFileKey): Promise<void> {
  await del(getStorageKey(key));
}

export async function clearKycFiles(): Promise<void> {
  await Promise.all(Object.values(STORAGE_KEYS).map((key) => del(key)));
}
