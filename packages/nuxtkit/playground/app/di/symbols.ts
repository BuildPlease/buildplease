const Routes = {
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
};

const DI = {
  Networking: {
    HttpClient: Symbol.for('DI.Networking.HttpClient'),
    HttpRequestTestClient: Symbol.for('DI.Networking.HttpRequestTestClient'),
    DelayedHttpRequestTestClient: Symbol.for('DI.Networking.DelayedHttpRequestTestClient'),
  },
  Feature: {
    Login: {
      ViewModel: Symbol.for('DI.Feature.Login.ViewModel'),
      Controller: Symbol.for('DI.Feature.Login.Controller'),
    },
    Dashboard: {
      ViewModel: Symbol.for('DI.Feature.Dashboard.ViewModel'),
    },
  },
  Operation: {
    HttpRequestTest: Symbol.for('DI.Operation.HttpRequestTest'),
    DelayedHttpRequestTest: Symbol.for('DI.Operation.DelayedHttpRequestTest'),
    Unauthorized: Symbol.for('DI.Operation.Unauthorized'),
  },
};

export const Symbols = {
  Routes: Routes,
  DI: DI,
};
