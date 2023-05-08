// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import { PropertyValuetype } from '../../model-util';
import { DefaultUnaryOperatorTypeComputer } from '../operator-type-computer';

export class SignOperatorTypeComputer extends DefaultUnaryOperatorTypeComputer {
  constructor() {
    super(PropertyValuetype.DECIMAL);
  }

  override doComputeType(operandType: PropertyValuetype): PropertyValuetype {
    return operandType;
  }
}
