import { z } from 'zod';

import {
  type Geometry,
  type OpeningHourInterval,
  Address,
  Contacts,
  Coordinates,
  DateTime,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  ObjectId,
  OpeningHour,
  Point,
  Polygon,
} from '@/model';
import type { ValidationSchemaI18nParams } from '@/validation';

/* MARK: - Primitives */
const UUIDSchema = z.uuid();
const DateTimeSchema = z.iso.datetime().transform((value) => new DateTime(value));
const ObjectIdSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => new ObjectId(value));

export type UUIDDto = z.input<typeof UUIDSchema>;
export type DateTimeDto = z.input<typeof DateTimeSchema>;
export type ObjectIdDto = z.input<typeof ObjectIdSchema>;

/* MARK: - Primitives: Longitude & Latitude */
const LongitudeSchema = z.number().min(-180).max(180);
const LatitudeSchema = z.number().min(-90).max(90);

export type LongitudeDto = z.input<typeof LongitudeSchema>;
export type LatitudeDto = z.input<typeof LatitudeSchema>;

/* MARK: - Coordinates */
const CoordinatesSchema = z
  .tuple([LongitudeSchema, LatitudeSchema])
  .transform(([longitude, latitude]) => new Coordinates([longitude, latitude]));

export type CoordinatesDto = z.input<typeof CoordinatesSchema>;

/* MARK: - BBox (2D or 3D) */
const BBoxSchema = z.union([
  z.tuple([z.number(), z.number(), z.number(), z.number()]), // 2D
  z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()]), // 3D
]);

export type BBoxDto = z.input<typeof BBoxSchema>;

/* MARK: - Geometry: Point */
const PointGeometrySchema = z
  .object({
    type: z.literal('Point'),
    coordinates: CoordinatesSchema,
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new Point(value.coordinates, value.bbox));

export type PointGeometryDto = z.input<typeof PointGeometrySchema>;

/* MARK: - Geometry: MultiPoint */
const MultiPointGeometrySchema = z
  .object({
    type: z.literal('MultiPoint'),
    coordinates: z.array(CoordinatesSchema).nonempty(),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new MultiPoint(value.coordinates, value.bbox));

export type MultiPointGeometryDto = z.input<typeof MultiPointGeometrySchema>;

/* MARK: - Geometry: LineString */
const LineStringGeometrySchema = z
  .object({
    type: z.literal('LineString'),
    coordinates: z.array(CoordinatesSchema).min(2),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new LineString(value.coordinates, value.bbox));

export type LineStringGeometryDto = z.input<typeof LineStringGeometrySchema>;

/* MARK: - Geometry: MultiLineString */
const MultiLineStringGeometrySchema = z
  .object({
    type: z.literal('MultiLineString'),
    coordinates: z.array(z.array(CoordinatesSchema).min(2)).nonempty(),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new MultiLineString(value.coordinates, value.bbox));

export type MultiLineStringGeometryDto = z.input<typeof MultiLineStringGeometrySchema>;

/* MARK: - Geometry: Polygon */
const PolygonGeometrySchema = z
  .object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(CoordinatesSchema).min(4)).min(1),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new Polygon(value.coordinates, value.bbox));

export type PolygonGeometryDto = z.input<typeof PolygonGeometrySchema>;

/* MARK: - Geometry: MultiPolygon */
const MultiPolygonGeometrySchema = z
  .object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(z.array(z.array(CoordinatesSchema).min(4)).min(1)).min(1),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new MultiPolygon(value.coordinates, value.bbox));

export type MultiPolygonGeometryDto = z.input<typeof MultiPolygonGeometrySchema>;

/* MARK: - Geometry Union */
const GeometrySchema = z.union([
  PointGeometrySchema,
  MultiPointGeometrySchema,
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
]) satisfies z.ZodType<Geometry>;

export type GeometryDto = z.input<typeof GeometrySchema>;

/* MARK: - Opening Hours */
const OpeningHourIntervalSchema = z
  .object({
    open: z.string(),
    close: z.string(),
  })
  .superRefine((value, context) => {
    const openValue = value.open.trim();
    const closeValue = value.close.trim();

    const hasOpen = openValue.length > 0;
    const hasClose = closeValue.length > 0;

    const addIssue = (key: string, path: (string | number)[], values?: Record<string, unknown>) => {
      const params: ValidationSchemaI18nParams = {
        i18n: {
          key: key,
          values: values,
        },
      };

      context.addIssue({
        code: 'custom',
        path: path,
        params: params,
      });
    };

    if (!hasOpen && !hasClose) {
      addIssue('errors.opening_hours.time_required', ['open']);
      return;
    }

    if (hasOpen !== hasClose) {
      const missingPath = hasOpen ? ['close'] : ['open'];
      addIssue('errors.opening_hours.time_range_incomplete', missingPath);
    }
  }) satisfies z.ZodType<OpeningHourInterval>;

const OpeningHourSchema = z
  .object({
    day: z.number().int().min(1).max(7),
    intervals: z.array(OpeningHourIntervalSchema).default([]),
  })
  .transform((value) => new OpeningHour(value.day, value.intervals));

const OpeningHoursSchema = z.array(OpeningHourSchema);

export type OpeningHourIntervalDto = z.input<typeof OpeningHourIntervalSchema>;
export type OpeningHourDto = z.input<typeof OpeningHourSchema>;
export type OpeningHoursDto = z.input<typeof OpeningHoursSchema>;

/* MARK: - Contacts */
const ContactsSchema = z
  .object({
    email: z.email().optional().nullable(),
    fb: z.string().optional().nullable(),
    ig: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    web: z.string().optional().nullable(),
  })
  .transform(
    (value) =>
      new Contacts({
        email: value.email,
        fb: value.fb,
        ig: value.ig,
        phone: value.phone,
        web: value.web,
      }),
  );

export type ContactsDto = z.input<typeof ContactsSchema>;

/* MARK: - Address */
const AddressSchema = z
  .object({
    streetLine1: z.string().min(1),
    streetLine2: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().min(1),
    countryCode: z.string().optional().nullable(),
  })
  .transform(
    (value) =>
      new Address({
        streetLine1: value.streetLine1,
        streetLine2: value.streetLine2,
        postalCode: value.postalCode,
        state: value.state,
        city: value.city,
        country: value.country,
        countryCode: value.countryCode,
      }),
  );

export type AddressDto = z.input<typeof AddressSchema>;

/* MARK: - Export */
export const ValidationSchemas = {
  // Primitives
  UUID: UUIDSchema,
  DateTime: DateTimeSchema,
  ObjectId: ObjectIdSchema,

  // Coordinates
  Longitude: LongitudeSchema,
  Latitude: LatitudeSchema,
  Coordinates: CoordinatesSchema,
  BBox: BBoxSchema,

  // Geometry
  PointGeometry: PointGeometrySchema,
  MultiPointGeometry: MultiPointGeometrySchema,
  LineStringGeometry: LineStringGeometrySchema,
  MultiLineStringGeometry: MultiLineStringGeometrySchema,
  PolygonGeometry: PolygonGeometrySchema,
  MultiPolygonGeometry: MultiPolygonGeometrySchema,
  Geometry: GeometrySchema,

  // Common
  OpeningHour: OpeningHourSchema,
  OpeningHours: OpeningHoursSchema,
  Contacts: ContactsSchema,
  Address: AddressSchema,
};
