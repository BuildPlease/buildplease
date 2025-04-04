import { z } from 'zod';

import { stringToNumber } from '@/validation';

export const CoordinatesSchema = z.object({
  latitude: stringToNumber.refine((val) => val >= -90 && val <= 90, {
    message: 'Latitude must be between -90 and 90.',
  }),
  longitude: stringToNumber.refine((val) => val >= -180 && val <= 180, {
    message: 'Longitude must be between -180 and 180.',
  }),
});

const ContactsSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
});

export const ValidationSchema = {
  Coordinates: CoordinatesSchema,
  Contacts: ContactsSchema,
};
