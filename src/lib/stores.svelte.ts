let selectedPageId = $state<string | null>(null);
let _changeVersion = $state(0);

// Auth state
let _user = $state<{ _id: string; email: string; name: string } | null>(null);
let _authLoading = $state(true);

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

export function getUser() {
	return _user;
}
export function setUser(u: { _id: string; email: string; name: string } | null) {
	_user = u;
}
export function getAuthLoading() {
	return _authLoading;
}
export function setAuthLoading(v: boolean) {
	_authLoading = v;
}
