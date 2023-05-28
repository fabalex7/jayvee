// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StdLangExtension } from '@jvalue/jayvee-extensions/std/lang';
import { AstNode, AstNodeLocator, LangiumDocument } from 'langium';
import { NodeFileSystem } from 'langium/node';

import {
  PipeDefinition,
  ValidationContext,
  createJayveeServices,
  useExtension,
} from '../../../lib';
import { validatePipeDefinition } from '../../../lib/validation/checks/pipe-definition';
import {
  ParseHelperOptions,
  expectNoParserAndLexerErrors,
  parseHelper,
  readJvTestAsset,
  validationAcceptorMockImpl,
} from '../../../test';

describe('pipe-definition validation tests', () => {
  let parse: (
    input: string,
    options?: ParseHelperOptions,
  ) => Promise<LangiumDocument<AstNode>>;

  const validationAcceptorMock = jest.fn(validationAcceptorMockImpl);

  let locator: AstNodeLocator;

  beforeAll(() => {
    // Register std extension
    useExtension(new StdLangExtension());
    // Create language services
    const services = createJayveeServices(NodeFileSystem).Jayvee;
    locator = services.workspace.AstNodeLocator;
    // Parse function for Jayvee (without validation)
    parse = parseHelper(services);
  });

  afterEach(() => {
    // Reset mock
    validationAcceptorMock.mockReset();
  });

  describe('single pipe', () => {
    // This test should succeed, because the error is thrown by langium during linking, not during validation!
    it('should have no error even if pipe references non existing block', async () => {
      const text = readJvTestAsset(
        'pipe-definition/single/valid-undefined-block.jv',
      );

      const document = await parse(text);
      expectNoParserAndLexerErrors(document);

      const pipe = locator.getAstNode<PipeDefinition>(
        document.parseResult.value,
        'pipelines@0/pipes@0',
      ) as PipeDefinition;

      validatePipeDefinition(
        pipe,
        new ValidationContext(validationAcceptorMock),
      );

      expect(validationAcceptorMock).toHaveBeenCalledTimes(0);
    });

    it('should have no error even if pipe references block of non existing type', async () => {
      const text = readJvTestAsset(
        'pipe-definition/single/valid-unknown-blocktype.jv',
      );

      const document = await parse(text);
      expectNoParserAndLexerErrors(document);

      const pipe = locator.getAstNode<PipeDefinition>(
        document.parseResult.value,
        'pipelines@0/pipes@0',
      ) as PipeDefinition;

      validatePipeDefinition(
        pipe,
        new ValidationContext(validationAcceptorMock),
      );

      expect(validationAcceptorMock).toHaveBeenCalledTimes(0);
    });

    it('error on unsupported pipe between Blocktypes', async () => {
      const text = readJvTestAsset(
        'pipe-definition/single/invalid-pipe-between-blocktypes.jv',
      );

      const document = await parse(text);
      expectNoParserAndLexerErrors(document);

      const pipe = locator.getAstNode<PipeDefinition>(
        document.parseResult.value,
        'pipelines@0/pipes@0',
      ) as PipeDefinition;

      validatePipeDefinition(
        pipe,
        new ValidationContext(validationAcceptorMock),
      );

      expect(validationAcceptorMock).toHaveBeenCalledTimes(2);
      expect(validationAcceptorMock).toHaveBeenNthCalledWith(
        2,
        'error',
        `The output type "File" of HttpExtractor is incompatible with the input type "Table" of SQLiteLoader`,
        expect.any(Object),
      );
    });
  });

  describe('chained pipe', () => {
    // This test should succeed, because the error is thrown by langium during linking, not during validation!
    it('should have no error even if pipe references non existing block', async () => {
      const text = readJvTestAsset(
        'pipe-definition/chained/valid-undefined-block.jv',
      );

      const document = await parse(text);
      expectNoParserAndLexerErrors(document);

      const pipe = locator.getAstNode<PipeDefinition>(
        document.parseResult.value,
        'pipelines@0/pipes@0',
      ) as PipeDefinition;

      validatePipeDefinition(
        pipe,
        new ValidationContext(validationAcceptorMock),
      );

      expect(validationAcceptorMock).toHaveBeenCalledTimes(0);
    });

    it('should have no error even if pipe references block of non existing type', async () => {
      const text = readJvTestAsset(
        'pipe-definition/chained/valid-unknown-blocktype.jv',
      );

      const document = await parse(text);
      expectNoParserAndLexerErrors(document);

      const pipe = locator.getAstNode<PipeDefinition>(
        document.parseResult.value,
        'pipelines@0/pipes@0',
      ) as PipeDefinition;

      validatePipeDefinition(
        pipe,
        new ValidationContext(validationAcceptorMock),
      );

      expect(validationAcceptorMock).toHaveBeenCalledTimes(0);
    });

    it('error on unsupported pipe between Blocktypes', async () => {
      const text = readJvTestAsset(
        'pipe-definition/chained/invalid-pipe-between-blocktypes.jv',
      );

      const document = await parse(text);
      expectNoParserAndLexerErrors(document);

      const pipe = locator.getAstNode<PipeDefinition>(
        document.parseResult.value,
        'pipelines@0/pipes@0',
      ) as PipeDefinition;

      validatePipeDefinition(
        pipe,
        new ValidationContext(validationAcceptorMock),
      );

      expect(validationAcceptorMock).toHaveBeenCalledTimes(2);
      expect(validationAcceptorMock).toHaveBeenNthCalledWith(
        2,
        'error',
        `The output type "File" of HttpExtractor is incompatible with the input type "Table" of SQLiteLoader`,
        expect.any(Object),
      );
    });
  });
});
