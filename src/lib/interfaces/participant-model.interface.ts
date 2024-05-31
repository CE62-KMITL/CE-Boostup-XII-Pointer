import type { GroupModel } from './group-model.interface';

export interface ParticipantModel {
	collectionId: string;
	collectionName: string;
	created: Date;
	fullName: string;
	group: string;
	id: string;
	itemsUnlocked: string[];
	name: string;
	score: number;
	updated: Date;
	expand: {
		group: GroupModel;
	};
}
