export type DefaultPathProperties = {
  name: string;
  colour: string;
  cbfColour: string;
  cbfIsDashed: boolean;
  isExterior: boolean;
  isNatural: boolean;
};

export type SimplePathProperties = {
  name: string;
  colour: string;
};

export type DefaultPathPropertyDefinitions = Record<
  string,
  DefaultPathProperties
>;
export type SimplePathPropertyDefinitions = Record<
  string,
  SimplePathProperties
>;
