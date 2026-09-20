import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IMPORT_ERROR_MESSAGES } from "../features/form-config/constants";
import { TRANSFER_MESSAGES } from "../features/config-transfer/constants";
import App from "./App";

afterEach(cleanup);

const getPreview = () =>
  within(
    screen.getByRole("heading", { name: "Live preview" }).closest("section")!,
  );

describe("App", () => {
  it("shows a field added in the builder in the preview", () => {
    render(<App />);
    expect(getPreview().queryByLabelText("New text field")).toBeNull();

    const addTextButtons = screen.getAllByRole("button", { name: "+ text" });
    fireEvent.click(addTextButtons[addTextButtons.length - 1]);

    expect(getPreview().getByLabelText("New text field")).toBeTruthy();
  });

  it("drops a deleted field's value along with the field", () => {
    render(<App />);
    fireEvent.change(getPreview().getByLabelText(/Full name/), {
      target: { value: "Ada" },
    });
    expect(screen.getByDisplayValue("Ada")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Delete field" })[0]);

    expect(getPreview().queryByLabelText(/Full name/)).toBeNull();
    expect(screen.queryByDisplayValue("Ada")).toBeNull();
  });

  it("renders number fields as decimal text inputs", () => {
    render(<App />);

    const ageInput = getPreview().getByLabelText(/Age/);

    expect(ageInput.getAttribute("inputmode")).toBe("decimal");
    expect(ageInput.getAttribute("type")).not.toBe("number");
  });

  it("renders the path error when importing bad JSON", () => {
    render(<App />);
    const json = JSON.stringify({
      fields: [{ type: "group", label: "g", children: [{ type: "text" }] }],
    });

    fireEvent.change(screen.getByRole("textbox", { name: "" }), {
      target: { value: json },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    expect(
      screen.getByText(
        TRANSFER_MESSAGES.importFailed(
          IMPORT_ERROR_MESSAGES.emptyLabel("fields[0].children[0]"),
        ),
      ),
    ).toBeTruthy();
  });
});
