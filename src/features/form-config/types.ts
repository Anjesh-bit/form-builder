import type { FieldType } from "./enums";

type BaseField = {
  id: string;
  label: string;
  required: boolean;
};

export type TextField = BaseField & {
  type: FieldType.Text;
};

export type NumberField = BaseField & {
  type: FieldType.Number;
  min?: number;
  max?: number;
};

export type GroupField = BaseField & {
  type: FieldType.Group;
  children: FormField[];
};

export type FormField = TextField | NumberField | GroupField;

export type LeafField = TextField | NumberField;

export type FieldChanges = Partial<Pick<BaseField, "label" | "required">>;

export type NumberRangeChanges = Partial<Pick<NumberField, "min" | "max">>;

export type FormConfig = FormField[];

export type FormValues = Record<string, string>;

export type FormErrors = Record<string, string>;

export type JsonObject = { [key: string]: JsonValue | undefined };

export type JsonValue =
  string | number | boolean | null | JsonValue[] | JsonObject;
