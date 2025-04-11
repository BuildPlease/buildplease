import type {
  Container,
  ResolutionContext,
  ServiceIdentifier,
  Newable,
} from 'inversify';
import type { AsyncOperation } from '@nidavellirx/meowv-core';

import type { RemoteEndpoint } from '@/networking';

export function bindOperation<T extends AsyncOperation<any, any>>(
  operationSymbol: ServiceIdentifier<T>,
) {
  return {
    withEndpoint(
      endpointSymbol: ServiceIdentifier<RemoteEndpoint<any, any, any, any>>,
    ) {
      return {
        toResource<Resource extends AsyncOperation<any, any>>(
          ResourceClass: Newable<Resource>,
        ) {
          return {
            intoContainer(container: Container) {
              container.bind<T>(operationSymbol).toDynamicValue((context) => {
                const endpoint =
                  context.get<RemoteEndpoint<any, any, any, any>>(
                    endpointSymbol,
                  );
                const additionalDependencies = resolveDependenciesForResource(
                  ResourceClass,
                  context,
                );

                const resourceInstance = new ResourceClass(
                  endpoint,
                  ...additionalDependencies,
                ) as unknown as T;
                return resourceInstance;
              });
            },
          };
        },
      };
    },
  };
}

function resolveDependenciesForResource(
  ResourceClass: any,
  _context: ResolutionContext,
): any[] {
  switch (ResourceClass.name) {
    case 'RemoteResource':
      return [];

    case 'SecuredRemoteResource':
      return [];

    default:
      return [];
  }
}
