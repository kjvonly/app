<script lang="ts">
	let { text, fn, base } = $props();
</script>

{#if base}
<!-- base -->
	<button
		onclick={() => fn()}
		class="inline-block rounded bg-primary-600 px-8 py-3 text-sm font-bold text-neutral-50 transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-primary-500"
	>
    {text}
	</button>
{:else}
	<!-- Border -->
	<button
		onclick={() => fn()}
		class="inline-block rounded border border-current px-8 py-3 text-sm font-bold bg-primary-600 transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring text-neutral-50 active:text-primary-500"
	>
    {text}
	</button>
{/if}
