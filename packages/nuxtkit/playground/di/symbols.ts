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
  DI: DI,
};
