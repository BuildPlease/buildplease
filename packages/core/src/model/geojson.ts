import type { JSONSerializable } from '@/utils/domain';

/**
 * Represents a coordinate pair.
 *
 * @property {number} longitude  The longitude value (−180 to 180).
 * @property {number} latitude   The latitude value (−90 to 90).
 *
 * @throws {Error} If longitude or latitude are out of range.
 */
export class Coordinates implements JSONSerializable {
  readonly value: [number, number];

  constructor([longitude, latitude]: [number, number]) {
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180.');
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90.');
    }
    this.value = [longitude, latitude];
  }

  /**
   * @returns {number} The longitude.
   */
  get longitude(): number {
    return this.value[0];
  }

  /**
   * @returns {number} The latitude.
   */
  get latitude(): number {
    return this.value[1];
  }

  /**
   * Custom JSON serialization.
   *
   * @returns {[number, number]} Plain tuple [lon, lat]
   */
  public toJSON(): [number, number] {
    return this.value;
  }
}

/**
 * Base GeoJSON object.
 *
 * @property {GeoJsonTypes} type  The GeoJSON object type.
 * @property {BBox} [bbox]       Optional bounding box array.
 */
export interface GeoJsonObject {
  type: GeoJsonTypes;
  bbox?: BBox;
}

/**
 * Point geometry.
 *
 * @property {'Point'} type
 * @property {Coordinates} coordinates  The coordinate pair.
 * @property {BBox} [bbox]              Optional bounding box.
 */
export class Point implements GeoJsonObject, JSONSerializable {
  readonly type = GeoJsonType.Point;

  public coordinates: Coordinates;
  public bbox?: BBox;

  constructor(coordinates: Coordinates, bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.toJSON(),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }
}

/**
 * MultiPoint geometry.
 *
 * @property {'MultiPoint'} type
 * @property {Coordinates[]} coordinates  Array of coordinate pairs.
 * @property {BBox} [bbox]                Optional bounding box.
 */
export class MultiPoint implements GeoJsonObject, JSONSerializable {
  readonly type = GeoJsonType.MultiPoint;

  public coordinates: Coordinates[];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((c) => c.toJSON()),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }
}

/**
 * LineString geometry.
 *
 * @property {'LineString'} type
 * @property {Coordinates[]} coordinates  Array of coordinate pairs.
 * @property {BBox} [bbox]                Optional bounding box.
 */
export class LineString implements GeoJsonObject, JSONSerializable {
  readonly type = GeoJsonType.LineString;

  public coordinates: Coordinates[];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((c) => c.toJSON()),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }
}

/**
 * MultiLineString geometry.
 *
 * @property {'MultiLineString'} type
 * @property {Coordinates[][]} coordinates  Array of LineStrings (arrays of Coordinates).
 * @property {BBox} [bbox]                   Optional bounding box.
 */
export class MultiLineString implements GeoJsonObject, JSONSerializable {
  readonly type = GeoJsonType.MultiLineString;

  public coordinates: Coordinates[][];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((line) => line.map((c) => c.toJSON())),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }
}

/**
 * Polygon geometry.
 *
 * @property {'Polygon'} type
 * @property {Coordinates[][]} coordinates  Array of linear rings (arrays of Coordinates).
 * @property {BBox} [bbox]                    Optional bounding box.
 */
export class Polygon implements GeoJsonObject, JSONSerializable {
  readonly type = GeoJsonType.Polygon;

  public coordinates: Coordinates[][];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((ring) => ring.map((c) => c.toJSON())),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }
}

/**
 * MultiPolygon geometry.
 *
 * @property {'MultiPolygon'} type
 * @property {Coordinates[][][]} coordinates  Array of Polygons (arrays of rings of Coordinates).
 * @property {BBox} [bbox]                       Optional bounding box.
 */
export class MultiPolygon implements GeoJsonObject, JSONSerializable {
  readonly type = GeoJsonType.MultiPolygon;

  public coordinates: Coordinates[][][];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[][][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((polygon) => polygon.map((ring) => ring.map((c) => c.toJSON()))),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }
}

/**
 * Bounding box for GeoJSON geometries.
 *
 * - [minX, minY, maxX, maxY] or
 * - [minX, minY, minZ, maxX, maxY, maxZ].
 */
export type BBox = [number, number, number, number] | [number, number, number, number, number, number];

/**
 * Union of all geometry types.
 */
export type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

/**
 * Valid GeoJSON types, based on geometry classes.
 */
export type GeoJsonTypes = `${GeoJsonType}`;

export enum GeoJsonType {
  Point = 'Point',
  MultiPoint = 'MultiPoint',
  LineString = 'LineString',
  MultiLineString = 'MultiLineString',
  Polygon = 'Polygon',
  MultiPolygon = 'MultiPolygon',
}
