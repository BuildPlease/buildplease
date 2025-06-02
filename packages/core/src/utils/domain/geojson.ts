import { ignoreError } from '@/utils/application';
import type { JSONSerializable } from '@/utils/domain';

/**
 * Represents a coordinate pair.
 *
 * @property {number} longitude  The longitude value (−180 to 180).
 * @property {number} latitude   The latitude value (−90 to 90).
 *
 * @throws {Error} If longitude or latitude are out of range.
 */
export class Coordinates {
  public value: [number, number];

  /**
   * @param {[number, number]} coords
   *   Tuple containing [longitude, latitude].
   * @throws {Error} If longitude not in [−180, 180] or latitude not in [−90, 90].
   */
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
 * Bounding box for GeoJSON geometries.
 *
 * - [minX, minY, maxX, maxY] or
 * - [minX, minY, minZ, maxX, maxY, maxZ].
 */
export type BBox =
  | [number, number, number, number]
  | [number, number, number, number, number, number];

/**
 * Valid GeoJSON types, based on geometry classes.
 */
export type GeoJsonTypes = Geometry['type'];

/**
 * Union of all geometry types.
 */
export type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

/**
 * Point geometry.
 *
 * @property {'Point'} type
 * @property {Coordinates} coordinates  The coordinate pair.
 * @property {BBox} [bbox]              Optional bounding box.
 */
export class Point implements JSONSerializable {
  readonly type = 'Point';
  public coordinates: Coordinates;
  public bbox?: BBox;

  /**
   * @param {Coordinates} coordinates  A valid Coordinates instance.
   * @param {BBox} [bbox]              Optional bounding box.
   */
  constructor(coordinates: Coordinates, bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  /**
   * @returns {object} A GeoJSON Point representation.
   */
  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.value,
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  /**
   * Attempts to create a Point from raw input.
   *
   * @param {any} coordsInput  An array-like value for [longitude, latitude].
   * @returns {Point | null} A Point or null if invalid.
   */
  public static make(coordsInput: any): Point | null {
    return ignoreError(() => new Coordinates(coordsInput as [number, number]))
      .map((coordInstance) => new Point(coordInstance))
      .orDefault(null);
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
  readonly type = 'MultiPoint';
  public coordinates: Coordinates[];
  public bbox?: BBox;

  /**
   * @param {Coordinates[]} coordinates  Array of Coordinates instances.
   * @param {BBox} [bbox]                Optional bounding box.
   */
  constructor(coordinates: Coordinates[], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  /**
   * @returns {object} A GeoJSON MultiPoint representation.
   */
  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((coord) => coord.value),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  /**
   * Attempts to create a MultiPoint from raw input.
   *
   * @param {any} coordsInput  Nested array of [longitude, latitude] arrays.
   * @returns {MultiPoint | null} A MultiPoint or null if invalid.
   */
  public static make(coordsInput: any): MultiPoint | null {
    return ignoreError(() =>
      (coordsInput as any[]).map((coord: any) => new Coordinates(coord as [number, number])),
    )
      .map((coords) => new MultiPoint(coords))
      .orDefault(null);
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
  readonly type = 'LineString';
  public coordinates: Coordinates[];
  public bbox?: BBox;

  /**
   * @param {Coordinates[]} coordinates  Array of Coordinates instances.
   * @param {BBox} [bbox]                Optional bounding box.
   */
  constructor(coordinates: Coordinates[], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  /**
   * @returns {object} A GeoJSON LineString representation.
   */
  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((coord) => coord.value),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  /**
   * Attempts to create a LineString from raw input.
   *
   * @param {any} coordsInput  Nested array of [longitude, latitude] arrays.
   * @returns {LineString | null} A LineString or null if invalid.
   */
  public static make(coordsInput: any): LineString | null {
    return ignoreError(() =>
      (coordsInput as any[]).map((coord: any) => new Coordinates(coord as [number, number])),
    )
      .map((coords) => new LineString(coords))
      .orDefault(null);
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
  readonly type = 'MultiLineString';
  public coordinates: Coordinates[][];
  public bbox?: BBox;

  /**
   * @param {Coordinates[][]} coordinates  Array of arrays of Coordinates.
   * @param {BBox} [bbox]                   Optional bounding box.
   */
  constructor(coordinates: Coordinates[][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  /**
   * @returns {object} A GeoJSON MultiLineString representation.
   */
  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((line) => line.map((coord) => coord.value)),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  /**
   * Attempts to create a MultiLineString from raw input.
   *
   * @param {any} coordsInput  Nested arrays of [longitude, latitude] arrays.
   * @returns {MultiLineString | null} A MultiLineString or null if invalid.
   */
  public static make(coordsInput: any): MultiLineString | null {
    return ignoreError(() =>
      (coordsInput as any[][]).map((line) =>
        (line as any[]).map((coord) => new Coordinates(coord as [number, number])),
      ),
    )
      .map((lines) => new MultiLineString(lines))
      .orDefault(null);
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
  readonly type = 'Polygon';
  public coordinates: Coordinates[][];
  public bbox?: BBox;

  /**
   * @param {Coordinates[][]} coordinates  Array of rings, each an array of Coordinates.
   * @param {BBox} [bbox]                    Optional bounding box.
   */
  constructor(coordinates: Coordinates[][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  /**
   * @returns {object} A GeoJSON Polygon representation.
   */
  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((ring) => ring.map((coord) => coord.value)),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  /**
   * Attempts to create a Polygon from raw input.
   *
   * @param {any} coordsInput  Nested arrays of rings of [longitude, latitude].
   * @returns {Polygon | null} A Polygon or null if invalid.
   */
  public static make(coordsInput: any): Polygon | null {
    return ignoreError(() =>
      (coordsInput as any[][]).map((ring) =>
        (ring as any[]).map((coord) => new Coordinates(coord as [number, number])),
      ),
    )
      .map((rings) => new Polygon(rings))
      .orDefault(null);
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
  readonly type = 'MultiPolygon';
  public coordinates: Coordinates[][][];
  public bbox?: BBox;

  /**
   * @param {Coordinates[][][]} coordinates  Array of polygons, each an array of rings.
   * @param {BBox} [bbox]                       Optional bounding box.
   */
  constructor(coordinates: Coordinates[][][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  /**
   * @returns {object} A GeoJSON MultiPolygon representation.
   */
  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((polygon) =>
        polygon.map((ring) => ring.map((coord) => coord.value)),
      ),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  /**
   * Attempts to create a MultiPolygon from raw input.
   *
   * @param {any} coordsInput  Nested arrays of polygons, each an array of rings of [longitude, latitude].
   * @returns {MultiPolygon | null} A MultiPolygon or null if invalid.
   */
  public static make(coordsInput: any): MultiPolygon | null {
    return ignoreError(() =>
      (coordsInput as any[][][]).map((polygon) =>
        (polygon as any[][]).map((ring) =>
          (ring as any[]).map((coord) => new Coordinates(coord as [number, number])),
        ),
      ),
    )
      .map((polygons) => new MultiPolygon(polygons))
      .orDefault(null);
  }
}
