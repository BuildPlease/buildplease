import { z } from 'zod';

import {
  type OpeningHourInterval,
  type Geometry,
  Address,
  Coordinates,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  OpeningHour,
  Contacts,
} from '@/model';

/* MARK: - Primitives: Longitude & Latitude */
const LongitudeSchema = z.number().min(-180).max(180);
const LatitudeSchema = z.number().min(-90).max(90);

/* MARK: - Coordinates */
const CoordinatesSchema = z
  .tuple([LongitudeSchema, LatitudeSchema])
  .transform(([longitude, latitude]) => new Coordinates([longitude, latitude]));

/* MARK: - BBox (2D or 3D) */
const BBoxSchema = z.union([
  z.tuple([z.number(), z.number(), z.number(), z.number()]), // 2D
  z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()]), // 3D
]);

/* MARK: - Geometry: Point */
const PointGeometrySchema = z
  .object({
    type: z.literal('Point'),
    coordinates: CoordinatesSchema,
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new Point(value.coordinates, value.bbox));

/* MARK: - Geometry: MultiPoint */
const MultiPointGeometrySchema = z
  .object({
    type: z.literal('MultiPoint'),
    coordinates: z.array(CoordinatesSchema).nonempty(),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new MultiPoint(value.coordinates, value.bbox));

/* MARK: - Geometry: LineString */
const LineStringGeometrySchema = z
  .object({
    type: z.literal('LineString'),
    coordinates: z.array(CoordinatesSchema).min(2),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new LineString(value.coordinates, value.bbox));

/* MARK: - Geometry: MultiLineString */
const MultiLineStringGeometrySchema = z
  .object({
    type: z.literal('MultiLineString'),
    coordinates: z.array(z.array(CoordinatesSchema).min(2)).nonempty(),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new MultiLineString(value.coordinates, value.bbox));

/* MARK: - Geometry: Polygon */
const PolygonGeometrySchema = z
  .object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(CoordinatesSchema).min(4)).min(1),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new Polygon(value.coordinates, value.bbox));

/* MARK: - Geometry: MultiPolygon */
const MultiPolygonGeometrySchema = z
  .object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(z.array(z.array(CoordinatesSchema).min(4)).min(1)).min(1),
    bbox: BBoxSchema.optional(),
  })
  .transform((value) => new MultiPolygon(value.coordinates, value.bbox));

/* MARK: - Geometry Union */
const GeometrySchema = z.union([
  PointGeometrySchema,
  MultiPointGeometrySchema,
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
]) satisfies z.ZodType<Geometry>;

/* MARK: - Opening Hours */
const OpeningHourIntervalSchema = z.object({
  open: z.string().min(1),
  close: z.string().min(1),
}) satisfies z.ZodType<OpeningHourInterval>;

const OpeningHourSchema = z
  .object({
    day: z.number().min(0).max(6),
    intervals: z.array(OpeningHourIntervalSchema).nonempty(),
  })
  .transform((value) => new OpeningHour(value.day, value.intervals));

const OpeningHoursSchema = z.array(OpeningHourSchema);

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

/* MARK: - Export */
export const ValidationSchemas = {
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
