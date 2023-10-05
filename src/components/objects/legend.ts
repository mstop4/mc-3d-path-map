import {
  DefaultPathProperties,
  DefaultPathPropertyDefinitions,
  SimplePathProperties,
  SimplePathPropertyDefinitions,
} from '../../config/pathProps.types';

import { defaultPathProps, simplePathProps } from '../../config/pathProps';

let legendContainer: HTMLElement | null;
const legends: HTMLElement[] = [];

export function setupLegend() {
  legendContainer = document.getElementById('legendContainer');
  if (legendContainer === null) return;

  const defaultLegendDiv = createLegend(defaultPathProps, 'full');
  legendContainer.appendChild(defaultLegendDiv);
  legends.push(defaultLegendDiv);

  const extSimpleLegendDiv = createLegend(
    {
      simpleInterior: simplePathProps.simpleInterior,
      simpleExterior: simplePathProps.simpleExterior,
    },
    'full',
  );
  legendContainer.appendChild(extSimpleLegendDiv);
  legends.push(extSimpleLegendDiv);

  const natSimpleLegendDiv = createLegend(
    {
      simpleNatural: simplePathProps.simpleNatural,
      simpleArtificial: simplePathProps.simpleArtificial,
    },
    'full',
  );
  legendContainer.appendChild(natSimpleLegendDiv);
  legends.push(natSimpleLegendDiv);

  switchLegend(0);
}

function createLegend(
  propDefs: DefaultPathPropertyDefinitions | SimplePathPropertyDefinitions,
  id: string,
) {
  const legendDiv = document.createElement('div');
  legendDiv.id = id;
  legendDiv.className = 'legend';
  const legendElemList = document.createElement('ul');
  legendDiv.appendChild(legendElemList);

  for (const propName in propDefs) {
    const listElem = createLegendElement(propDefs[propName]);
    legendElemList.appendChild(listElem);
  }

  return legendDiv;
}

function createLegendElement(
  propDef: DefaultPathProperties | SimplePathProperties,
) {
  const listElem = document.createElement('li');
  const swatch = document.createElement('span');
  const label = document.createElement('span');

  listElem.className = 'legendElem';

  swatch.className = 'legendSwatch';
  swatch.style.backgroundColor = `#${propDef.colour}`;
  label.innerHTML = propDef.name;

  listElem.appendChild(swatch);
  listElem.appendChild(label);

  return listElem;
}

export function switchLegend(index: number) {
  legends.forEach(
    (legend, i) => (legend.style.display = index === i ? 'block' : 'none'),
  );
}

export function showLegend() {
  if (legendContainer) {
    legendContainer.style.display = 'block';
  }
}

export function hideLegend() {
  if (legendContainer) {
    legendContainer.style.display = 'none';
  }
}
