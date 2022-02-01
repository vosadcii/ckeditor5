import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

// MODIFIED
import {
  toWidget,
  viewToModelPositionOutsideModelElement,
} from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";

import MergeFieldCommand from "./mergeFieldCommand";

export default class MergeFieldEditing extends Plugin {
  static get requires() {
    return [Widget];
  }
  init() {
    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add("mergefield", new MergeFieldCommand(this.editor));

    this.editor.editing.mapper.on(
      "viewToModelPosition",
      viewToModelPositionOutsideModelElement(this.editor.model, (viewElement) =>
        viewElement.hasClass("mergefield")
      )
    );

    this.editor.config.define("mergeFieldsConfig", {
      types: ["Name", "Date"],
    });
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("mergefield", {
      // Allow wherever text is allowed:
      allowWhere: "$text",

      // The merge field will act as an inline node:
      isInline: true,

      // The inline widget is self-contained so it cannot be split by the caret and can be selected:
      isObject: true,

      // The inline widget can have the same attributes as text (for example linkHref, bold).
      allowAttributesOf: "$text",

      // The merge fields can have many types, like date, name, surname, etc:
      allowAttributes: ["name"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: ["mergefield"],
      },
      model: (viewElement, { writer: modelWriter }) => {
        // Extract the "name" from "[#name]".
        const name = viewElement.getChild(0).data.slice(2, -1);

        return modelWriter.createElement("mergefield", { name });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "mergefield",
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createMergeFieldView(modelItem, viewWriter);

        // Enable widget handling on a merge field element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "mergefield",
      view: (modelItem, { writer: viewWriter }) =>
        createMergeFieldView(modelItem, viewWriter),
    });

    // Helper method for both downcast converters.
    function createMergeFieldView(modelItem, viewWriter) {
      const name = modelItem.getAttribute("name");

      const mergeFieldView = viewWriter.createContainerElement(
        "span",
        {
          class: "mergefield",
        },
        {
          isAllowedInsideAttributeElement: true,
        }
      );

      // Insert the merge field name (as a text).
      const innerText = viewWriter.createText("[#" + name + "]");
      viewWriter.insert(
        viewWriter.createPositionAt(mergeFieldView, 0),
        innerText
      );

      return mergeFieldView;
    }
  }
}
