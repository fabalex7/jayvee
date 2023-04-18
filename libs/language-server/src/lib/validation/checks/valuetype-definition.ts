// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * See the FAQ section of README.md for an explanation why the following ESLint rule is disabled for this file.
 */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ValidationAcceptor } from 'langium';

import {
  PropertyValuetype,
  ValuetypeDefinition,
  inferTypesFromValue,
  isConstraintReferenceLiteral,
} from '../../ast';
import { getMetaInformation } from '../../meta-information/meta-inf-registry';

export function validateValuetypeDefinition(
  valuetype: ValuetypeDefinition,
  accept: ValidationAcceptor,
): void {
  checkConstraintsCollectionValues(valuetype, accept);
  checkConstraintsMatchPrimitiveValuetype(valuetype, accept);
}

function checkConstraintsCollectionValues(
  valuetype: ValuetypeDefinition,
  accept: ValidationAcceptor,
): void {
  const constraints = valuetype.constraints;
  constraints.values.forEach((collectionValue) => {
    const types = inferTypesFromValue(collectionValue);
    if (!types.includes(PropertyValuetype.CONSTRAINT)) {
      accept('error', 'Only constraints are allowed in this collection', {
        node: collectionValue,
      });
    }
  });
}

function checkConstraintsMatchPrimitiveValuetype(
  valuetype: ValuetypeDefinition,
  accept: ValidationAcceptor,
): void {
  if (valuetype.type === undefined) {
    return;
  }

  const constraintReferences = valuetype?.constraints?.values.filter(
    isConstraintReferenceLiteral,
  );
  for (const constraintReference of constraintReferences) {
    const constraint = constraintReference?.value.ref;
    const constraintType = constraint?.type;

    if (constraintType === undefined) {
      continue;
    }

    const metaInf = getMetaInformation(constraintType);
    if (metaInf === undefined) {
      continue;
    }

    if (
      !metaInf.compatiblePrimitiveValuetypes.includes(valuetype.type.keyword)
    ) {
      accept(
        'error',
        `Only constraints for type "${valuetype.type.keyword}" are allowed in this collection`,
        {
          node: constraintReference,
        },
      );
    }
  }
}
