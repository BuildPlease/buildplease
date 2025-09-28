import { prop, modelOptions, Severity } from '@typegoose/typegoose';
import {
  type BBox,
  type GeoJsonTypes,
  type Geometry,
  GeoJsonType,
  Coordinates,
} from '@nidavellirx/meowv-core';

/**
 * GeoJSON Geometry entity object for MongoDB.
 */
@modelOptions({
  schemaOptions: {
    autoIndex: false,
    _id: false,
    id: false,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class GeometryEo {
  /**
   * Geometry type (e.g., Point, MultiPoint, etc.).
   * @prop {GeoJsonTypes}
   */
  @prop({ required: true, enum: GeoJsonType, type: () => String })
  public type!: GeoJsonTypes;

  /**
   * Geometry coordinates (e.g., Point, MultiPoint, Polygon, etc.).
   * @prop {Geometry['coordinates']}
   */
  @prop({
    required: true,
    set: (coords: any) => flattenCoordinates(coords),
    get: (value: any) => convertToCoordinates(value),
    type: () => Object,
  })
  public coordinates!: Geometry['coordinates'];

  /**
   * Optional bounding box for the geometry (e.g., [minX, minY, maxX, maxY]).
   * @prop {BBox} [optional]
   */
  @prop({
    required: false,
    default: undefined,
    type: () => [Number],
  })
  public bbox?: BBox;
}

/**
 * Flattens coordinates for storage in MongoDB.
 */
function flattenCoordinates(coords: any): any {
  // MARK: - For Point, return the coordinate pair directly
  if (coords instanceof Coordinates) return coords.value;

  // MARK: - For nested arrays (e.g., MultiPoint, Polygon), recursively flatten each coordinate
  if (Array.isArray(coords)) return coords.map(flattenCoordinates);

  // MARK: - Throw error for invalid formats
  throw new Error('Invalid coordinates format.');
}

/**
 * Converts raw DB data to Coordinates or nested Coordinates arrays.
 */
function convertToCoordinates(value: any): any {
  // MARK: - If it's already a Coordinates instance, return it directly
  if (value instanceof Coordinates) return value;

  // MARK: - If it's a single coordinate pair (e.g., Point), convert it to Coordinates
  if (Array.isArray(value) && value.length === 2 && value.every((v: any) => typeof v === 'number')) {
    return new Coordinates(value as [number, number]);
  }

  // MARK: - If it's a nested array (e.g., MultiPoint, Polygon), recursively convert each coordinate
  if (Array.isArray(value)) return value.map(convertToCoordinates);

  // MARK: - Throw error for invalid formats
  throw new Error('Invalid coordinates format.');
}
