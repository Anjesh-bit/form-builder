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
    : insertField(group.children, parentId, newField);

  return withChildren(group, children);
};

const insertField = (
  fields: FormConfig,
  parentId: string,
  newField: FormField,
): FormConfig => {
  const nextFields = fields.map((field) =>
    field.type === FieldType.Group
      ? addFieldToGroup(field, parentId, newField)
      : field,
  );

  return reuseIfUnchanged(fields, nextFields);
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

  const nextFields = insertField(fields, parentId, newField);
  const isParentFound = nextFields !== fields;

  if (!isParentFound)
    throw new Error(`Cannot add field: no group with id "${parentId}".`);

  return nextFields;
};

const reuseIfUnchanged = (
  original: FormConfig,
  next: FormConfig,
): FormConfig => {
  const isUnchanged =
    original.length === next.length &&
    original.every((field, index) => field === next[index]);

  return isUnchanged ? original : next;
};

const withChildren = (group: GroupField, children: FormConfig): GroupField =>
  children === group.children ? group : { ...group, children };

export const removeField = (
  fields: FormConfig,
  fieldId: string,
): FormConfig => {
  const nextFields = fields
    .filter(({ id }) => id !== fieldId)
    .map((field) =>
      field.type === FieldType.Group
        ? withChildren(field, removeField(field.children, fieldId))
        : field,
    );

  return reuseIfUnchanged(fields, nextFields);
};

const transformField = (
  fields: FormConfig,
  fieldId: string,
  transform: (field: FormField) => FormField,
): FormConfig => {
  const nextFields = fields.map((field) => {
    if (field.id === fieldId) return transform(field);

    if (field.type === FieldType.Group)
      return withChildren(
        field,
        transformField(field.children, fieldId, transform),
      );

    return field;
  });

  return reuseIfUnchanged(fields, nextFields);
};

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

  const nextFields = fields.map((field) =>
    field.type === FieldType.Group
      ? withChildren(field, moveField(field.children, fieldId, direction))
      : field,
  );

  return reuseIfUnchanged(fields, nextFields);
};
