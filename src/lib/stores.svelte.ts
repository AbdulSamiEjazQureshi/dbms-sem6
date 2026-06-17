let selectedPageId = $state<string | null>(null);
let _changeVersion = $state(0);

export function getSelectedPageId() {
	return selectedPageId;
}

export function setSelectedPageId(id: string | null) {
	selectedPageId = id;
}

export function getChangeVersion() {
	return _changeVersion;
}

export function notifyChange() {
	_changeVersion++;
}
