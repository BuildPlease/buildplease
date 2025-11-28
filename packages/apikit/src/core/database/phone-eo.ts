import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { isNonEmptyString } from '@nidavellirx/meowv-core';

@modelOptions({
  schemaOptions: {
    _id: false,
    id: false,
    autoIndex: false,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class PhoneEo {
  @prop({
    required: true,
    maxlength: 100,
    validate: isNonEmptyString,
    type: () => String,
  })
  public e164!: string;

  @prop({
    required: true,
    maxlength: 100,
    validate: isNonEmptyString,
    type: () => String,
  })
  public international!: string;
}
