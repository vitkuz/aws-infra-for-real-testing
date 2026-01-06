import { z } from 'zod';

// SNS Envelope Schema
export const SnsEnvelopeSchema = z.object({
    Type: z.literal('Notification').optional(),
    MessageId: z.string().optional(),
    TopicArn: z.string().optional(),
    Message: z.string(), // The inner message we care about
    Timestamp: z.string().optional(),
    SignatureVersion: z.string().optional(),
    Signature: z.string().optional(),
    SigningCertURL: z.string().optional(),
    UnsubscribeURL: z.string().optional(),
    MessageAttributes: z.record(z.string(), z.object({
        Type: z.string(),
        Value: z.string()
    })).optional()
});

export type SnsEnvelope = z.infer<typeof SnsEnvelopeSchema>;
