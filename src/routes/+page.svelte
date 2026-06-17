<script lang="ts">
	import { onMount } from 'svelte';
	import { getSelectedPageId, setSelectedPageId, notifyChange } from '$lib/stores.svelte';

	interface PageDesign {
		_id: string;
		name: string;
		page_title: string;
		heading: string;
		content: string;

		// Typography
		font_family: string;
		heading_font: string;
		font_size: number;
		heading_size: number;
		font_weight: number;
		heading_weight: number;
		font_color: string;
		heading_color: string;
		line_height: number;
		letter_spacing: number;

		// Layout
		background_color: string;
		accent_color: string;
		link_color: string;
		padding: number;
		text_align: string;
		border_radius: number;
		max_width: number;

		// Button
		button_text: string;
		button_bg: string;
		button_text_color: string;
		button_radius: number;
		button_padding_v: number;
		button_padding_h: number;
		button_full_width: boolean;
		show_button: boolean;

		created_at: string;
		updated_at: string;
	}

	const FONT_OPTIONS = [
		{ value: 'Inter, sans-serif', label: 'Inter' },
		{ value: 'DM Serif Display, Georgia, serif', label: 'DM Serif Display' },
		{ value: 'Playfair Display, serif', label: 'Playfair Display' },
		{ value: 'Georgia, serif', label: 'Georgia' },
		{ value: 'Merriweather, serif', label: 'Merriweather' },
		{ value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
		{ value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
		{ value: 'PT Serif, serif', label: 'PT Serif' },
		{ value: 'Space Grotesk, sans-serif', label: 'Space Grotesk' },
		{ value: 'Crimson Text, serif', label: 'Crimson Text' },
	];

	const WEIGHT_OPTIONS = [
		{ value: 300, label: 'Light 300' },
		{ value: 400, label: 'Regular 400' },
		{ value: 500, label: 'Medium 500' },
		{ value: 600, label: 'Semi Bold 600' },
		{ value: 700, label: 'Bold 700' },
	];

	const ALIGN_OPTIONS = [
		{ value: 'left', label: '⬤──' },
		{ value: 'center', label: '─⬤─' },
		{ value: 'right', label: '──⬤' },
	];

	const defaultDesign: PageDesign = {
		_id: '',
		name: 'Untitled Page',
		page_title: 'My Page - Webuilder',
		heading: 'Hello, World!',
		content: 'This is a sample page created with the Web Builder. Customize fonts, colors, layout, and even add buttons — all changes update in real-time.',

		font_family: 'Inter, sans-serif',
		heading_font: 'DM Serif Display, Georgia, serif',
		font_size: 20,
		heading_size: 48,
		font_weight: 400,
		heading_weight: 400,
		font_color: '#2c2c2c',
		heading_color: '#2d5a3d',
		line_height: 1.7,
		letter_spacing: 0,

		background_color: '#f7f3ee',
		accent_color: '#7dab7d',
		link_color: '#4a7c59',
		padding: 60,
		text_align: 'center',
		border_radius: 0,
		max_width: 800,

		button_text: 'Get Started',
		button_bg: '#4a7c59',
		button_text_color: '#ffffff',
		button_radius: 8,
		button_padding_v: 14,
		button_padding_h: 32,
		button_full_width: false,
		show_button: true,

		created_at: '',
		updated_at: ''
	};

	let design = $state<PageDesign>({ ...defaultDesign, _id: 'new' });
	let loading = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);
	let saveSuccess = $state(false);

	let currentPageId = $derived(getSelectedPageId());

	async function loadPage(id: string) {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/pages/${id}`);
			if (!res.ok) throw new Error('Failed to load page');
			const data = await res.json();
			// Merge with defaults so missing fields from older schema don't crash
			design = { ...defaultDesign, ...data, _id: data._id };
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load page';
		} finally {
			loading = false;
		}
	}

	async function savePage() {
		if (!design._id || design._id === 'new') return;
		saving = true;
		error = null;
		saveSuccess = false;
		try {
			const res = await fetch(`/api/pages/${design._id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(design)
			});
			if (!res.ok) throw new Error('Failed to save');
			const updated = await res.json();
			design = updated;
			saveSuccess = true;
			notifyChange();
			setTimeout(() => { saveSuccess = false; }, 2000);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}

	async function deleteCurrentPage() {
		if (!design._id || design._id === 'new') return;
		if (!confirm('Delete this page design?')) return;
		try {
			const res = await fetch(`/api/pages/${design._id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete');
			notifyChange();
			setSelectedPageId(null);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete';
		}
	}

	function update(field: keyof PageDesign, value: string | number | boolean) {
		design = { ...design, [field]: value };
	}

	// Keep browser tab title in sync
	$effect(() => {
		document.title = design.page_title || 'Webuilder';
	});

	$effect(() => {
		const id = currentPageId;
		if (id) {
			loadPage(id);
		} else {
			design = { ...defaultDesign, _id: 'new' };
			document.title = 'Webuilder — Design Studio';
		}
	});

	onMount(() => {
		if (getSelectedPageId()) {
			loadPage(getSelectedPageId()!);
		}
	});
</script>

<div class="builder">
	{#if !currentPageId}
		<div class="empty-state animate-in">
			<p style="font-size: 3rem; margin-bottom: 1rem;">✦</p>
			<h2>Welcome to Webuilder</h2>
			<p>Create a new page design or select one from the sidebar to get started.</p>
			<p style="font-size: 0.8rem; color: var(--muted-dim); margin-top: 1.5rem;">
				Adjust fonts, colors, layout, and buttons — changes update in real-time.
			</p>
		</div>
	{:else if loading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading design...</p>
		</div>
	{:else}
		<div class="builder-layout">
			<!-- Properties Panel -->
			<div class="props-panel animate-in">
				<div class="props-header">
					<input
						class="page-name-input"
						type="text"
						value={design.name}
						oninput={(e) => update('name', e.currentTarget.value)}
						placeholder="Page name"
					/>
					<div class="props-actions">
						<button class="btn btn-sm btn-primary" onclick={savePage} disabled={saving}>
							{saving ? 'Saving...' : 'Save'}
						</button>
						<button class="btn btn-sm btn-danger" onclick={deleteCurrentPage}>
							✕
						</button>
					</div>
				</div>

				{#if saveSuccess}
					<div class="save-toast">Saved ✓</div>
				{/if}
				{#if error}
					<div class="error-toast">{error}</div>
				{/if}

				<!-- Content Section -->
				<section class="prop-section">
					<h4 class="section-title">Content</h4>
					<div class="prop-group">
						<label class="prop-label">Page Title (Browser Tab)</label>
						<input type="text" value={design.page_title} oninput={(e) => update('page_title', e.currentTarget.value)} />
					</div>
					<div class="prop-group">
						<label class="prop-label">Heading</label>
						<input type="text" value={design.heading} oninput={(e) => update('heading', e.currentTarget.value)} />
					</div>
					<div class="prop-group">
						<label class="prop-label">Body Text</label>
						<textarea rows={3} value={design.content} oninput={(e) => update('content', e.currentTarget.value)}></textarea>
					</div>
				</section>

				<!-- Typography: Heading -->
				<section class="prop-section">
					<h4 class="section-title">Heading Typography</h4>
					<div class="prop-group">
						<label class="prop-label">Font Family</label>
						<select value={design.heading_font} onchange={(e) => update('heading_font', e.currentTarget.value)}>
							{#each FONT_OPTIONS as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
					<div class="prop-row">
						<div class="prop-group">
							<label class="prop-label">Size</label>
							<div class="range-wrap">
								<input type="range" min={20} max={96} value={design.heading_size} oninput={(e) => update('heading_size', Number(e.currentTarget.value))} />
								<span class="range-val">{design.heading_size}px</span>
							</div>
						</div>
					</div>
					<div class="prop-row">
						<div class="prop-group">
							<label class="prop-label">Weight</label>
							<select value={design.heading_weight} onchange={(e) => update('heading_weight', Number(e.currentTarget.value))}>
								{#each WEIGHT_OPTIONS as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</div>
						<div class="prop-group color-group">
							<label class="prop-label">Color</label>
							<div class="color-wrap">
								<input type="color" value={design.heading_color} oninput={(e) => update('heading_color', e.currentTarget.value)} />
								<span class="color-val">{design.heading_color}</span>
							</div>
						</div>
					</div>
				</section>

				<!-- Typography: Body -->
				<section class="prop-section">
					<h4 class="section-title">Body Typography</h4>
					<div class="prop-group">
						<label class="prop-label">Font Family</label>
						<select value={design.font_family} onchange={(e) => update('font_family', e.currentTarget.value)}>
							{#each FONT_OPTIONS as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
					<div class="prop-row">
						<div class="prop-group">
							<label class="prop-label">Size</label>
							<div class="range-wrap">
								<input type="range" min={14} max={40} value={design.font_size} oninput={(e) => update('font_size', Number(e.currentTarget.value))} />
								<span class="range-val">{design.font_size}px</span>
							</div>
						</div>
					</div>
					<div class="prop-row">
						<div class="prop-group">
							<label class="prop-label">Weight</label>
							<select value={design.font_weight} onchange={(e) => update('font_weight', Number(e.currentTarget.value))}>
								{#each WEIGHT_OPTIONS as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</div>
						<div class="prop-group color-group">
							<label class="prop-label">Color</label>
							<div class="color-wrap">
								<input type="color" value={design.font_color} oninput={(e) => update('font_color', e.currentTarget.value)} />
								<span class="color-val">{design.font_color}</span>
							</div>
						</div>
					</div>
					<div class="prop-row">
						<div class="prop-group">
							<label class="prop-label">Line Height</label>
							<div class="range-wrap">
								<input type="range" min={1} max={2.8} step={0.1} value={design.line_height} oninput={(e) => update('line_height', Number(e.currentTarget.value))} />
								<span class="range-val">{design.line_height.toFixed(1)}</span>
							</div>
						</div>
						<div class="prop-group">
							<label class="prop-label">Letter Spacing</label>
							<div class="range-wrap">
								<input type="range" min={-2} max={8} step={0.5} value={design.letter_spacing} oninput={(e) => update('letter_spacing', Number(e.currentTarget.value))} />
								<span class="range-val">{design.letter_spacing.toFixed(1)}px</span>
							</div>
						</div>
					</div>
				</section>

				<!-- Layout -->
				<section class="prop-section">
					<h4 class="section-title">Layout & Colors</h4>
					<div class="prop-row">
						<div class="prop-group color-group">
							<label class="prop-label">Background</label>
							<div class="color-wrap">
								<input type="color" value={design.background_color} oninput={(e) => update('background_color', e.currentTarget.value)} />
								<span class="color-val">{design.background_color}</span>
							</div>
						</div>
						<div class="prop-group color-group">
							<label class="prop-label">Accent</label>
							<div class="color-wrap">
								<input type="color" value={design.accent_color} oninput={(e) => update('accent_color', e.currentTarget.value)} />
								<span class="color-val">{design.accent_color}</span>
							</div>
						</div>
					</div>
					<div class="prop-row">
						<div class="prop-group color-group">
							<label class="prop-label">Link Color</label>
							<div class="color-wrap">
								<input type="color" value={design.link_color} oninput={(e) => update('link_color', e.currentTarget.value)} />
								<span class="color-val">{design.link_color}</span>
							</div>
						</div>
					</div>
					<div class="prop-group">
						<label class="prop-label">Padding</label>
						<div class="range-wrap">
							<input type="range" min={10} max={180} value={design.padding} oninput={(e) => update('padding', Number(e.currentTarget.value))} />
							<span class="range-val">{design.padding}px</span>
						</div>
					</div>
					<div class="prop-group">
						<label class="prop-label">Text Align</label>
						<div class="align-group">
							{#each ALIGN_OPTIONS as opt}
								<button
									class="align-btn"
									class:active={design.text_align === opt.value}
									onclick={() => update('text_align', opt.value)}
								>
									{opt.label}
								</button>
							{/each}
						</div>
					</div>
					<div class="prop-row">
						<div class="prop-group">
							<label class="prop-label">Border Radius</label>
							<div class="range-wrap">
								<input type="range" min={0} max={60} value={design.border_radius} oninput={(e) => update('border_radius', Number(e.currentTarget.value))} />
								<span class="range-val">{design.border_radius}px</span>
							</div>
						</div>
						<div class="prop-group">
							<label class="prop-label">Max Width</label>
							<div class="range-wrap">
								<input type="range" min={400} max={1400} step={20} value={design.max_width} oninput={(e) => update('max_width', Number(e.currentTarget.value))} />
								<span class="range-val">{design.max_width}px</span>
							</div>
						</div>
					</div>
				</section>

				<!-- Button -->
				<section class="prop-section">
					<h4 class="section-title">Button</h4>
					<div class="prop-group" style="display: flex; align-items: center; gap: 0.5rem;">
						<label class="prop-label" style="margin: 0;">Show Button</label>
						<input type="checkbox" checked={design.show_button} onchange={(e) => update('show_button', e.currentTarget.checked)} style="width: auto;" />
					</div>
					{#if design.show_button}
						<div class="prop-group">
							<label class="prop-label">Button Text</label>
							<input type="text" value={design.button_text} oninput={(e) => update('button_text', e.currentTarget.value)} />
						</div>
						<div class="prop-row">
							<div class="prop-group color-group">
								<label class="prop-label">Background</label>
								<div class="color-wrap">
									<input type="color" value={design.button_bg} oninput={(e) => update('button_bg', e.currentTarget.value)} />
									<span class="color-val">{design.button_bg}</span>
								</div>
							</div>
							<div class="prop-group color-group">
								<label class="prop-label">Text Color</label>
								<div class="color-wrap">
									<input type="color" value={design.button_text_color} oninput={(e) => update('button_text_color', e.currentTarget.value)} />
									<span class="color-val">{design.button_text_color}</span>
								</div>
							</div>
						</div>
						<div class="prop-row">
							<div class="prop-group">
								<label class="prop-label">Border Radius</label>
								<div class="range-wrap">
									<input type="range" min={0} max={40} value={design.button_radius} oninput={(e) => update('button_radius', Number(e.currentTarget.value))} />
									<span class="range-val">{design.button_radius}px</span>
								</div>
							</div>
							<div class="prop-group">
								<label class="prop-label">Full Width</label>
								<div class="align-group" style="margin-top: 0.2rem;">
									<button class="align-btn" class:active={!design.button_full_width} onclick={() => update('button_full_width', false)}>Auto</button>
									<button class="align-btn" class:active={design.button_full_width} onclick={() => update('button_full_width', true)}>Full</button>
								</div>
							</div>
						</div>
						<div class="prop-row">
							<div class="prop-group">
								<label class="prop-label">Padding V</label>
								<div class="range-wrap">
									<input type="range" min={6} max={30} value={design.button_padding_v} oninput={(e) => update('button_padding_v', Number(e.currentTarget.value))} />
									<span class="range-val">{design.button_padding_v}px</span>
								</div>
							</div>
							<div class="prop-group">
								<label class="prop-label">Padding H</label>
								<div class="range-wrap">
									<input type="range" min={12} max={80} value={design.button_padding_h} oninput={(e) => update('button_padding_h', Number(e.currentTarget.value))} />
									<span class="range-val">{design.button_padding_h}px</span>
								</div>
							</div>
						</div>
					{/if}
				</section>
			</div>

			<!-- Preview Panel -->
			<div class="preview-panel animate-in" style="animation-delay: 0.1s">
				<div class="preview-frame" style="background-color: {design.background_color};">
					<div
						class="preview-content"
						style="
							font-family: {design.font_family};
							font-size: {design.font_size}px;
							font-weight: {design.font_weight};
							color: {design.font_color};
							line-height: {design.line_height};
							letter-spacing: {design.letter_spacing}px;
							padding: {design.padding}px;
							text-align: {design.text_align};
							border-radius: {design.border_radius}px;
							max-width: {design.max_width}px;
							margin: 0 auto;
						"
					>
						<h1
							style="
								font-family: {design.heading_font};
								font-size: {design.heading_size}px;
								font-weight: {design.heading_weight};
								color: {design.heading_color};
								margin: 0 0 0.4em 0;
								line-height: 1.15;
								letter-spacing: -0.02em;
							"
						>{design.heading}</h1>
						<div
							style="
								width: 60px;
								height: 4px;
								background: {design.accent_color};
								margin: 0 auto 1.2em;
								border-radius: 2px;
								opacity: 0.5;
							"
						></div>
						<p style="margin: 0 0 1.5em; opacity: 0.85;">
							{design.content}
						</p>
						{#if design.show_button}
							<a
								href="javascript:void(0)"
								class="preview-button"
								style="
									background: {design.button_bg};
									color: {design.button_text_color};
									border-radius: {design.button_radius}px;
									padding: {design.button_padding_v}px {design.button_padding_h}px;
									font-size: {Math.max(design.font_size - 2, 14)}px;
									font-weight: 500;
									text-decoration: none;
									display: inline-block;
									transition: all 0.2s ease;
									cursor: pointer;
									border: none;
									{design.button_full_width ? 'width: 100%; text-align: center;' : ''}
								"
								onmouseover={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
								onmouseout={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
							>
								{design.button_text}
							</a>
						{/if}
					</div>
				</div>
				<div class="preview-footer">
					<span class="preview-label">Live Preview</span>
					<div class="preview-stats">
						<span class="preview-size">{design.max_width}px · {design.font_family.split(',')[0].trim()}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.builder {
		height: 100vh;
		overflow: hidden;
	}

	.builder-layout {
		display: flex;
		height: 100%;
	}

	/* ===== Properties Panel ===== */
	.props-panel {
		width: 320px;
		min-width: 320px;
		overflow-y: auto;
		padding: 1.2rem;
		border-right: 1px solid var(--border);
		background: var(--bg-surface);
		animation: fadeIn 0.4s ease;
	}

	.props-header {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1rem;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid var(--border);
	}

	.page-name-input {
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: var(--cream-light);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border-light);
		padding: 0.3rem 0;
		border-radius: 0;
	}
	.page-name-input:focus {
		box-shadow: none;
		border-color: var(--green);
	}

	.props-actions {
		display: flex;
		gap: 0.4rem;
	}
	.props-actions .btn {
		flex: 1;
		justify-content: center;
	}

	.save-toast {
		font-size: 0.75rem;
		color: var(--success);
		text-align: center;
		padding: 0.3rem;
		margin-bottom: 0.5rem;
		animation: fadeIn 0.3s ease;
	}
	.error-toast {
		font-size: 0.75rem;
		color: var(--danger);
		text-align: center;
		padding: 0.3rem;
		margin-bottom: 0.5rem;
	}

	.prop-section {
		margin-bottom: 1.2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-light);
	}
	.prop-section:last-child {
		border-bottom: none;
		margin-bottom: 0;
	}

	.section-title {
		font-family: var(--font-body);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--green);
		margin-bottom: 0.6rem;
		font-weight: 600;
	}

	.prop-group {
		margin-bottom: 0.5rem;
	}
	.prop-group:last-child {
		margin-bottom: 0;
	}

	.prop-label {
		display: block;
		font-size: 0.65rem;
		color: var(--muted);
		margin-bottom: 0.2rem;
	}

	.prop-row {
		display: flex;
		gap: 0.6rem;
	}
	.prop-row .prop-group {
		flex: 1;
		min-width: 0;
	}

	.range-wrap {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.range-wrap input[type="range"] {
		flex: 1;
		padding: 0;
		height: 4px;
		background: var(--border);
		border: none;
		border-radius: 2px;
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
	}
	.range-wrap input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--green);
		border: 3px solid var(--bg-surface);
		cursor: pointer;
		box-shadow: 0 1px 4px rgba(0,0,0,0.15);
	}
	.range-val {
		font-size: 0.7rem;
		color: var(--muted);
		min-width: 44px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.color-group {
		max-width: 140px;
	}

	.color-wrap {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.color-wrap input[type="color"] {
		width: 34px;
		height: 34px;
		padding: 2px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: none;
		cursor: pointer;
	}
	.color-val {
		font-size: 0.6rem;
		color: var(--muted-dim);
		font-family: var(--font-mono);
	}

	input[type="checkbox"] {
		width: 18px;
		height: 18px;
		accent-color: var(--green);
		cursor: pointer;
	}

	.align-group {
		display: flex;
		gap: 2px;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 2px;
	}
	.align-btn {
		flex: 1;
		padding: 0.35rem;
		border: none;
		background: none;
		color: var(--muted);
		font-size: 0.85rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
		font-family: inherit;
		justify-content: center;
		font-weight: 500;
	}
	.align-btn.active {
		background: var(--green-dim);
		color: var(--green-dark);
	}
	.align-btn:hover:not(.active) {
		color: var(--cream);
		background: rgba(74, 124, 89, 0.05);
	}

	/* ===== Preview Panel ===== */
	.preview-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--bg);
		animation: fadeIn 0.4s ease;
	}

	.preview-frame {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		overflow-y: auto;
		transition: background-color 0.3s ease;
	}

	.preview-content {
		transition: all 0.3s ease;
		width: 100%;
	}

	.preview-content h1 {
		transition: all 0.3s ease;
	}

	.preview-content p {
		transition: all 0.3s ease;
	}

	.preview-button {
		transition: all 0.2s ease !important;
	}

	.preview-footer {
		padding: 0.6rem 1rem;
		border-top: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.7rem;
		color: var(--muted-dim);
		background: var(--bg-surface);
	}
	.preview-label {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--green);
		font-weight: 600;
	}
	.preview-stats {
		display: flex;
		gap: 0.5rem;
	}

	/* Loading */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		color: var(--muted);
		font-size: 0.9rem;
	}
	.loading-spinner {
		width: 28px;
		height: 28px;
		border: 3px solid var(--border);
		border-top-color: var(--green);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 0.8rem;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
