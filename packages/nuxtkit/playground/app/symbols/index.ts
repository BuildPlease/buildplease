import { Symbols as ParentSymbols } from '@buildplease/webkit';

export const Routes = {
  Root: {
    name: '/',
    path: '/',
  },
  Login: {
    name: 'login',
    path: '/login',
  },
  Dashboard: {
    name: 'dashboard',
    path: '/dashboard',
  },
  Zod: {
    Complex: {
      name: 'zod/complex',
      path: '/zod/complex',
    },
  },
} as const;

export const Symbols = ParentSymbols.extend({
  DI: {
    Playground: {
      Feature: {
        Dashboard: {
          ViewModel: Symbol.for('Playground.DI.Feature.Dashboard.ViewModel'),
        },
        Login: {
          Controller: Symbol.for('Playground.DI.Feature.Login.Controller'),
          ViewModel: Symbol.for('Playground.DI.Feature.Login.ViewModel'),
        },
      },
      Networking: {
        DelayedHttpRequestTestClient: Symbol.for('Playground.DI.Networking.DelayedHttpRequestTestClient'),
        HttpClient: Symbol.for('Playground.DI.Networking.HttpClient'),
        HttpRequestTestClient: Symbol.for('Playground.DI.Networking.HttpRequestTestClient'),
      },
      Operation: {
        DelayedHttpRequestTest: Symbol.for('Playground.DI.Operation.DelayedHttpRequestTest'),
        HttpRequestTest: Symbol.for('Playground.DI.Operation.HttpRequestTest'),
        Unauthorized: Symbol.for('Playground.DI.Operation.Unauthorized'),
      },
    },
  },
});
