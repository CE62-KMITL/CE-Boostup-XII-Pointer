<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = ProgressPrimitive.Props & {subClass?: string};

	let className: $$Props["class"] = undefined;
	export let max: $$Props["max"] = 100;
	export let value: $$Props["value"] = undefined;
	export { className as class };
	let subClassName: $$Props["class"] = undefined;
	export { subClassName as subClass };
</script>

<ProgressPrimitive.Root
	class={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
	{...$$restProps}
>
	<div
		class={cn("h-full w-full flex-1 bg-primary transition-all", subClassName)}
		style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%)`}
	></div>
</ProgressPrimitive.Root>

<style lang="postcss">
	.in-progress-progress {
        @apply bg-cprimary;
    }
    .finished-progress {
        @apply bg-yellow-500;
    }
    .claimed-progress {
        @apply bg-gray-500;
    }
</style>