import { z } from 'zod';

export const EventSchema = z.object({
    detail: z.record(z.any()),
    "detail-type": z.string(),
    source: z.string(),
    time: z.string(),
    id: z.string(),
    region: z.string(),
    resources: z.array(z.string()),
    account: z.string()
});

export type Event = z.infer<typeof EventSchema>;
