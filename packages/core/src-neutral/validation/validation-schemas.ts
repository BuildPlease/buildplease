import {
  type Geometry,
  type OpeningHourInterval,
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
} from '@neutral/model';
import type { ValidationSchemaI18nParams } from '@neutral/validation';
import { z } from 'zod';

import { CoreL10n } from '#l10n';

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
};
