export interface Resource {
  /** Stable slug, unique across the catalog. */
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly type: string;
  readonly category: string;
  /**
   * Date the resource was added to the catalog, ISO `YYYY-MM-DD`. Drives the
   * Newest/Oldest order; on equal dates the entry later in the catalog counts
   * as newer, so appending a resource makes it the newest.
   */
  readonly added: string;
  readonly tags?: readonly string[];
  /** Preview image URL. */
  readonly image?: string;
  /** Source code URL. */
  readonly repository?: string;
}
