import { UiKeys } from './keys';
import { UiOverlay } from './overlay';
import { UiPages } from './pages';
import { UiRail } from './rail';
import { UiTwig } from './twig';

export class UiManager {
	readonly pages = new UiPages(this);
	readonly twig = new UiTwig();
	readonly overlay = new UiOverlay();
	readonly rail = new UiRail(this);
	readonly keys = new UiKeys(this);
}
