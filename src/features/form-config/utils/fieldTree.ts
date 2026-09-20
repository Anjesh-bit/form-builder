import { FieldType, MoveDirection } from "../enums";
import type {
  FieldChanges,
  FormConfig,
  FormField,
  GroupField,
  NumberRangeChanges,
} from "../types";

export const findField = (
  fields: FormConfig,
  fieldId: string,
): FormField | undefined => {
  for (const field of fields) {
    const children = field.type === FieldType.Group ? field.children : [];
    const matchingField =
      field.id === fieldId ? field : findField(children, fieldId);

    if (matchingField) return matchingField;
  }
  return undefined;
};

const addFieldToGroup = (
  group: GroupField,
  parentId: string,
  newField: FormField,
): GroupField => {
  const isTargetGroup = group.id === parentId;
  const children = isTargetGroup
    ? [...group.children, newField]
    : addField(group.children, parentId, newField);

  return { ...group, children };
};

export const collectFieldIds = (fields: FormConfig): string[] => {
  const ids: string[] = [];

  for (const field of fields) {
    ids.push(field.id);

    if (field.type === FieldType.Group)
      ids.push(...collectFieldIds(field.children));
  }

  return ids;
};

export const addField = (
  fields: FormConfig,
  parentId: string | null,
  newField: FormField,
): FormConfig => {
  if (parentId === null) return [...fields, newField];

  return fields.map((field) =>
    field.type === FieldType.Group
      ? addFieldToGroup(field, parentId, newField)
      : field,
  );
};

export const removeField = (fields: FormConfig, fieldId: string): FormConfig =>
  fields
    .filter(({ id }) => id !== fieldId)
    .map((field) =>
      field.type === FieldType.Group
        ? { ...field, children: removeField(field.children, fieldId) }
        : field,
    );

const transformField = (
  fields: FormConfig,
  fieldId: string,
  transform: (field: FormField) => FormField,
): FormConfig =>
  fields.map((field) => {
    if (field.id === fieldId) return transform(field);

    if (field.type === FieldType.Group)
      return {
        ...field,
        children: transformField(field.children, fieldId, transform),
      };

    return field;
  });

export const updateField = (
  fields: FormConfig,
  fieldId: string,
  changes: FieldChanges,
): FormConfig =>
  transformField(fields, fieldId, (field) => ({ ...field, ...changes }));

export const updateNumberRange = (
  fields: FormConfig,
  fieldId: string,
  range: NumberRangeChanges,
): FormConfig =>
  transformField(fields, fieldId, (field) =>
    field.type === FieldType.Number ? { ...field, ...range } : field,
  );

const swapWithNeighbor = (
  fields: FormConfig,
  fieldIndex: number,
  direction: MoveDirection,
): FormConfig => {
  const targetIndex =
    direction === MoveDirection.Up ? fieldIndex - 1 : fieldIndex + 1;
  const isWithinBounds = targetIndex >= 0 && targetIndex < fields.length;

  if (isWithinBounds) {
    const reorderedFields = [...fields];
    [reorderedFields[fieldIndex], reorderedFields[targetIndex]] = [
      reorderedFields[targetIndex],
      reorderedFields[fieldIndex],
    ];
    return reorderedFields;
  }

  return fields;
};

export const moveField = (
  fields: FormConfig,
  fieldId: string,
  direction: MoveDirection,
): FormConfig => {
  const fieldIndex = fields.findIndex(({ id }) => id === fieldId);
  const isFieldAtThisLevel = fieldIndex !== -1;

  if (isFieldAtThisLevel)
    return swapWithNeighbor(fields, fieldIndex, direction);

  return fields.map((field) =>
    field.type === FieldType.Group
      ? { ...field, children: moveField(field.children, fieldId, direction) }
      : field,
  );
};
