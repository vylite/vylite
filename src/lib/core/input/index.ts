import type { App } from '$lib/core/app';
import { InputDispatcher } from './dispatcher';
import { InputElement } from './element/element.svelte';
import { InputMessages } from './messages.svelte';
import { InputSuggestions } from './suggestions.svelte';
import { InputViewBuilder } from './view';

export class InputController {
	readonly element: InputElement;
	readonly messages: InputMessages;
	readonly suggestions: InputSuggestions;
	readonly dispatcher: InputDispatcher;
	readonly view: InputViewBuilder;

	constructor(app: App) {
		this.element = new InputElement(app, this);
		this.messages = new InputMessages();
		this.suggestions = new InputSuggestions(this);
		this.dispatcher = new InputDispatcher(app, this);
		this.view = new InputViewBuilder(app, this);
	}
}
