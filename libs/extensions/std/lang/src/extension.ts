import { RdbmsLangExtension } from '@jvalue/extensions/rdbms/lang';
import { TabularLangExtension } from '@jvalue/extensions/tabular/lang';
import {
  BlockMetaInformation,
  ConstructorClass,
  JayveeLangExtension,
} from '@jvalue/language-server';

import { ArchiveInterpreterMetaInformation } from './archive-interpreter-meta-inf';
import { FilePickerMetaInformation } from './file-picker-meta-inf';
import { HttpExtractorMetaInformation } from './http-extractor-meta-inf';

export class StdLangExtension implements JayveeLangExtension {
  private readonly wrappedExtensions: JayveeLangExtension[] = [
    new TabularLangExtension(),
    new RdbmsLangExtension(),
  ];

  getBlockMetaInf(): Array<ConstructorClass<BlockMetaInformation>> {
    return [
      ...this.wrappedExtensions.map((x) => x.getBlockMetaInf()).flat(),
      HttpExtractorMetaInformation,
      ArchiveInterpreterMetaInformation,
      FilePickerMetaInformation,
    ];
  }
}
