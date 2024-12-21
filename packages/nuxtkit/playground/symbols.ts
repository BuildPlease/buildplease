const DI = {
  Feature: {
    Login: {
      ViewModel: Symbol.for('DI.Feature.Login.ViewModel'),
      Controller: Symbol.for('DI.Feature.Login.Controller'),
    },
  },
};

export const Symbols = {
  DI: DI,
};
