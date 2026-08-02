<script>
	import "$styles/app.css";
	// Headerの読み込みをコメントアウト（または削除）します
	// import Header from "$components/Header.svelte";

	let { children } = $props();
</script>

<main id="content">
	{@render children?.()}
</main>