import type { App } from '$lib/core/app';
import { getTriggerTail } from '../shared/ghost';
import {
	getDroppedQuotePair,
	getQuotedArgStart,
	getTypedQuote,
	type QuoteEdit
} from '../shared/quotes';
import type { InputController } from '..';

export class InputKeys {
	constructor(
		private readonly _app: App,
		private readonly _input: InputController
	) {}

	onKeydown(event: KeyboardEvent): void {
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		const { element, suggestions, dispatcher, messages } = this._input;
		const value = element.getValue();

		switch (event.key) {
			case 'Enter':
				if (!value.startsWith('/')) {
					this._app.keys.passToViews(event);
					return;
				}

				event.preventDefault();
				void dispatcher.submit();
				return;

			case 'Tab':
				event.preventDefault();
				dispatcher.complete();
				return;

			case 'ArrowRight':
				if (element.getCaret() !== value.length) return;
				if (!getTriggerTail(value, suggestions.getSelected())) return;
				event.preventDefault();
				dispatcher.complete();
				return;

			case 'ArrowDown':
			case 'ArrowUp':
				if (!suggestions.getSelected()) {
					this._app.keys.passToViews(event);
					return;
				}

				event.preventDefault();
				suggestions.move(event.key === 'ArrowDown' ? 1 : -1);
				return;

			case 'Escape':
				event.preventDefault();
				messages.clear();
				element.setValue('');
				element.blur();
				return;

			case 'Backspace':
				this._editAtCaret(event, (caret) => getDroppedQuotePair(value, caret));
				return;

			case '"':
				this._editAtCaret(event, (caret) => getTypedQuote(value, caret));
				return;
		}
	}

	onBeforeInput(event: InputEvent): void {
		if (event.inputType !== 'insertText' || !event.data) return;

		const text = event.data;
		const value = this._input.element.getValue();
		const params = this._input.dispatcher.getLineCommand()?.params ?? [];

		this._editAtCaret(event, (caret) => getQuotedArgStart(value, caret, text, params));
	}

	onUnhandledKeydown(event: KeyboardEvent): void {
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		const { element, dispatcher, messages } = this._input;

		if (event.key === 'Escape' && messages.get()) {
			event.preventDefault();
			messages.clear();
			return;
		}

		if (event.key.length !== 1) return;

		messages.clear();

		if (event.key === '/') {
			event.preventDefault();
			dispatcher.openCommandLine();
			return;
		}

		if (!this._app.ui.pages.isHome()) return;

		event.preventDefault();
		element.setValue(element.getValue() + event.key);
		element.focus();
	}

	private _editAtCaret(event: Event, getEdit: (caret: number) => QuoteEdit | null): void {
		const caret = this._input.element.getCaret();
		if (caret === null) return;

		const edit = getEdit(caret);
		if (!edit) return;

		event.preventDefault();
		this._input.messages.clear();
		this._input.element.setValue(edit.value, edit.caret);
	}
}
