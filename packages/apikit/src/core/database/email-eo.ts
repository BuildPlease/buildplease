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
export class EmailEo {
  @prop({
    required: true,
    maxlength: 500,
    validate: isNonEmptyString,
    type: () => String,
  })
  public original!: string;

  @prop({
    required: true,
    maxlength: 500,
    validate: isNonEmptyString,
    type: () => String,
  })
  public normalized!: string;
}
