import { z } from 'zod';

import {
  type OpeningHourInterval,
  type Geometry,
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
const CoordinatesSchema: z.ZodType<Coordinates> = z
  .tuple([LongitudeSchema, LatitudeSchema])
  .transform(([lon, lat]) => new Coordinates([lon, lat]));

/* MARK: - BBox (2D or 3D) */
const BBoxSchema = z.union([
  z.tuple([z.number(), z.number(), z.number(), z.number()]), // 2D
  z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()]), // 3D
]);

/* MARK: - Geometry: Point */
const PointGeometrySchema: z.ZodType<Point> = z
  .object({
    type: z.literal('Point'),
    coordinates: CoordinatesSchema,
    bbox: BBoxSchema.optional(),
  })
  .transform((o) => new Point(o.coordinates, o.bbox));

/* MARK: - Geometry: MultiPoint */
const MultiPointGeometrySchema: z.ZodType<MultiPoint> = z
  .object({
    type: z.literal('MultiPoint'),
    coordinates: z.array(CoordinatesSchema).nonempty(),
    bbox: BBoxSchema.optional(),
  })
  .transform((o) => new MultiPoint(o.coordinates, o.bbox));

/* MARK: - Geometry: LineString */
const LineStringGeometrySchema: z.ZodType<LineString> = z
  .object({
    type: z.literal('LineString'),
    coordinates: z.array(CoordinatesSchema).min(2),
    bbox: BBoxSchema.optional(),
  })
  .transform((o) => new LineString(o.coordinates, o.bbox));

/* MARK: - Geometry: MultiLineString */
const MultiLineStringGeometrySchema: z.ZodType<MultiLineString> = z
  .object({
    type: z.literal('MultiLineString'),
    coordinates: z.array(z.array(CoordinatesSchema).min(2)).nonempty(),
    bbox: BBoxSchema.optional(),
  })
  .transform((o) => new MultiLineString(o.coordinates, o.bbox));

/* MARK: - Geometry: Polygon */
const PolygonGeometrySchema: z.ZodType<Polygon> = z
  .object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(CoordinatesSchema).min(4)).min(1),
    bbox: BBoxSchema.optional(),
  })
  .transform((o) => new Polygon(o.coordinates, o.bbox));

/* MARK: - Geometry: MultiPolygon */
const MultiPolygonGeometrySchema: z.ZodType<MultiPolygon> = z
  .object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(z.array(z.array(CoordinatesSchema).min(4)).min(1)).min(1),
    bbox: BBoxSchema.optional(),
  })
  .transform((o) => new MultiPolygon(o.coordinates, o.bbox));

/* MARK: - Geometry Union */
const GeometrySchema: z.ZodType<Geometry> = z.union([
  PointGeometrySchema,
  MultiPointGeometrySchema,
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
]);

/* MARK: - Opening Hours */
const OpeningHourIntervalSchema: z.ZodType<OpeningHourInterval> = z.object({
  open: z.string().min(1),
  close: z.string().min(1),
});

const OpeningHourSchema: z.ZodType<OpeningHour> = z
  .object({
    day: z.number().min(0).max(6),
    intervals: z.array(OpeningHourIntervalSchema).nonempty(),
  })
  .transform((o) => new OpeningHour(o.day, o.intervals));

const OpeningHoursSchema = z.array(OpeningHourSchema);

/* MARK: - Contacts */
const ContactsSchema: z.ZodType<Contacts> = z
  .object({
    email: z.email().optional(),
    fb: z.string().optional(),
    ig: z.string().optional(),
    phone: z.string().optional(),
  })
  .transform((o) => new Contacts(o));

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
};
