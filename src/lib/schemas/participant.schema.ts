import { z } from 'zod';

export const participantSchema = z.object({
	name: z
		.string()
		.min(5, 'ชื่อเล่นต้องมีอย่างน้อย 5 ตัวอักษร (รวมคำว่าน้อง)')
		.max(32, 'ชื่อเล่นต้องยาวไม่เกิน 32 ตัวอักษร')
		.startsWith('น้อง', 'ชื่อเล่นต้องเริ่มด้วยคำว่าน้อง'),
	fullName: z
		.string()
		.min(3, 'ชื่อจริงต้องมีอย่างน้อย 3 ตัวอักษร')
		.max(255, 'ชื่อจริงต้องยาวไม่เกิน 255 ตัวอักษร')
});

export type FormSchema = typeof participantSchema;
