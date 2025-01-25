import IndexedDB from '../db/idb.db';
import { base } from '../utils/paths'
onmessage = async () => {
	const myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('Transfer-Encoding', 'gzip');
	let db = new IndexedDB('bible');
	await db.createAndOrOpenObjectStore(['chapters']);
	let v = db.getValue('chapters', 'booknames');
	v.then((v) => {

		if (v === undefined) {
			fetch(`${base}data/json.gz/all.json`, {
				headers: myHeaders
			}).then((res) => {
				
				res.json().then((json) => {
					let myMap = new Map<string, any>(Object.entries(json));
					myMap.forEach((value: any, key: string) => {
						value['id'] = key;
						db.putValue('chapters', value);
					});
				});
			}).catch((err) => {
				console.log(`error: ${err}`)
			});
			fetch(`${base}data/json.gz/booknames.json`, {
				headers: myHeaders
			}).then((res) => {
				res.json().then((json) => {
					json['id'] = 'booknames';
					db.putValue('chapters', json);
				});
			}).catch((err) => {
				console.log(`error: ${err}`)
			});;
			fetch(`${base}data/strongs.json/all.json`, {
				headers: myHeaders
			}).then((res) => {
				res.json().then((json) => {
					let myMap = new Map<string, any>(Object.entries(json));
					myMap.forEach((value: any, key: string) => {
						value['id'] = key;
						db.putValue('chapters', value);
					});
				});
			}).catch((err) => {
				console.log(`error: ${err}`)
			});
		}
	});
};

export { };
