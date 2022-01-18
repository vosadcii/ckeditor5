/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import stubUid from '../documentlist/_utils/uid';
import DocumentListPropertiesEditing from '../../src/documentlistproperties/documentlistpropertiesediting';
import { modelList, setupTestHelpers } from '../documentlist/_utils/utils';

describe.only( 'DocumentListPropertiesEditing - converters', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot, test;

	testUtils.createSinonSandbox();

	describe( 'list style', () => {
		beforeEach( () => setupEditor( {
			list: {
				properties: {
					styles: true,
					startIndex: false,
					reversed: false
				}
			}
		} ) );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe.only( 'data pipeline', () => {
			beforeEach( () => {
				stubUid( 0 );
			} );

			it( 'should convert single list (type: bulleted)', () => {
				test.data(
					'<ul>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo {style:default}
						* Bar
					` )
				);
			} );

			it( 'should convert single list (type: numbered)', () => {
				test.data(
					'<ol>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:default}
						# Bar
					` )
				);
			} );

			it( 'should convert single list (type: bulleted, style: circle)', () => {
				test.data(
					'<ul style="list-style-type:circle;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo {style:circle}
						* Bar
					` )
				);
			} );

			it( 'should convert single list (type: numbered, style: upper-alpha)', () => {
				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:upper-alpha}
						# Bar
					` )
				);
			} );

			it( 'should convert mixed lists', () => {
				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>OL 1</li>' +
						'<li>OL 2</li>' +
					'</ol>' +
					'<ul style="list-style-type:circle;">' +
						'<li>UL 1</li>' +
						'<li>UL 2</li>' +
					'</ul>',

					modelList( `
						# OL 1 {style:upper-alpha}
						# OL 2
						* UL 1 {style:circle}
						* UL 2
					` )
				);
			} );

			it( 'should convert nested and mixed lists', () => {
				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>OL 1</li>' +
						'<li>OL 2' +
							'<ul style="list-style-type:circle;">' +
								'<li>UL 1</li>' +
								'<li>UL 2</li>' +
							'</ul>' +
						'</li>' +
						'<li>OL 3</li>' +
					'</ol>',

					modelList( `
						# OL 1 {id:000} {style:upper-alpha}
						# OL 2 {id:003}
						  * UL 1 {id:001} {style:circle}
						  * UL 2 {id:002}
						# OL 3 {id:004} 
					` )
				);
			} );

			it( 'should convert when the list is in the middle of the content', () => {
				test.data(
					'<p>Paragraph.</p>' +
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>',

					modelList( `
						Paragraph.
						# Foo {id:000} {style:upper-alpha}
						# Bar {id:001}
						Paragraph.
					` )
				);
			} );

			it( 'view ol converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { styles: 'list-style-type' } );
				}, { priority: 'highest' } );

				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo
						# Bar
					` ),

					'<ol>' +
					'<li>Foo</li>' +
					'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'view ul converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ul', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { styles: 'list-style-type' } );
				}, { priority: 'highest' } );

				test.data(
					'<ul style="list-style-type:circle;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo
						* Bar
					` ),

					'<ul>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>'
				);
			} );

			describe( 'list conversion with surrounding text nodes', () => {
				it( 'should convert a list if raw text is before the list', () => {
					test.data(
						'Foo' +
						'<ul><li>Bar</li></ul>',

						modelList( `
							Foo
							* Bar {id:000} {style:default}
						` ),

						'<p>Foo</p>' +
						'<ul><li>Bar</li></ul>'
					);
				} );

				it( 'should convert a list if raw text is after the list', () => {
					test.data(
						'<ul><li>Foo</li></ul>' +
						'Bar',

						modelList( `
							* Foo {style:default}
							Bar
						` ),

						'<ul><li>Foo</li></ul>' +
						'<p>Bar</p>'
					);
				} );

				it( 'should convert a list if it is surrounded by two text nodes', () => {
					test.data(
						'Foo' +
						'<ul><li>Bar</li></ul>' +
						'Baz',

						modelList( `
							Foo
							* Bar {id:000} {style:default}
							Baz
						` ),

						'<p>Foo</p>' +
						'<ul><li>Bar</li></ul>' +
						'<p>Baz</p>'
					);
				} );
			} );
		} );

		describe( 'editing pipeline', () => {
			describe( 'insert', () => {
				it( 'should convert single list (type: bulleted, style: default)', () => {
					test.insert(
						'<paragraph>x</paragraph>' +
						'[<paragraph listIndent="0" listItemId="000" listType="bulleted" listStyle="default">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="001" listType="bulleted" listStyle="default">Bar</paragraph>]',

						'<p>x</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert single list (type: bulleted, style: circle)', () => {
					test.insert(
						'<paragraph>x</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listStyle="circle">Foo</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted" listStyle="circle">Bar</paragraph>]',

						'<p>x</p>' +
						'<ul style="list-style-type:circle">' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert nested bulleted list (main: circle, nested: disc)', () => {
					test.insert(
						'<paragraph>x</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listStyle="circle">Foo 1</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted" listStyle="disc">Bar 1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted" listStyle="disc">Bar 2</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted" listStyle="circle">Foo 2</paragraph>' +
						'<paragraph listIndent="0" listItemId="e" listType="bulleted" listStyle="circle">Foo 3</paragraph>]',

						'<p>x</p>' +
						'<ul style="list-style-type:circle">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">Foo 1</span>' +
								'<ul style="list-style-type:disc">' +
									'<li><span class="ck-list-bogus-paragraph">Bar 1</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">Bar 2</span></li>' +
								'</ul>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 2</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 3</span></li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert properly nested list styles', () => {
					// ■ Level 0
					//     ▶ Level 0.1
					//         ○ Level 0.1.1
					//     ▶ Level 0.2
					//         ○ Level 0.2.1
					test.insert(
						'<paragraph>x</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listStyle="default">Level 0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted" listStyle="default">Level 0.1</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted" listStyle="circle">Level 0.1.1</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted" listStyle="default">Level 0.2</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted" listStyle="circle">Level 0.2.1</paragraph>]',

						'<p>x</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Level 0</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.1</span>' +
										'<ul style="list-style-type:circle">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.1.1</span></li>' +
										'</ul>' +
									'</li>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.2</span>' +
										'<ul style="list-style-type:circle">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.2.1</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				// TODO multi-block
				// TODO inserting list items/blocks into other lists
			} );

			describe( 'remove', () => {
				// TODO
			} );

			describe( 'change type', () => {
				// TODO
			} );

			describe( 'change style', () => {
				// TODO
			} );
		} );
	} );

	async function setupEditor( config = {} ) {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, DocumentListPropertiesEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, AlignmentEditing ],
			...config
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;
		viewDoc = view.document;
		viewRoot = viewDoc.getRoot();

		model.schema.register( 'foo', {
			allowWhere: '$block',
			allowAttributesOf: '$container',
			isBlock: true,
			isObject: true
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );

		test = setupTestHelpers( editor );
	}
} );