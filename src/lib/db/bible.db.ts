import { sleep } from '$lib/utils/sleep';
import IndexedDB from './idb.db';

const TOTAL_CHAPTERS_KEYS = 1189
/** BOOKNAMES is metadata on all bible chapters. We store it in the same table */
const TOTAL_BOOKNAMES_KEYS = 1

export class BibleDB extends IndexedDB {
	instance: any;
	resolve: any;
	ready: Promise<boolean | undefined> = new Promise((resolve, reject) => {
		this.resolve = resolve;
	});
	isReady = false
	worker: Worker | undefined = undefined

	constructor() {
		super('bible');
		this.createAndOrOpenObjectStores(['chapters', 'booknames']);
	}

	async init() {
		this.worker = new Worker(new URL('../workers/kjvdata.worker?worker', import.meta.url), {
			type: 'module'
		});

		if (!this.worker) {
			return
		}

		let syncedChapters = await this.syncChapters()
		let syncedBooknames = await this.syncBooknames()

		if (syncedChapters && syncedBooknames) {
			this.resolve(true);
			this.isReady = true
		}
	}

	async syncChapters() {
		let keys = await this.getAllKeys('chapters');
		if (keys.length < TOTAL_CHAPTERS_KEYS) {
			this.worker?.postMessage({ sync: 'booknames' });

			let retries = 0;
			let retryMax = 10;

			while (keys.length < TOTAL_CHAPTERS_KEYS || retries == retryMax) {
				this.worker?.postMessage({ sync: 'chapters' });
				await sleep(1000);
				keys = await this.getAllKeys('chapters');
				retries = retries + 1;
			}

			if (retries === retryMax) {
				return false;
			}
		}

		return true
	}

	async syncBooknames() {
		let keys = await this.getAllKeys('booknames');

		if (keys.length < TOTAL_BOOKNAMES_KEYS) {
			this.worker?.postMessage({ sync: 'booknames' });

			let retries = 0;
			let retryMax = 10;

			while (keys.length < TOTAL_BOOKNAMES_KEYS || retries == retryMax) {

				await sleep(1000);
				keys = await this.getAllKeys('booknames');
				retries = retries + 1;
			}

			if (retries === retryMax) {
				return false;
			}
		}

		return true
	}
}


export const bibleDB = new BibleDB();
