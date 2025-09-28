import { injectable, inject } from 'inversify';

import {
  type Geometry,
  type Coordinates,
  GeoJsonType,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  isDefined,
} from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import type { LoggerController } from '#/logger';
import { type GeometryEo } from '#/database/geometry-eo';
import type { ApiKitController } from '#/configuration';

const LOG_PREFIX = '[MongoDbGeoJSONFormatter]';

export interface MongoDbGeoJSONFormatter {
  /**
   * Converts a persisted Entity Object (EO) from MongoDB into a domain geometry instance.
   *
   * - By default, returns a union type {@link Geometry}.
   * - Optionally, pass a generic type parameter to narrow to a specific geometry class
   *   (e.g. {@link Point}, {@link Polygon}).
   *
   * @typeParam T - The expected geometry subclass. Defaults to {@link Geometry}.
   * @param eo    A geometry entity object (as stored in MongoDB), or unknown.
   * @returns     A domain geometry instance of type `T`.
   *
   * @example
   * // Case 1: EO → Geometry (union)
   * const g1 = formatter.toDomain(doc.geometry);
   * // g1: Geometry
   *
   * @example
   * // Case 2: EO → Point (specific)
   * const g2 = formatter.toDomain<Point>(doc.geometry);
   * // g2: Point
   *
   * @example
   * // Case 3: Point → EO
   * const eo1 = formatter.toEo(new Point([1, 2]));
   * // eo1: GeometryEo
   *
   * @example
   * // Case 4: Point → EO but return as Geometry
   * const g3: Geometry = formatter.toDomain<Point>(eo1);
   * // g3: Geometry (upcast is fine)
   *
   * @throws {Error} Throws if the geometry type is unsupported (invalid type).
   */
  toDomain<T extends Geometry = Geometry>(eo: GeometryEo | unknown): T;

  /**
   * Converts domain geometry into its corresponding Entity Object (EO) for MongoDB representation.
   *
   * @param domain  The geometry instance to be converted.
   * @param options Optional options for customizing the conversion behavior (e.g., whether to include an empty `bbox`).
   * @returns Geometry Entity Object (GeometryEo) for storage in MongoDB.
   */
  toEo(domain: Geometry | unknown, options?: { includeEmptyBbox?: boolean }): GeometryEo;
}

@injectable()
export class MongoDbGeoJSONFormatterImpl implements MongoDbGeoJSONFormatter {
  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitController,
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
  ) {}

  public toDomain<T extends Geometry = Geometry>(eo: GeometryEo | unknown): T {
    try {
      const entity = eo as GeometryEo;

      switch (entity.type) {
        case GeoJsonType.Point:
          return new Point(entity.coordinates as Coordinates, entity.bbox) as T;
        case GeoJsonType.MultiPoint:
          return new MultiPoint(entity.coordinates as Coordinates[], entity.bbox) as T;
        case GeoJsonType.LineString:
          return new LineString(entity.coordinates as Coordinates[], entity.bbox) as T;
        case GeoJsonType.MultiLineString:
          return new MultiLineString(entity.coordinates as Coordinates[][], entity.bbox) as T;
        case GeoJsonType.Polygon:
          return new Polygon(entity.coordinates as Coordinates[][], entity.bbox) as T;
        case GeoJsonType.MultiPolygon:
          return new MultiPolygon(entity.coordinates as Coordinates[][][], entity.bbox) as T;
        default:
          throw new Error(`Unsupported geometry type: ${entity.type}`);
      }
    } catch (error) {
      if (this.configuration.isDebug) {
        this.logger.error(`${LOG_PREFIX} toDomain() failed`, { details: { input: eo }, error: error });
      }
      throw error;
    }
  }

  public toEo(
    domain: Geometry | unknown,
    options: { includeEmptyBbox?: boolean } = { includeEmptyBbox: false },
  ): GeometryEo {
    try {
      const geometry = domain as Geometry;

      const eo: GeometryEo = {
        type: geometry.type,
        coordinates: geometry.coordinates,
      };

      if (isDefined(geometry.bbox)) {
        const isBboxEmpty = geometry.bbox.isEmpty();

        // MARK: Only include `bbox` if it's non-empty, or if `includeEmptyBbox` is true
        if (!isBboxEmpty || options.includeEmptyBbox) {
          eo.bbox = geometry.bbox;
        }
      }

      return eo;
    } catch (error) {
      if (this.configuration.isDebug) {
        this.logger.error(`${LOG_PREFIX} toEo() failed`, { details: { input: domain }, error: error });
      }
      throw error;
    }
  }
}
