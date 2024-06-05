import type { PageLoad } from './$types';

import type { ItemModel } from '$lib/interfaces/ItemModel.interface';
import type { GroupModel } from '$lib/interfaces/group-model.interface';
import type { GroupScoreModel } from '$lib/interfaces/group-score.interface';
import type { ParticipantGroupModel } from '$lib/interfaces/participant-model.interface';
import { pocketbase } from '$lib/pocketbase';

export const load: PageLoad = async ({ params, fetch }) => {
	const items = pocketbase.collection('items').getFullList<ItemModel>({ fetch });
	let participant: ParticipantGroupModel | null | undefined;
	let group: GroupModel | undefined;
	let groupScore: Promise<GroupScoreModel> | undefined;
	let title = 'CE Boostup XII - Participant';

	try {
		participant = await pocketbase
			.collection('participants')
			.getOne<ParticipantGroupModel>(params.id, {
				fetch,
				expand: 'group'
			});
		group = participant.expand.group;
		groupScore = pocketbase.collection('groupScores').getOne<GroupScoreModel>(group.id, { fetch });
		title = `CE Boostup XII - ${participant.name} - บ้าน ${group.name}`;
	} catch (_) {
		participant = null;
	}

	return {
		id: params.id,
		participant,
		group,
		groupScore: await groupScore,
		title,
		items: await items,
		subpage: params.subpage as 'add-score' | 'subtract-score' | 'transaction' | undefined
	};
};
