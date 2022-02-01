import Command from '@ckeditor/ckeditor5-core/src/command';

export default class MergeFieldCommand extends Command {
	execute({ value }) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		editor.model.change((writer) => {
			// Create a <mergefield> elment with the "name" attribute (and all the selection attributes)...
			const mergeField = writer.createElement('mergefield', {
				...Object.fromEntries(selection.getAttributes()),
				name: value,
			});

			// ... and insert it into the document.
			editor.model.insertContent(mergeField);

			// Put the selection on the inserted element.
			writer.setSelection(mergeField, 'on');
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		const isAllowed = model.schema.checkChild(
			selection.focus.parent,
			'mergefield'
		);

		this.isEnabled = isAllowed;
	}
}
