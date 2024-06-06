import type { ParticipantModel } from './participant-model.interface';

export interface GroupModel {
	avatar: string;
	collectionId: string;
	collectionName: string;
	created: string;
	description: string;
	id: string;
	name: string;
	scoreOffset: number;
	updated: string;
}

export interface GroupParticipantModel extends GroupModel {
	expand: {
		participants_via_group: ParticipantModel[];
	};
}

export interface GroupExtendScoreModel extends GroupModel {
	score: number;
}
