export interface Resource {
  /** Stable slug, unique across the catalog. */
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly type: string;
  readonly category: string;
  readonly tags?: readonly string[];
  /** Preview image URL. */
  readonly image?: string;
  /** Source code URL. */
  readonly repository?: string;
}
