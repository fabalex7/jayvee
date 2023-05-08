// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import { PropertyValuetype } from '../../model-util';
import { DefaultBinaryOperatorTypeComputer } from '../operator-type-computer';

export class ExponentialOperatorTypeComputer extends DefaultBinaryOperatorTypeComputer {
  constructor() {
    super(PropertyValuetype.DECIMAL, PropertyValuetype.DECIMAL);
  }

  protected override doComputeType(): PropertyValuetype {
    return PropertyValuetype.DECIMAL;
  }
}
