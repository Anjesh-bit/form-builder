import { generateFieldId } from "./generateFieldId";
import { FieldType } from "../enums";
import type { FormConfig } from "../types";

export const createDefaultFormConfig = (): FormConfig => [
  {
    id: generateFieldId(FieldType.Text),
    type: FieldType.Text,
    label: "Full name",
    required: true,
  },
  {
    id: generateFieldId(FieldType.Number),
    type: FieldType.Number,
    label: "Age",
    required: false,
    min: 18,
    max: 99,
  },
  {
    id: generateFieldId(FieldType.Group),
    type: FieldType.Group,
    label: "Address",
    required: false,
    children: [
      {
        id: generateFieldId(FieldType.Text),
        type: FieldType.Text,
        label: "City",
        required: false,
      },
      {
        id: generateFieldId(FieldType.Text),
        type: FieldType.Text,
        label: "Street",
        required: false,
      },
    ],
  },
];
