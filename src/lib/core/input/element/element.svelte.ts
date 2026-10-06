import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';
import type { App } from '$lib/core/app';
import type { InputController } from '..';
import { InputKeys } from './keys';

export class InputElement {
	private _value = $state('');
	private _focused = $state(false);
	private _element: HTMLInputElement | undefined;
	private readonly _keys: InputKeys;

	constructor(
		app: App,
		private readonly _input: InputController
	) {
		this._keys = new InputKeys(app, _input);
	}

	attach: Attachment<HTMLInputElement> = (element) => {
		this._element = element;

		const removers = [
			on(element, 'input', () => this._onType(element.value)),
			on(element, 'focus', () => (this._focused = true)),
			on(element, 'blur', () => (this._focused = false)),
			on(element, 'beforeinput', (event) => this._keys.onBeforeInput(event)),
			on(element, 'keydown', (event) => this._keys.onKeydown(event))
		];

		return () => {
			for (const remove of removers) remove();
			this._element = undefined;
			this._focused = false;
		};
	};

	onUnhandledKeydown(event: KeyboardEvent): void {
		if (this._element) this._keys.onUnhandledKeydown(event);
	}

	getElement(): HTMLInputElement | undefined {
		return this._element;
	}

	getValue(): string {
		return this._value;
	}

	isFocused(): boolean {
		return this._focused;
	}

	getCaret(): number | null {
		if (!this._element) return null;

		const { selectionStart, selectionEnd } = this._element;
		return selectionStart === selectionEnd ? selectionStart : null;
	}

	setValue(value: string, caret = value.length): void {
		this._value = value;
		this._input.suggestions.reset();

		if (!this._element) return;

		this._element.value = value;
		this._element.setSelectionRange(caret, caret);
	}

	focus(): void {
		this._element?.focus();
	}

	blur(): void {
		this._element?.blur();
	}

	private _onType(value: string): void {
		this._value = value;
		this._input.suggestions.reset();
		this._input.messages.clear();
	}
}
