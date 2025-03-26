import type { Container, interfaces } from 'inversify';

import type { AsyncOperation } from '@nidavellirx/meowv-core';

import type { RemoteEndpoint } from '@/networking';

export function bindOperation<T extends AsyncOperation<any, any>>(
  operationSymbol: interfaces.ServiceIdentifier<T>,
) {
  return {
    withEndpoint(
      endpointSymbol: interfaces.ServiceIdentifier<
        RemoteEndpoint<any, any, any, any>
      >,
    ) {
      return {
        toResource<Resource extends AsyncOperation<any, any>>(
          ResourceClass: interfaces.Newable<Resource>,
        ) {
          return {
            intoContainer(container: Container) {
              container.bind<T>(operationSymbol).toDynamicValue((context) => {
                const endpoint =
                  context.container.get<RemoteEndpoint<any, any, any, any>>(
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
  _context: interfaces.Context,
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
