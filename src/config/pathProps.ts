import {
  DefaultPathPropertyDefinitions,
  SimplePathPropertyDefinitions,
} from './pathProps.types';

export const defaultPathProps: DefaultPathPropertyDefinitions = {
  ogTunnel: {
    name: 'Surface Tunnel',
    colour: '984ea3',
    cbfColour: '2166ac',
    isExterior: false,
    isNatural: false,
  },
  ugTunnel: {
    name: 'Underground Tunnel',
    colour: '377eb8',
    cbfColour: '4393c3',
    isExterior: false,
    isNatural: false,
  },
  cBridge: {
    name: 'Covered Bridge',
    colour: '4daf4a',
    cbfColour: '92c5de',
    isExterior: false,
    isNatural: false,
  },
  oBridge: {
    name: 'Open Bridge',
    colour: 'ffff33',
    cbfColour: 'd1e5f0',
    isExterior: true,
    isNatural: false,
  },
  exPath: {
    name: 'Open Path',
    colour: 'e41a1c',
    cbfColour: 'e41a1c',
    isExterior: true,
    isNatural: true,
  },
  nCave: {
    name: 'Cave',
    colour: 'ff7f00',
    cbfColour: 'fddbc7',
    isExterior: false,
    isNatural: true,
  },
  ladder: {
    name: 'Ladder',
    colour: 'cccccc',
    cbfColour: 'f7f7f7',
    isExterior: true,
    isNatural: false,
  },
  bastion: {
    name: 'Bastion',
    colour: 'a65628',
    cbfColour: 'f4a582',
    isExterior: true,
    isNatural: true,
  },
  nFortress: {
    name: 'Nether Fortress',
    colour: 'f781bf',
    cbfColour: 'd6604d',
    isExterior: true,
    isNatural: true,
  },
};

export const simplePathProps: SimplePathPropertyDefinitions = {
  simpleInterior: {
    name: 'Interior',
    colour: '377eb8',
  },
  simpleExterior: {
    name: 'Exterior',
    colour: 'e41a1c',
  },
  simpleNatural: {
    name: 'Natural',
    colour: 'ff7f00',
  },
  simpleArtificial: {
    name: 'Artificial',
    colour: '984ea3',
  },
};
