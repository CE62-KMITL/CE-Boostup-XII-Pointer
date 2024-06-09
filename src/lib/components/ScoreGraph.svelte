<script lang="ts">
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		TimeScale,
		Legend,
		Tooltip,
		Colors
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';
	import { onMount } from 'svelte';

	import { AspectRatio } from '$lib/components/ui/aspect-ratio';
	import { format } from '$lib/format-number';
	import type { GroupParticipantModel } from '$lib/interfaces/group-model.interface';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface';
	import type { TransactionModel } from '$lib/interfaces/transaction-model.interface';

	Chart.register(
		LineController,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		TimeScale,
		Legend,
		Tooltip,
		Colors
	);

	let className: string = '';
	export { className as class };
	export let transactions: TransactionModel[] | undefined;
	export let participant: ParticipantModel | undefined;
	export let group: GroupParticipantModel | undefined;
	export let groupScore: number | undefined;

	let mounted = false;

	let canvas: HTMLCanvasElement;

	$: updateData(transactions, participant, group, groupScore, mounted);

	function updateData(
		transactions?: TransactionModel[],
		participant?: ParticipantModel,
		group?: GroupParticipantModel,
		groupScore?: number,
		mounted?: boolean
	) {
		if (transactions === undefined) return;
		if (participant === undefined) return;
		if (group === undefined) return;
		if (groupScore === undefined) return;
		if (!mounted) return;
		chart.data.datasets = [];
		const participantsScore: Record<string, number> = Object.fromEntries(
			group.expand.participants_via_group.map((participant) => [participant.id, participant.score])
		);
		const participantsData: Record<string, { x: Date; y: number }[]> = Object.fromEntries(
			group.expand.participants_via_group.map((participant) => [participant.id, []])
		);
		const groupData: { x: Date; y: number }[] = [];
		for (const transaction of transactions) {
			if (transaction.action === 'add') {
				participantsData[transaction.participant].push({
					x: new Date(transaction.created),
					y: participantsScore[transaction.participant]
				});
				participantsScore[transaction.participant] -= transaction.score;
				groupData.push({
					x: new Date(transaction.created),
					y: groupScore
				});
				groupScore -= transaction.score;
			}
			if (transaction.action === 'subtract') {
				groupData.push({
					x: new Date(transaction.created),
					y: groupScore
				});
				groupScore += transaction.score;
			}
		}
		chart.data.datasets.push({
			label: 'บ้าน ' + group.name,
			data: groupData
		});
		for (const p of group.expand.participants_via_group.toSorted((a, b) => {
			if (a.id === participant.id) return -1;
			if (b.id === participant.id) return 1;
			return a.name.localeCompare(b.name, 'en-US');
		})) {
			chart.data.datasets.push({
				label: p.name,
				data: participantsData[p.id]
			});
		}
		chart.update();
	}

	let chart: any;

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				datasets: []
			},
			options: {
				scales: {
					x: {
						type: 'time',
						time: {
							tooltipFormat: 'dd MMM yyyy HH:mm:ss',
							displayFormats: {
								milliseconds: 'dd MMM HH:mm',
								second: 'dd MMM HH:mm',
								minute: 'dd MMM HH:mm',
								hour: 'dd MMM HH:mm',
								day: 'dd MMM HH:mm',
								week: 'dd MMM HH:mm',
								month: 'dd MMM HH:mm',
								quarter: 'dd MMM HH:mm',
								year: 'dd MMM yyyy'
							}
						}
					},
					y: {
						beginAtZero: true,
						ticks: {
							callback: (value) => {
								return format(+value, 0, 0);
							}
						}
					}
				},
				plugins: {
					legend: {
						labels: {
							boxWidth: 16
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								let label = context.dataset.label || '';
								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									label += format(context.parsed.y);
								}
								return label;
							}
						}
					}
				},
				maintainAspectRatio: false
			}
		});
		mounted = true;
	});
</script>

<div class={className}>
	<p class="text-lg font-bold">Score Graph</p>
	<div
		class="mt-1 max-h-96 overflow-hidden rounded-lg bg-slate-50 pl-1 drop-shadow-lg dark:bg-slate-900"
	>
		<AspectRatio ratio={5 / 4}>
			<div class="relative h-full max-h-96 w-full">
				<canvas bind:this={canvas}></canvas>
			</div>
		</AspectRatio>
	</div>
</div>
