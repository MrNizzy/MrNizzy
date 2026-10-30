import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { environment } from '@env/environment';
import { RESOURCE, Resource, RESOURCES, Resources } from './resource.model';

@Injectable({
  providedIn: 'root',
})
export class ResourceApi {
  getResources() {
    return httpResource<Resources>(
      () => environment.apiUrl + '/api/resources',
      {
        defaultValue: RESOURCES,
      }
    );
  }

  getResource(id: Signal<string>) {
    return httpResource<Resource>(
      () => environment.apiUrl + '/api/resources/' + id(),
      {
        defaultValue: RESOURCE,
      }
    );
  }

  // Increment upvotes by 1
  async upvote(resourceId: string): Promise<void> {
    await fetch(`${environment.apiUrl}/api/resources/${resourceId}/upvote`, {
      method: 'POST',
    });
  }

  // Increment click_count by 1
  async click(resourceId: string): Promise<void> {
    await fetch(`${environment.apiUrl}/api/resources/${resourceId}/click`, {
      method: 'POST',
    });
  }

  // Increment view_count by 1
  async view(resourceId: string): Promise<void> {
    await fetch(`${environment.apiUrl}/api/resources/${resourceId}/view`, {
      method: 'POST',
    });
  }
}

/**
 * Plain-language reason a request failed, safe to show to visitors.
 *
 * `status` is 0 when the request never got an answer (offline, API down).
 */
export function describeLoadError(error: unknown): string {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === 'number' && status > 0
    ? `The server answered with an error (${status}).`
    : "The server couldn't be reached.";
}
