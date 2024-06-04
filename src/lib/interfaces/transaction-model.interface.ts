import type { ItemModel } from './ItemModel.interface';
import type { GroupModel } from './group-model.interface';
import type { ParticipantModel } from './participant-model.interface';
import type { UserAuthModel } from './user-auth-model.interface';

export interface TransactionModel {
	action: 'add' | 'subtract' | 'reward';
	collectionId: string;
	collectionName: string;
	created: string;
	group: string;
	id: string;
	item: string;
	participant: string;
	score: number;
	targetType: 'group' | 'participant';
	updated: string;
	user: string;
}

export interface TransactionExpandedModel extends TransactionModel {
	expand: {
		group: GroupModel;
		item: ItemModel;
		participant: ParticipantModel;
		user: UserAuthModel;
	};
}
