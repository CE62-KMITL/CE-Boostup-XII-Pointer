import type { ParticipantModel } from './participant-model.interface';

export interface GroupModel {
	avatar: string;
	collectionId: string;
	collectionName: string;
	created: Date;
	description: string;
	id: string;
	name: string;
	scoreOffset: number;
	updated: Date;
}

export interface GroupParticipantModel extends GroupModel {
	expand: {
		participants_via_group: ParticipantModel[];
	};
}
