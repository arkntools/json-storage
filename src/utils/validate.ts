import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const skillNormalLevel = z.number().min(1).max(7).int();
const skillEliteLevel = z.number().min(7).max(10).int();
const uniequipLevel = z.number().min(0).max(3).int();

const materialObj = z
  .object({
    inputs: z.record(z.string().regex(/^\d{4,5}$|^mod_(unlock|update)_token(_\d)?$/), z.number().nonnegative().int().array().length(2)),
    presets: z
      .object({
        name: z.string().regex(/^\d+_[0-9a-z]+$/),
        setting: z
          .object({
            evolve: z.boolean().array().max(2),
            skills: z
              .object({
                normal: z.tuple([z.boolean(), skillNormalLevel, skillNormalLevel]),
                elite: z.tuple([z.boolean(), skillEliteLevel, skillEliteLevel]).array(),
              })
              .strict(),
            uniequip: z.record(z.string().regex(/^uniequip_\d{3}_[0-9a-z]+$/), z.tuple([z.boolean(), uniequipLevel, uniequipLevel])),
          })
          .strict(),
      })
      .strict()
      .array(),
    planStageBlacklist: z
      .string()
      .regex(/[0-9A-Z]+(-[0-9A-Z]+){1,2}/)
      .array(),
  })
  .strict();

export const materialValidatorMiddleware = zValidator('json', materialObj, (result, c) => (result.success ? undefined : c.body(null, 400)));
