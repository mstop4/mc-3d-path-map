export type DefaultPathPropertyDefinition = {
  name: string;
  colour: string;
  isExterior: boolean;
  isNatural: boolean;
};

export type SimplePathPropertyDefinition = {
  name: string;
  colour: string;
};

export type DefaultPathPropertyDefinitions = Record<
  string,
  DefaultPathPropertyDefinition
>;
export type SimplePathPropertyDefinitions = Record<
  string,
  SimplePathPropertyDefinition
>;

export const defaultPathProps: DefaultPathPropertyDefinitions = {
  ogTunnel: {
    name: 'Surface Tunnel',
    colour: '8090ff',
    isExterior: false,
    isNatural: false,
  },
  ugTunnel: {
    name: 'Underground Tunnel',
    colour: '80b0d0',
    isExterior: false,
    isNatural: false,
  },
  cBridge: {
    name: 'Covered Bridge',
    colour: '80ff80',
    isExterior: false,
    isNatural: false,
  },
  oBridge: {
    name: 'Open Bridge',
    colour: 'ffd040',
    isExterior: true,
    isNatural: false,
  },
  exPath: {
    name: 'Open Path',
    colour: 'c00000',
    isExterior: true,
    isNatural: true,
  },
  nCave: {
    name: 'Cave',
    colour: 'c06000',
    isExterior: false,
    isNatural: true,
  },
  ladder: {
    name: 'Ladder',
    colour: 'ffffff',
    isExterior: true,
    isNatural: false,
  },
  bastion: {
    name: 'Bastion',
    colour: '404080',
    isExterior: true,
    isNatural: true,
  },
};

export const simplePathProps: SimplePathPropertyDefinitions = {
  simpleInterior: {
    name: 'Interior',
    colour: '80b0d0',
  },
  simpleExterior: {
    name: 'Exterior',
    colour: 'c00000',
  },
  simpleNatural: {
    name: 'Natural',
    colour: 'c06000',
  },
  simpleArtificial: {
    name: 'Artificial',
    colour: '80ff80',
  },
};
