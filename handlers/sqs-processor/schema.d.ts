import { z } from 'zod';
export declare const SnsEnvelopeSchema: z.ZodObject<{
    Type: z.ZodOptional<z.ZodLiteral<"Notification">>;
    MessageId: z.ZodOptional<z.ZodString>;
    TopicArn: z.ZodOptional<z.ZodString>;
    Message: z.ZodString;
    Timestamp: z.ZodOptional<z.ZodString>;
    SignatureVersion: z.ZodOptional<z.ZodString>;
    Signature: z.ZodOptional<z.ZodString>;
    SigningCertURL: z.ZodOptional<z.ZodString>;
    UnsubscribeURL: z.ZodOptional<z.ZodString>;
    MessageAttributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        Type: z.ZodString;
        Value: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type SnsEnvelope = z.infer<typeof SnsEnvelopeSchema>;
