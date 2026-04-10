import { config } from "@/config";

export const policyQueryKey = ["public", "policy"] as const;
export const POLICY_STALE_TIME = 30 * 60 * 1000; // 30 minutes
export const POLICY_GC_TIME = 24 * 60 * 60 * 1000; // 24 hours

const POLICY_STORAGE_KEY = "rabotka-policy-markdown-cache-v1";

export const fallbackPolicyMarkdown = `# Conditions Générales d'Utilisation

Dernière mise à jour : avril 2026

Bienvenue sur la plateforme Rabotka.

## 1. Objet

Les présentes CGU définissent les modalités d'utilisation de la plateforme.

## 2. Accès à la plateforme

L'inscription implique l'acceptation des présentes conditions.

## 3. Données et responsabilités

L'utilisateur s'engage à fournir des informations exactes et à jour.`;

export async function fetchPolicyFromServer(): Promise<string> {
  const res = await fetch(`${config.apiUrl}/public/documents/policy`);
  if (!res.ok) throw new Error("Failed to load policy");

  const contentType = res.headers.get("content-type") ?? "";
  if (
    contentType.includes("text/markdown") ||
    contentType.includes("text/plain")
  ) {
    return res.text();
  }

  throw new Error("Policy is not in markdown format");
}

export function readPolicyFromStorage(): string | null {
  if (!globalThis.window) return null;
  try {
    const value = globalThis.localStorage.getItem(POLICY_STORAGE_KEY);
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  } catch {
    return null;
  }
}

export function writePolicyToStorage(markdown: string): void {
  if (!globalThis.window) return;
  try {
    globalThis.localStorage.setItem(POLICY_STORAGE_KEY, markdown);
  } catch {
    // Ignore storage failures (private mode / quota / disabled storage).
  }
}

export async function getPolicyContent(): Promise<string> {
  try {
    const serverPolicy = await fetchPolicyFromServer();
    writePolicyToStorage(serverPolicy);
    return serverPolicy;
  } catch {
    const cachedPolicy = readPolicyFromStorage();
    if (cachedPolicy) return cachedPolicy;
    return fallbackPolicyMarkdown;
  }
}
