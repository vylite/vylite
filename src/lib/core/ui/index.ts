import { UiOverlay } from './overlay';
import { UiPages } from './pages';
import { UiRoot } from './root';
import { UiTwig } from './twig';

export class UiManager {
	readonly pages = new UiPages();
	readonly root = new UiRoot();
	readonly twig = new UiTwig(this);
	readonly overlay = new UiOverlay();
}
