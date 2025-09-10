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
    Unauthorized: Symbol.for('DI.Operation.Unauthorized.Operation'),
  },
};

export const Symbols = {
  Routes: Routes,
  DI: DI,
};
