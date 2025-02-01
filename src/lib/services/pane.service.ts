
import { Buffer, NullBuffer } from '$lib/models/buffer.model';
import { NullPane, Pane, PaneSplit } from '$lib/models/pane.model';
import { componentMapping } from '$lib/services/component-mapping.service';


export class PaneService {
	private static _instance: PaneService;
	rootPane: Pane = new Pane();

	onUpdate: Function = () => { }

	private constructor() { }

	public static get Instance() {
		// Do you need arguments? Make it a regular static method instead.
		return this._instance || (this._instance = new this());
	}

	findBufferPane(key: string, pane: Pane | null): Pane {
		if (!pane || pane instanceof NullPane) {
			return new NullPane();
		}

		if (pane.split === PaneSplit.Null && pane.buffer.key === key) {
			return pane;
		}

		// recurse left panes
		let newPane = this.findBufferPane(key, pane.leftPane);

		if (!(newPane instanceof NullPane)) {
			return newPane;
		}

		// recurse right panes
		newPane = this.findBufferPane(key, pane.rightPane);

		if (!(newPane instanceof NullPane)) {
			return newPane;
		}

		return new NullPane();
	}

	findPane(id: string, pane: Pane | null): Pane {

		if (!pane || pane instanceof NullPane) {
			return new NullPane();
		}

		if (pane.split === PaneSplit.Null && pane.id === id) {
			return pane;
		}

		// recurse left panes
		let newPane = this.findPane(id, pane.leftPane);

		if (!(newPane instanceof NullPane)) {
			return newPane;
		}

		// recurse right panes
		newPane = this.findPane(id, pane.rightPane);

		if (!(newPane instanceof NullPane)) {
			return newPane;
		}

		return new NullPane();
	}

	splitPane(id: string, paneSplit: PaneSplit, componentName: any) {

		let p = this.findPane(id, this.rootPane)
		console.log('findpane2', id, this.rootPane.id)
		console.log(this.rootPane)
		p.split = paneSplit;

		p.leftPane = new Pane();
		p.leftPane.buffer = p.buffer;
		p.leftPane.parentNode = p;
		p.leftPane.split = PaneSplit.Null;

		p.rightPane = new Pane();
		p.rightPane.buffer = new Buffer();
		p.rightPane.buffer.componentName = componentName;
		p.rightPane.buffer.component = componentMapping.getComponent(componentName);
		p.rightPane.parentNode = p;
		p.rightPane.split = PaneSplit.Null;

		p.buffer = new NullBuffer();


		this.onUpdate(this.rootPane)
	}

	deletePane(id: string) {
		let cp = this.findPane(id, this.rootPane)
		if (cp.id === this.rootPane.id) {
			cp.buffer = new NullBuffer();
		}

		let pn = cp.parentNode;
		let ppn = pn?.parentNode;

		let paneToReplaceParentPane: Pane | null = null;
		if (pn?.leftPane?.id === cp.id) {
			paneToReplaceParentPane = pn?.rightPane;
		}

		if (pn?.rightPane?.id === cp.id) {
			paneToReplaceParentPane = pn?.leftPane;
		}

		if (ppn && ppn.leftPane && ppn.leftPane.id === pn?.id) {
			ppn.leftPane = paneToReplaceParentPane;

			if (ppn.leftPane) {
				ppn.leftPane.parentNode = ppn;
			}
		}

		if (ppn && ppn.rightPane && ppn.rightPane.id === pn?.id) {
			ppn.rightPane = paneToReplaceParentPane;

			if (ppn.rightPane) {
				ppn.rightPane.parentNode = ppn;
			}
		}

		// if ppn is null pn must be the root pane
		if (ppn === null) {
			if (paneToReplaceParentPane?.buffer) {
				this.rootPane = paneToReplaceParentPane;
				this.rootPane.parentNode = null;
				if (this.rootPane.leftPane) {
					// currentBuffer.set(this.rootPane.leftPane.buffer);
				} else if (this.rootPane.rightPane) {
					// currentBuffer.set(this.rootPane.rightPane.buffer);
				} else {
					// currentBuffer.set(this.rootPane.buffer);
				}
			}
		}

		this.onUpdate(this.rootPane)
	}
}
export let paneService = PaneService.Instance;

