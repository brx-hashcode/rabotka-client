import { get, set, del } from "idb-keyval";

const KYC_DOCUMENT_KEY = "onboarding-kyc-document";
const KYC_SELFIE_KEY = "onboarding-kyc-selfie";

type KycFileKey = "kycDocument" | "kycSelfie";

interface StoredFileMeta {
  blob: Blob;
  fileName: string;
  type: string;
}

function blobToFile(blob: Blob, fileName: string, type: string): File {
  return new File([blob], fileName, { type });
}

function getStorageKey(key: KycFileKey): string {
  return key === "kycDocument" ? KYC_DOCUMENT_KEY : KYC_SELFIE_KEY;
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

export async function loadKycFiles(): Promise<{
  kycDocument: File | null;
  kycSelfie: File | null;
}> {
  const [docMeta, selfieMeta] = await Promise.all([
    get<StoredFileMeta>(KYC_DOCUMENT_KEY),
    get<StoredFileMeta>(KYC_SELFIE_KEY),
  ]);

  return {
    kycDocument: docMeta
      ? blobToFile(docMeta.blob, docMeta.fileName, docMeta.type)
      : null,
    kycSelfie: selfieMeta
      ? blobToFile(selfieMeta.blob, selfieMeta.fileName, selfieMeta.type)
      : null,
  };
}

export async function clearKycFile(key: KycFileKey): Promise<void> {
  await del(getStorageKey(key));
}

export async function clearKycFiles(): Promise<void> {
  await Promise.all([del(KYC_DOCUMENT_KEY), del(KYC_SELFIE_KEY)]);
}
