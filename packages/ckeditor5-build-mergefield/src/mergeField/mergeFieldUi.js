import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {
	addListToDropdown,
	createDropdown,
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

export default class MergeFieldUix extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		let mergeFieldNames = editor.config.get('mergefieldsConfig.types');

		if (!Array.isArray(mergeFieldNames)) mergeFieldNames = [];

		// The "merge field" dropdown must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add('mergefield', (locale) => {
			const dropdownView = createDropdown(locale);

			// Populate the list in the dropdown with items.
			addListToDropdown(
				dropdownView,
				getDropdownItemsDefinitions(mergeFieldNames)
			);

			dropdownView.buttonView.set({
				// The t() function helps localize the editor. All strings enclosed in t() can be
				// translated and change when the language of the editor changes.
				label: t('Merge Fields'),
				tooltip: true,
				withText: true,
			});

			// Disable the merge field button when the command is disabled.
			const command = editor.commands.get('mergefield');
			dropdownView.bind('isEnabled').to(command);

			// Execute the command when the dropdown item is clicked (executed).
			this.listenTo(dropdownView, 'execute', (evt) => {
				editor.execute('mergefield', {
					value: evt.source.commandParam,
				});
				editor.editing.view.focus();
			});

			return dropdownView;
		});
	}
}

function getDropdownItemsDefinitions(mergeFieldNames) {
	const itemDefinitions = new Collection();

	for (const name of mergeFieldNames) {
		const definition = {
			type: 'button',
			model: new Model({
				commandParam: name,
				label: name,
				withText: true,
			}),
		};

		// Add the item definition to the collection.
		itemDefinitions.add(definition);
	}

	return itemDefinitions;
}
