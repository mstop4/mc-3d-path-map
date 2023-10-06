import colorbrewer from 'colorbrewer';
import {
  DefaultPathPropertyDefinitions,
  SimplePathPropertyDefinitions,
} from './pathProps.types';

const colourScheme = colorbrewer.Set1[9];

function removePoundSign(rgbHexCode: string) {
  return rgbHexCode.replace('#', '');
}

export const defaultPathProps: DefaultPathPropertyDefinitions = {
  ogTunnel: {
    name: 'Surface Tunnel',
    colour: removePoundSign(colourScheme[6]),
    cbfColour: '2166ac',
    isExterior: false,
    isNatural: false,
  },
  ugTunnel: {
    name: 'Underground Tunnel',
    colour: removePoundSign(colourScheme[1]),
    cbfColour: '87CEFA',
    isExterior: false,
    isNatural: false,
  },
  cBridge: {
    name: 'Covered Bridge',
    colour: removePoundSign(colourScheme[2]),
    cbfColour: '92c5de',
    isExterior: false,
    isNatural: false,
  },
  oBridge: {
    name: 'Open Bridge',
    colour: removePoundSign(colourScheme[5]),
    cbfColour: 'd1e5f0',
    isExterior: true,
    isNatural: false,
  },
  exPath: {
    name: 'Open Path',
    colour: removePoundSign(colourScheme[0]),
    cbfColour: 'e41a1c',
    isExterior: true,
    isNatural: true,
  },
  nCave: {
    name: 'Cave',
    colour: removePoundSign(colourScheme[4]),
    cbfColour: 'fddbc7',
    isExterior: false,
    isNatural: true,
  },
  ladder: {
    name: 'Ladder',
    colour: removePoundSign(colourScheme[8]),
    cbfColour: 'f7f7f7',
    isExterior: true,
    isNatural: false,
  },
  bastion: {
    name: 'Bastion',
    colour: removePoundSign(colourScheme[3]),
    cbfColour: 'f4a582',
    isExterior: true,
    isNatural: true,
  },
  nFortress: {
    name: 'Nether Fortress',
    colour: removePoundSign(colourScheme[7]),
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
