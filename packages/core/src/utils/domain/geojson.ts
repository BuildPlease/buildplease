import { ignoreError } from '@/utils/application';
import type { JSONSerializable } from '@/utils/domain';

/**
 * Represents a coordinate pair (longitude, latitude).
 * Enforces validation of longitude and latitude within allowed ranges.
 * Longitude must be between -180 and 180; Latitude must be between -90 and 90.
 */
export class Coordinates {
  public value: [number, number];

  /**
   * Constructs a new `Coordinates` instance.
   * @param [longitude, latitude] - Array containing longitude and latitude values.
   * @throws Will throw an error if longitude or latitude values are out of range.
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
   * Returns the longitude value.
   */
  get longitude(): number {
    return this.value[0];
  }

  /**
   * Returns the latitude value.
   */
  get latitude(): number {
    return this.value[1];
  }
}

/**
 * The base GeoJSON object.
 * https://tools.ietf.org/html/rfc7946#section-3
 * The GeoJSON specification also allows foreign members
 * (https://tools.ietf.org/html/rfc7946#section-6.1)
 * Developers should use "&" type in TypeScript or extend the interface
 * to add these foreign members.
 */
export interface GeoJsonObject {
  // Don't include foreign members directly into this type def.
  // in order to preserve type safety.
  // [key: string]: any;
  /**
   * Specifies the type of GeoJSON object.
   */
  type: GeoJsonTypes;
  /**
   * Bounding box of the coordinate range of the object's Geometries, Features, or Feature Collections.
   * The value of the bbox member is an array of length 2*n where n is the number of dimensions
   * represented in the contained geometries, with all axes of the most southwesterly point
   * followed by all axes of the more northeasterly point.
   * The axes order of a bbox follows the axes order of geometries.
   * https://tools.ietf.org/html/rfc7946#section-5
   */
  bbox?: BBox | undefined;
}

/**
 * Bounding box
 * https://tools.ietf.org/html/rfc7946#section-5
 */
export type BBox =
  | [number, number, number, number]
  | [number, number, number, number, number, number];

/**
 * The value values for the "type" property of GeoJSON Objects.
 * https://tools.ietf.org/html/rfc7946#section-1.4
 */
export type GeoJsonTypes = Geometry['type'];

/**
 * Geometry object.
 * https://tools.ietf.org/html/rfc7946#section-3
 */
export type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

/**
 * Point geometry object.
 * https://tools.ietf.org/html/rfc7946#section-3.1.2
 */
export class Point implements JSONSerializable {
  readonly type = 'Point';
  public coordinates: Coordinates;
  public bbox?: BBox;

  constructor(coordinates: Coordinates, bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.value,
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  public static make(coordinates: any): Point | null {
    return ignoreError(() => new Coordinates(coordinates as [number, number]))
      .map((coordInstance) => new Point(coordInstance))
      .orDefault(null);
  }
}

/**
 * MultiPoint geometry object.
 *  https://tools.ietf.org/html/rfc7946#section-3.1.3
 */
export class MultiPoint implements GeoJsonObject, JSONSerializable {
  readonly type = 'MultiPoint';
  public coordinates: Coordinates[];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((coord) => coord.value),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  public static make(coordinates: any): MultiPoint | null {
    return ignoreError(() =>
      coordinates.map((coord: any) => new Coordinates(coord as [number, number])),
    )
      .map((coords) => new MultiPoint(coords))
      .orDefault(null);
  }
}

/**
 * LineString geometry object.
 * https://tools.ietf.org/html/rfc7946#section-3.1.4
 */
export class LineString implements GeoJsonObject, JSONSerializable {
  readonly type = 'LineString';
  public coordinates: Coordinates[];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((coord) => coord.value),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  public static make(coordinates: any): LineString | null {
    return ignoreError(() =>
      coordinates.map((coord: any) => new Coordinates(coord as [number, number])),
    )
      .map((coords) => new LineString(coords))
      .orDefault(null);
  }
}

/**
 * MultiLineString geometry object.
 * https://tools.ietf.org/html/rfc7946#section-3.1.5
 */
export class MultiLineString implements GeoJsonObject, JSONSerializable {
  readonly type = 'MultiLineString';
  public coordinates: Coordinates[][];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((line) => line.map((coord) => coord.value)),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  public static make(coordinates: any): MultiLineString | null {
    return ignoreError(() =>
      coordinates.map((line: any) =>
        line.map((coord: any) => new Coordinates(coord as [number, number])),
      ),
    )
      .map((lines) => new MultiLineString(lines))
      .orDefault(null);
  }
}

/**
 * Polygon geometry object.
 * https://tools.ietf.org/html/rfc7946#section-3.1.6
 */
export class Polygon implements GeoJsonObject, JSONSerializable {
  readonly type = 'Polygon';
  public coordinates: Coordinates[][];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((ring) => ring.map((coord) => coord.value)),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  public static make(coordinates: any): Polygon | null {
    return ignoreError(() =>
      coordinates.map((ring: any) =>
        ring.map((coord: any) => new Coordinates(coord as [number, number])),
      ),
    )
      .map((rings) => new Polygon(rings))
      .orDefault(null);
  }
}

/**
 * Geometry Collection
 * https://tools.ietf.org/html/rfc7946#section-3.1.8
 */
export class MultiPolygon implements GeoJsonObject, JSONSerializable {
  readonly type = 'MultiPolygon';
  public coordinates: Coordinates[][][];
  public bbox?: BBox;

  constructor(coordinates: Coordinates[][][], bbox?: BBox) {
    this.coordinates = coordinates;
    this.bbox = bbox;
  }

  public toJSON(): any {
    return {
      type: this.type,
      coordinates: this.coordinates.map((polygon) =>
        polygon.map((ring) => ring.map((coord) => coord.value)),
      ),
      ...(this.bbox && { bbox: this.bbox }),
    };
  }

  public static make(coordinates: any): MultiPolygon | null {
    return ignoreError(() =>
      coordinates.map((polygon: any) =>
        polygon.map((ring: any) =>
          ring.map((coord: any) => new Coordinates(coord as [number, number])),
        ),
      ),
    )
      .map((polygons) => new MultiPolygon(polygons))
      .orDefault(null);
  }
}
