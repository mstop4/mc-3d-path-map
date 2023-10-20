import colorbrewer from 'colorbrewer';
import {
  DefaultPathPropertyDefinitions,
  SimplePathPropertyDefinitions,
} from './pathProps.types.ts';

const defaultColourScheme = colorbrewer.Set1[9];
const cbfColourScheme = colorbrewer.RdYlBu[5];

function removePoundSign(rgbHexCode: string) {
  return rgbHexCode.replace('#', '');
}

export const defaultPathProps: DefaultPathPropertyDefinitions = {
  ugTunnel: {
    name: 'Underground Tunnel',
    colour: removePoundSign(defaultColourScheme[1]),
    cbfColour: removePoundSign(cbfColourScheme[4]),
    cbfIsDashed: false,
    isExterior: false,
    isNatural: false,
  },
  ogTunnel: {
    name: 'Surface Tunnel',
    colour: removePoundSign(defaultColourScheme[3]),
    cbfColour: removePoundSign(cbfColourScheme[4]),
    cbfIsDashed: true,
    isExterior: false,
    isNatural: false,
  },
  cBridge: {
    name: 'Covered Bridge',
    colour: removePoundSign(defaultColourScheme[2]),
    cbfColour: removePoundSign(cbfColourScheme[3]),
    cbfIsDashed: false,
    isExterior: false,
    isNatural: false,
  },
  oBridge: {
    name: 'Open Bridge',
    colour: removePoundSign(defaultColourScheme[5]),
    cbfColour: removePoundSign(cbfColourScheme[3]),
    cbfIsDashed: true,
    isExterior: true,
    isNatural: false,
  },
  nCave: {
    name: 'Cave',
    colour: removePoundSign(defaultColourScheme[4]),
    cbfColour: removePoundSign(cbfColourScheme[0]),
    cbfIsDashed: false,
    isExterior: false,
    isNatural: true,
  },
  exPath: {
    name: 'Open Path',
    colour: removePoundSign(defaultColourScheme[0]),
    cbfColour: removePoundSign(cbfColourScheme[0]),
    cbfIsDashed: true,
    isExterior: true,
    isNatural: true,
  },
  ladder: {
    name: 'Ladder',
    colour: 'eeeeee',
    cbfColour: removePoundSign(cbfColourScheme[2]),
    cbfIsDashed: true,
    isExterior: true,
    isNatural: false,
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
