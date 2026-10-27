import { getGhost } from './shared/ghost';
import type { InputController } from '.';
import type { InputMessage } from './messages.svelte';

export type InputView = {
	value: string;
	message: InputMessage | null;

	ghost: string;
};

export class InputViewBuilder {
	constructor(private readonly _input: InputController) {}

	get(): InputView {
		const { element, messages, suggestions, dispatcher } = this._input;
		const value = element.getValue();

		return {
			value,
			message: messages.get(),

			ghost: getGhost(value, suggestions.getSelected(), dispatcher.getLineCommand())
		};
	}
}
