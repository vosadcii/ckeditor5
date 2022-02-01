import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

import MergeFieldEditing from "./mergeFieldEditing";
import MergeFieldUi from "./mergeFieldUi";

export default class MergeField extends Plugin {
  static get requires() {
    return [MergeFieldEditing, MergeFieldUi];
  }
}
