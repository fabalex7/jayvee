// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import { strict as assert } from 'assert';

import * as R from '@jvalue/jayvee-execution';
import {
  AbstractBlockExecutor,
  BlockExecutorClass,
  ExecutionContext,
  PortDetails,
  Table,
  TransformExecutor,
  implementsStatic,
} from '@jvalue/jayvee-execution';
import {
  CollectionValuetype,
  IOType,
  InternalValueRepresentation,
  PrimitiveValuetypes,
} from '@jvalue/jayvee-language-server';

@implementsStatic<BlockExecutorClass>()
export class TableTransformerExecutor extends AbstractBlockExecutor<
  IOType.TABLE,
  IOType.TABLE
> {
  public static readonly type = 'TableTransformer';

  constructor() {
    super(IOType.TABLE, IOType.TABLE);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async doExecute(
    inputTable: Table,
    context: ExecutionContext,
  ): Promise<R.Result<Table>> {
    const inputColumnNames = context.getPropertyValue(
      'inputColumns',
      new CollectionValuetype(PrimitiveValuetypes.Text),
    );
    const outputColumnName = context.getPropertyValue(
      'outputColumn',
      PrimitiveValuetypes.Text,
    );
    const usedTransform = context.getPropertyValue(
      'use',
      PrimitiveValuetypes.Transform,
    );

    const checkInputColumnsExistResult = this.checkInputColumnsExist(
      inputColumnNames,
      inputTable,
      context,
    );
    if (R.isErr(checkInputColumnsExistResult)) {
      return checkInputColumnsExistResult;
    }

    const executor = new TransformExecutor(usedTransform);
    const transformInputDetailsList = executor.getInputDetails();
    const transformOutputDetails = executor.getOutputDetails();

    const checkInputColumnsMatchTransformInputTypesResult =
      this.checkInputColumnsMatchTransformInputTypes(
        inputColumnNames,
        inputTable,
        transformInputDetailsList,
        context,
      );
    if (R.isErr(checkInputColumnsMatchTransformInputTypesResult)) {
      return checkInputColumnsMatchTransformInputTypesResult;
    }
    const variableToColumnMap = R.okData(
      checkInputColumnsMatchTransformInputTypesResult,
    );

    this.logColumnOverwriteStatus(
      inputTable,
      outputColumnName,
      context,
      transformOutputDetails,
    );

    const transformResult = executor.executeTransform(
      variableToColumnMap,
      inputTable.getNumberOfRows(),
      context,
    );

    const outputTable = this.createOutputTable(
      inputTable,
      transformResult,
      outputColumnName,
    );

    return R.ok(outputTable);
  }

  checkInputColumnsMatchTransformInputTypes(
    inputColumnNames: string[],
    inputTable: R.Table,
    transformInputDetailsList: PortDetails[],
    context: R.ExecutionContext,
  ): R.Result<Map<string, R.TableColumn>> {
    const variableToColumnMap: Map<string, R.TableColumn> = new Map();
    for (let i = 0; i < inputColumnNames.length; ++i) {
      const inputColumnName = inputColumnNames[i];
      assert(inputColumnName !== undefined);
      const inputColumn = inputTable.getColumn(inputColumnName);
      assert(inputColumn !== undefined);

      const matchingInputDetails = transformInputDetailsList[i];
      assert(matchingInputDetails !== undefined);

      if (
        !inputColumn.valuetype.isConvertibleTo(matchingInputDetails.valuetype)
      ) {
        return R.err({
          message: `Type ${inputColumn.valuetype.getName()} of column "${inputColumnName}" is not convertible to type ${matchingInputDetails.valuetype.getName()}`,
          diagnostic: {
            node: context.getOrFailProperty('use'),
          },
        });
      }
      const variableName = matchingInputDetails.port.name;
      variableToColumnMap.set(variableName, inputColumn);
    }
    return R.ok(variableToColumnMap);
  }

  checkInputColumnsExist(
    inputColumnNames: string[],
    inputTable: R.Table,
    context: R.ExecutionContext,
  ): R.Result<undefined> {
    // check input columns exist
    let i = 0;
    for (const inputColumnName of inputColumnNames) {
      const inputColumn = inputTable.getColumn(inputColumnName);
      if (inputColumn === undefined) {
        return R.err({
          message: `The specified input column "${inputColumnName}" does not exist in the given table`,
          diagnostic: {
            node: context.getOrFailProperty('inputColumns').value,
            property: 'values',
            index: i,
          },
        });
      }
      ++i;
    }
    return R.ok(undefined);
  }

  private createOutputTable(
    inputTable: R.Table,
    transformResult: {
      resultingColumn: R.TableColumn<InternalValueRepresentation>;
      rowsToDelete: number[];
    },
    outputColumnName: string,
  ) {
    const outputTable = inputTable.clone();
    outputTable.dropRows(transformResult.rowsToDelete);
    outputTable.addColumn(outputColumnName, transformResult.resultingColumn);
    return outputTable;
  }

  private logColumnOverwriteStatus(
    inputTable: R.Table,
    outputColumnName: string,
    context: R.ExecutionContext,
    transformOutputDetails: PortDetails,
  ) {
    const outputColumn = inputTable.getColumn(outputColumnName);
    if (outputColumn !== undefined) {
      context.logger.logInfo(
        `Column "${outputColumnName}" will be overwritten`,
      );

      // log if output column type changes
      if (!outputColumn.valuetype.equals(transformOutputDetails.valuetype)) {
        context.logger.logInfo(
          `Column "${outputColumnName}" will change its type from ${outputColumn.valuetype.getName()} to ${transformOutputDetails.valuetype.getName()}`,
        );
      }
    }
  }
}
