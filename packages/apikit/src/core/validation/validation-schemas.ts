import { z } from 'zod';

import {
  type OpeningHourInterval,
  type Geometry,
  Coordinates,
  Point,
  Polygon,
  MultiPolygon,
  Contacts,
  OpeningHour,
} from '@nidavellirx/meowv-core';

/**
 * Longitude ∈ [−180, 180]
 */
const LongitudeSchema = z.number().min(-180).max(180);

/**
 * Latitude ∈ [−90, 90]
 */
const LatitudeSchema = z.number().min(-90).max(90);

/**
 * Zod schema for {@link Coordinates}
 *
 * @returns {Coordinates} Instance created from [longitude, latitude]
 */
const CoordinatesSchema: z.ZodType<Coordinates> = z
  .tuple([LongitudeSchema, LatitudeSchema])
  .transform(([lon, lat]) => new Coordinates([lon, lat]));

/**
 * Zod schema for GeoJSON Point
 *
 * @returns {Point} Instance of Point with validated Coordinates
 */
const PointGeometrySchema: z.ZodType<Point> = z
  .object({
    type: z.literal('Point'),
    coordinates: CoordinatesSchema,
  })
  .transform((object) => new Point(object.coordinates));

/**
 * Zod schema for GeoJSON Polygon
 *
 * @returns {Polygon} Instance of Polygon with validated rings
 */
const PolygonGeometrySchema: z.ZodType<Polygon> = z
  .object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(CoordinatesSchema).min(4)).min(1),
  })
  .transform((object) => new Polygon(object.coordinates));

/**
 * Zod schema for GeoJSON MultiPolygon
 *
 * @returns {MultiPolygon} Instance of MultiPolygon with validated polygons
 */
const MultiPolygonGeometrySchema: z.ZodType<MultiPolygon> = z
  .object({
    type: z.literal('MultiPolygon'),
    coordinates: z.array(z.array(z.array(CoordinatesSchema).min(4)).min(1)).min(1),
  })
  .transform((object) => new MultiPolygon(object.coordinates));

/**
 * Union schema for GeoJSON Geometry
 *
 * @returns {Geometry} One of Point | Polygon | MultiPolygon
 */
const GeometrySchema: z.ZodType<Geometry> = z.union([
  PointGeometrySchema,
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
]);

/**
 * Zod schema for {@link OpeningHourInterval}
 *
 * @returns {OpeningHourInterval} Validated interval with open/close strings
 */
const OpeningHourIntervalSchema: z.ZodType<OpeningHourInterval> = z.object({
  open: z.string().min(1),
  close: z.string().min(1),
});

/**
 * Zod schema for {@link OpeningHour}
 *
 * @returns {OpeningHour} Instance with day (0–6) and non-empty intervals
 */
const OpeningHourSchema: z.ZodType<OpeningHour> = z
  .object({
    day: z.number().min(0).max(6),
    intervals: z.array(OpeningHourIntervalSchema).nonempty(),
  })
  .transform((object) => new OpeningHour(object.day, object.intervals));

/**
 * Zod schema for an array of {@link OpeningHour}
 *
 * @returns {OpeningHour[]} List of opening hours
 */
const OpeningHoursSchema = z.array(OpeningHourSchema);

/**
 * Zod schema for {@link Contacts}
 *
 * @returns {Contacts} Instance with optional email, facebook, instagram, phone
 */
const ContactsSchema: z.ZodType<Contacts> = z
  .object({
    email: z.email().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    phone: z.string().optional(),
  })
  .transform((object) => new Contacts(object));

export const ValidationSchemas = {
  // GeoJSON
  Longitude: LongitudeSchema,
  Latitude: LatitudeSchema,
  Coordinates: CoordinatesSchema,
  PointGeometry: PointGeometrySchema,
  PolygonGeometry: PolygonGeometrySchema,
  MultiPolygonGeometry: MultiPolygonGeometrySchema,
  Geometry: GeometrySchema,

  // Common
  OpeningHour: OpeningHourSchema,
  OpeningHours: OpeningHoursSchema,
  Contacts: ContactsSchema,
};
