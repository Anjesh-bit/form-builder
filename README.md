# Form Builder

Build a form, see it working right away, and save or load it as JSON.

This is a small React + TypeScript app. You design a form on the left, watch it
come to life in the middle, and copy the whole thing in or out as JSON on the
right.

## What you can do

- **Build a form.** Add text fields, number fields, and groups. Change a
  field's label, mark it as required, set a min and max on numbers, move fields
  up and down, or delete them. Groups can hold other groups, as deep as you like.
- **Try it out.** The preview shows the real form and checks your answers as you
  type. Errors stay quiet until you leave a field, or until you press
  "Validate form", so nobody is scolded for a field they haven't reached yet.
- **Save and load.** Export gives you the form as JSON. Import reads it back. If
  the JSON is wrong, the error tells you exactly where, for example
  `fields[0].children[1].label must be a non-empty string.`

## Getting started

```bash
npm install
npm run dev     # start the app
npm test        # run the tests
npm run lint    # check the code for common mistakes
npm run format  # tidy up formatting (use format:check to only look)
npm run build   # type-check everything and make a production build
```

## How the code is organized

```
src/
  app/                        The page layout
  styles/                     Global styles
  features/
    form-config/              The heart of the app: what a form _is_
      types.ts, enums.ts, constants.ts
      formConfigReducer.ts    Decides how the form changes for each action
      formConfigContext.ts    Lets components read the form and change it
      FormConfigProvider.tsx  Connects the two above
      utils/                  Plain functions, each with a test file beside it:
                              fieldTree, formValidation, configSerialization,
                              createDefaultFormConfig, generateFieldId
    form-editor/              The builder on the left
    form-preview/             The live preview in the middle
    config-transfer/          Export / import on the right
```

A few naming habits used throughout:

- Folders are `kebab-case`.
- Components are `PascalCase`, and their CSS file sits right beside them.
- Hooks start with `use`.
- Everything else is `camelCase`.
- Files named `types.ts`, `enums.ts` and `constants.ts` mean "the ones for this
  folder", so they don't repeat the folder's name.

**The one big idea:** the important logic (changing the form tree, validating,
importing, exporting) lives in `form-config/utils` as plain functions that know
nothing about React. That makes them easy to test, and it keeps the components
small and boring, which is how we like them.

## Why it's built this way

These are the choices worth knowing about, each with the reason behind it.

- **A field is one of three exact shapes.** Text, number or group, told apart by
  its `type`. That means only number fields have a `min` and `max`, and only
  groups have `children`. TypeScript then catches mistakes for us, and there
  are no `as` casts anywhere.
- **Edits are deliberately narrow.** You can change a field's label and required
  flag, and you can change a number's range, but you can't accidentally change
  a field's type or give a text field a `min`. Number limits go through their
  own function that quietly does nothing on any other kind of field.
- **The form is never edited in place.** Every change returns a fresh copy and
  only rebuilds the part of the tree that actually changed. That is what lets
  React see what changed.
- **Two contexts instead of one.** One holds the form, the other holds the
  actions (add, remove, move...). The actions never change, so components that
  only _do_ things, like the field editor, don't redraw every time the form
  changes.
- **The preview keeps its own notes.** What someone has typed, which fields they
  have visited, and whether they've pressed submit all live in the preview, not
  in the form definition. They describe a person filling in the form, not the
  form itself.
- **The preview tidies up after itself.** If you delete a field or import a new
  form, the preview forgets what was typed into fields that no longer exist.
- **Errors are friendly to screen readers.** Each message is announced when it
  appears and is linked to its input, so assistive tools read it with the field.
- **The min/max check happens in two places, with different manners.** Importing
  a form where `min` is bigger than `max` is rejected with a clear message. In
  the editor we don't block you, because typing `min = 10` while `max` is still
  `5` is a normal moment on the way to a valid range. Instead the inputs are
  flagged and a message explains what's wrong.
- **Ids are for the running app only.** They are made with
  `crypto.randomUUID()` and are not exported. Importing hands out fresh ids, so
  a form survives a round trip in shape but not in ids.

## The validation rules

- An empty field that isn't required is always fine, even if it has a `min`.
- A required field needs something in it. Spaces alone don't count.
- A number field must contain an actual number and stay inside its `min` and
  `max`. A limit of `0` is a real limit, not "no limit".
- A required group is happy as soon as at least one field inside it, at any
  depth, has a value.
