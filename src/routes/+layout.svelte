<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { getSelectedPageId, setSelectedPageId, getChangeVersion, getUser, setUser, getAuthLoading, setAuthLoading } from '$lib/stores.svelte';

	let { children } = $props();

	interface PageItem {
		_id: string;
		name: string;
		updated_at: string;
	}

	let pages = $state<PageItem[]>([]);
	let connected = $state(false);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let changeVer = $derived(getChangeVersion());

	// Auth modal state
	let showAuthModal = $state(false);
	let authMode = $state<'login' | 'register'>('login');
	let authEmail = $state('');
	let authName = $state('');
	let authPassword = $state('');
	let authError = $state<string | null>(null);
	let authSubmitting = $state(false);
	let showUserMenu = $state(false);

	async function loadPages() {
		try {
			const initRes = await fetch('/api/init', { method: 'POST' });
			if (!initRes.ok) throw new Error('Failed to connect');
			connected = true;

			const res = await fetch('/api/pages');
			if (!res.ok) throw new Error('Failed to load pages');
			const data = await res.json();
			pages = data.pages;

			if (pages.length > 0 && !getSelectedPageId()) {
				setSelectedPageId(pages[0]._id);
			} else if (pages.length === 0) {
				setSelectedPageId(null);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Connection failed';
			connected = false;
		} finally {
			loading = false;
		}
	}

	async function checkAuth() {
		setAuthLoading(true);
		try {
			const res = await fetch('/api/auth/me');
			const data = await res.json();
			setUser(data.user ?? null);
		} catch {
			setUser(null);
		} finally {
			setAuthLoading(false);
		}
	}

	async function createNewPage() {
		try {
			const res = await fetch('/api/pages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: 'Untitled Page' })
			});
			if (!res.ok) throw new Error('Failed to create page');
			const page = await res.json();
			pages = [{ _id: page._id, name: page.name, updated_at: page.updated_at }, ...pages];
			setSelectedPageId(page._id);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create page';
		}
	}

	async function handleAuth() {
		authError = null;
		if (!authEmail.trim() || !authPassword.trim()) {
			authError = 'Email and password are required';
			return;
		}
		if (authMode === 'register' && !authName.trim()) {
			authError = 'Name is required';
			return;
		}
		authSubmitting = true;
		try {
			const body: Record<string, string> = { email: authEmail, password: authPassword };
			if (authMode === 'register') body.name = authName;

			const res = await fetch(`/api/auth/${authMode}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const data = await res.json();
			if (!res.ok) {
				authError = data.error || 'Authentication failed';
				return;
			}
			setUser(data.user);
			showAuthModal = false;
			authEmail = '';
			authPassword = '';
			authName = '';
			// Reload pages on auth change
			loadPages();
		} catch (e) {
			authError = e instanceof Error ? e.message : 'Request failed';
		} finally {
			authSubmitting = false;
		}
	}

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		setUser(null);
		setSelectedPageId(null);
		showUserMenu = false;
		loadPages();
	}

	function openAuth(mode: 'login' | 'register') {
		authMode = mode;
		authError = null;
		authEmail = '';
		authPassword = '';
		authName = '';
		showAuthModal = true;
	}

	function selectPage(id: string) {
		setSelectedPageId(id);
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	$effect(() => {
		changeVer;
		if (connected) {
			loadPages();
		}
	});

	onMount(() => {
		checkAuth();
		loadPages();
	});
</script>

<div class="app-shell">
	<aside class="sidebar">
		<div class="sidebar-header">
			<div class="logo">
				<span class="logo-icon">✦</span>
				<div class="logo-text">
					<span class="logo-title">Webuilder</span>
					<span class="logo-sub">design studio</span>
				</div>
			</div>
			<button class="btn-refresh" onclick={loadPages} title="Refresh">↻</button>
		</div>

		{#if getUser()}
			<button class="btn-new" onclick={createNewPage}>
				<span class="new-icon">+</span>
				New Page
			</button>

			<nav class="sidebar-nav">
				{#if loading}
					<div class="nav-loading">
						<span class="loading-dot"></span>
						<span class="loading-dot"></span>
						<span class="loading-dot"></span>
					</div>
				{:else if error}
					<div class="nav-error">
						<p class="error-icon">⚠</p>
						<p class="error-text">Connection failed</p>
						<p class="error-detail">{error}</p>
						<button class="btn btn-sm" onclick={loadPages}>Retry</button>
					</div>
				{:else if pages.length === 0}
					<div class="nav-empty">
						<p>No saved pages</p>
					</div>
				{:else}
					<div class="nav-label">Saved Pages</div>
					{#each pages as pg, i (pg._id)}
						<button
							class="nav-item"
							class:active={getSelectedPageId() === pg._id}
							style="animation-delay: {i * 0.04}s"
							onclick={() => selectPage(pg._id)}
						>
							<span class="nav-page-icon">▤</span>
							<div class="nav-page-info">
								<span class="nav-page-name">{pg.name}</span>
								<span class="nav-page-date">{formatDate(pg.updated_at)}</span>
							</div>
						</button>
					{/each}
				{/if}
			</nav>
		{:else if !getAuthLoading()}
			<div class="nav-empty" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem;">
				<p style="font-size:2rem; margin-bottom:0.5rem;">🔐</p>
				<p style="font-size:0.85rem;">Sign in to manage your pages</p>
				<button class="btn btn-primary btn-sm" onclick={() => openAuth('login')}>Sign In</button>
				<button class="btn btn-sm" onclick={() => openAuth('register')}>Create Account</button>
			</div>
		{/if}

		<div class="sidebar-footer">
			{#if getUser()}
				<div class="user-trigger" onclick={() => showUserMenu = !showUserMenu} onmouseleave={() => showUserMenu = false}>
					<div class="user-avatar">{getUser()!.name.charAt(0).toUpperCase()}</div>
					<span class="user-name">{getUser()!.name}</span>
					<span class="user-chevron">{showUserMenu ? '▲' : '▼'}</span>
					{#if showUserMenu}
						<div class="user-dropdown">
							<button class="dropdown-item" onclick={logout}>Sign Out</button>
						</div>
					{/if}
				</div>
			{:else}
				<div class="status-dot" class:connected={connected}></div>
				<span class="status-text">{connected ? 'connected' : 'disconnected'}</span>
			{/if}
		</div>
	</aside>

	<main class="main-content">
		{@render children?.()}
	</main>
</div>

<!-- Auth Modal -->
{#if showAuthModal}
	<div class="modal-overlay" onclick={() => showAuthModal = false}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h3>{authMode === 'login' ? 'Sign In' : 'Create Account'}</h3>

			{#if authError}
				<div class="auth-error">{authError}</div>
			{/if}

			<div class="form-group">
				<label for="auth-email">Email</label>
				<input id="auth-email" type="email" bind:value={authEmail} placeholder="you@example.com" />
			</div>

			{#if authMode === 'register'}
				<div class="form-group">
					<label for="auth-name">Name</label>
					<input id="auth-name" type="text" bind:value={authName} placeholder="Your name" />
				</div>
			{/if}

			<div class="form-group">
				<label for="auth-password">Password</label>
				<input id="auth-password" type="password" bind:value={authPassword} placeholder="At least 6 characters" />
			</div>

			<div class="form-actions">
				<button class="btn" onclick={() => showAuthModal = false}>Cancel</button>
				<button class="btn btn-primary" onclick={handleAuth} disabled={authSubmitting}>
					{authSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
				</button>
			</div>

			<div class="auth-switch">
				{authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
				<button class="link-btn" onclick={() => openAuth(authMode === 'login' ? 'register' : 'login')}>
					{authMode === 'login' ? 'Create one' : 'Sign in'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.app-shell { display: flex; min-height: 100vh; position: relative; z-index: 1; }

	.sidebar {
		width: 240px; min-width: 240px;
		background: var(--bg-surface);
		border-right: 1px solid var(--border);
		display: flex; flex-direction: column;
		height: 100vh; position: sticky; top: 0;
		animation: fadeIn 0.6s ease;
	}

	.sidebar-header {
		padding: 1.2rem 1rem;
		border-bottom: 1px solid var(--border-light);
		display: flex; align-items: center; justify-content: space-between;
	}

	.logo { display: flex; align-items: center; gap: 0.6rem; }
	.logo-icon { font-size: 1.2rem; color: var(--green); }
	.logo-text { display: flex; flex-direction: column; }
	.logo-title { font-family: var(--font-display); font-size: 1.1rem; color: var(--cream-light); line-height: 1; }
	.logo-sub { font-size: 0.6rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }

	.btn-refresh {
		background: none; border: 1px solid var(--border);
		color: var(--muted); font-size: 1.1rem;
		padding: 0.3rem 0.5rem; border-radius: var(--radius-sm);
		cursor: pointer; transition: all 0.2s;
	}
	.btn-refresh:hover { color: var(--green); border-color: var(--green); background: var(--green-dim); transform: rotate(180deg); }

	.btn-new {
		margin: 0.6rem; padding: 0.5rem;
		background: var(--green-dim); border: 1px dashed rgba(74,124,89,0.3);
		border-radius: var(--radius-sm); color: var(--green-dark);
		font-family: var(--font-mono); font-size: 0.75rem;
		cursor: pointer; display: flex; align-items: center;
		justify-content: center; gap: 0.4rem; transition: all 0.2s;
	}
	.btn-new:hover { background: rgba(74,124,89,0.15); border-color: var(--green); }
	.new-icon { font-size: 1.1rem; font-weight: 300; }

	.sidebar-nav { flex: 1; overflow-y: auto; padding: 0 0.6rem 0.6rem; }

	.nav-label {
		font-size: 0.6rem; text-transform: uppercase;
		letter-spacing: 0.12em; color: var(--muted);
		padding: 0.6rem 0.5rem 0.3rem;
	}

	.nav-item {
		display: flex; align-items: center; gap: 0.5rem;
		width: 100%; padding: 0.5rem 0.6rem;
		background: none; border: 1px solid transparent;
		border-radius: var(--radius-sm); color: var(--muted);
		font-size: 0.76rem; cursor: pointer;
		transition: all 0.2s ease;
		animation: fadeInUp 0.4s ease both;
		margin-bottom: 2px; text-align: left; font-family: inherit;
	}
	.nav-item:hover { color: var(--cream); background: rgba(74,124,89,0.04); border-color: var(--border-light); }
	.nav-item.active { color: var(--green-dark); background: var(--green-dim); border-color: rgba(74,124,89,0.2); }
	.nav-page-icon { font-size: 0.8rem; opacity: 0.6; flex-shrink: 0; }
	.nav-page-info { display: flex; flex-direction: column; min-width: 0; }
	.nav-page-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.nav-page-date { font-size: 0.6rem; color: var(--muted-dim); }

	.nav-loading { display: flex; gap: 4px; justify-content: center; padding: 2rem 0; }
	.loading-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulseGlow 1.2s ease infinite; }
	.loading-dot:nth-child(2) { animation-delay: 0.2s; }
	.loading-dot:nth-child(3) { animation-delay: 0.4s; }

	.nav-error { text-align: center; padding: 1.5rem 0.5rem; }
	.error-icon { font-size: 1.5rem; margin-bottom: 0.3rem; }
	.error-text { font-size: 0.8rem; color: var(--danger); }
	.error-detail { font-size: 0.65rem; color: var(--muted); margin: 0.3rem 0 0.8rem; }

	.nav-empty { text-align: center; padding: 2rem 0.5rem; color: var(--muted); font-size: 0.8rem; }

	/* Footer + User Menu */
	.sidebar-footer {
		padding: 0.6rem 0.8rem;
		border-top: 1px solid var(--border-light);
		display: flex; align-items: center;
		font-size: 0.65rem; color: var(--muted);
	}

	.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--danger); transition: background 0.3s; margin-right: 0.4rem; }
	.status-dot.connected { background: var(--success); box-shadow: 0 0 6px rgba(90,158,110,0.4); }

	.user-trigger {
		display: flex; align-items: center; gap: 0.4rem;
		width: 100%; cursor: pointer; position: relative;
		padding: 0.2rem 0.4rem; border-radius: var(--radius-sm);
		transition: background 0.2s;
	}
	.user-trigger:hover { background: rgba(74,124,89,0.06); }
	.user-avatar {
		width: 24px; height: 24px; border-radius: 50%;
		background: var(--green); color: white;
		display: flex; align-items: center; justify-content: center;
		font-size: 0.7rem; font-weight: 600; flex-shrink: 0;
	}
	.user-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.7rem; color: var(--cream); }
	.user-chevron { font-size: 0.5rem; color: var(--muted-dim); }

	.user-dropdown {
		position: absolute; bottom: 100%; left: 0; right: 0;
		background: var(--bg-card); border: 1px solid var(--border);
		border-radius: var(--radius-sm); box-shadow: var(--shadow-lg);
		margin-bottom: 4px; overflow: hidden;
	}
	.dropdown-item {
		width: 100%; padding: 0.5rem 0.8rem;
		background: none; border: none; color: var(--cream);
		font-size: 0.75rem; cursor: pointer; text-align: left;
		font-family: inherit; transition: background 0.15s;
	}
	.dropdown-item:hover { background: var(--danger-light); color: var(--danger); }

	.main-content { flex: 1; overflow: hidden; }

	/* Auth Modal */
	.auth-error {
		background: var(--danger-light); color: var(--danger);
		padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);
		font-size: 0.75rem; margin-bottom: 0.8rem;
	}

	.auth-switch {
		text-align: center; font-size: 0.75rem;
		color: var(--muted); margin-top: 1rem;
	}
	.link-btn {
		background: none; border: none; color: var(--green);
		cursor: pointer; font-size: 0.75rem; font-family: inherit;
		text-decoration: underline; padding: 0;
	}
	.link-btn:hover { color: var(--green-dark); }
</style>
