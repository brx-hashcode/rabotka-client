import { BaseController } from "mvc-front-sdk";
import { config } from "@/config";

type RequestBody = Record<string, unknown> | FormData;

// Monotonic counter so two GETs fired within the same millisecond still get
// distinct cache-buster values.
let cacheBusterSeq = 0;

export class RabotkaBaseController extends BaseController {
  constructor() {
    super(config.apiUrl);
  }

  // The app runs inside WhatsApp's in-app WKWebView, whose HTTP cache readily
  // serves cached GET responses without hitting the network — so a React Query
  // refetch after a mutation comes back with stale data and the UI only updates
  // on a manual reload. The underlying SDK issues fetch() with the default
  // cache mode and exposes no way to set `cache: "no-store"`, so we append a
  // unique query param to make every GET URL distinct and thus uncacheable.
  // (A `Cache-Control` request header would be simpler but is not CORS
  // safelisted, so it would require the cross-origin API to allow it.)
  protected bustCache(path: string): string {
    const buster = `_=${Date.now()}${cacheBusterSeq++}`;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${buster}`;
  }

  protected get<T>(
    path: string,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.get<T>(
      this.bustCache(path),
      headers,
      customErrorMessage,
    );
  }

  protected post<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.post<T>(path, body, headers, customErrorMessage);
  }

  protected put<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.put<T>(path, body, headers, customErrorMessage);
  }

  protected patch<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.patch<T>(path, body, headers, customErrorMessage);
  }

  protected delete<T>(
    path: string,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.delete<T>(path, headers, customErrorMessage);
  }
}
