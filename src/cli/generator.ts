import fs from 'fs';
import path from 'path';

import { CompositeGeneratorNode, NL, processGeneratorNode } from 'langium';

import { Model } from '../language-server/generated/ast';

import { extractDestinationAndName } from './cli-util';

export function generateJavaScript(
  model: Model,
  filePath: string,
  destination: string | undefined,
): string {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

  const fileNode = new CompositeGeneratorNode();
  fileNode.append('"use strict";', NL, NL);
  model.greetings.forEach((greeting) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fileNode.append(`console.log('Hello, ${greeting.person.ref!.name}!');`, NL),
  );

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }
  fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
  return generatedFilePath;
}
