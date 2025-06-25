/* MARK: - Error Response */
export const ErrorResponseSchema = {
  $id: 'ErrorResponse',
  type: 'object',
  properties: {
    code: { type: 'string', example: 'UNAUTHORIZED' },
    message: { type: 'string', example: 'Authorization failed' },
    details: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { type: 'string' },
      },
      example: {
        deviceId: ['Required'],
        password: ['Must be at least 8 chars'],
      },
    },
  },
  required: ['code', 'message'],
};

/* MARK: - Localizable Text */
export const LocalizableTextSchema = {
  $id: 'LocalizableText',
  type: 'object',
  additionalProperties: { type: 'string' },
  example: {
    en: 'Entertainment',
    fr: 'Divertissement',
    es: 'Entretenimiento',
  },
};

/* MARK: - Device */
export const DeviceSchema = {
  $id: 'Device',
  type: 'object',
  required: ['deviceId'],
  properties: {
    deviceId: {
      type: 'string',
      description: 'A unique identifier for the device',
      example: '2D4C2D66-6E6A-4E1A-AC79-6A2CF2349F9D',
    },
    deviceName: {
      type: 'string',
      description: 'Name of the device (e.g., "John\'s iPhone")',
      example: "John's iPhone",
    },
    deviceType: { $ref: 'DeviceType#' },
    osType: { $ref: 'OSType#' },
    osVersion: {
      type: 'string',
      description: 'Version of the operating system',
      example: '14.3',
    },
    appVersion: {
      type: 'string',
      description: 'Version of the application',
      example: '2.1.0',
    },
    locale: {
      type: 'string',
      description: 'Locale settings of the device',
      example: 'en-US',
    },
    pushToken: {
      type: 'string',
      description: 'Push notification token',
      example: 'fake_push_token',
    },
    pushNotificationStatus: {
      $ref: 'PushNotificationStatus#',
      description: 'Push notification status',
      example: 'ON',
    },
  },
};
export const OSTypeSchema = {
  $id: 'OSType',
  type: 'string',
  // Enums in JSON Schema (and thus in OpenAPI) are case-sensitive.
  // enum: ['ios', 'android', 'windows', 'macos', 'linux', 'unknown'],
  description: 'Operating system of the device',
  example: 'ios',
};
export const DeviceTypeSchema = {
  $id: 'DeviceType',
  type: 'string',
  // Enums in JSON Schema (and thus in OpenAPI) are case-sensitive.
  // enum: ['mobile', 'desktop', 'web', 'tablet', 'unknown'],
  description: 'Type of the device',
  example: 'mobile',
};
export const PushNotificationStatusSchema = {
  $id: 'PushNotificationStatus',
  type: 'string',
  enum: ['UNKNOWN', 'ON', 'OFF'],
  description: 'Push notification status',
  example: 'ON',
};

/* MARK: - Email */
export const EmailSchema = {
  $id: 'Email',
  type: 'object',
  properties: {
    original: { type: 'string', example: 'john@doe.com' },
    normalized: { type: 'string', example: 'john.doe@gmail.com' },
  },
  required: ['original', 'normalized'],
};

/* MARK: - Phone */
export const PhoneSchema = {
  $id: 'Phone',
  type: 'object',
  properties: {
    e164: { type: 'string', example: '+421000000000' },
    international: { type: 'string', example: '+421 000 000 000' },
  },
  required: ['e164', 'international'],
};

/* MARK: - Opening Hour */
export const OpeningHourSchema = {
  $id: 'OpeningHour',
  type: 'object',
  properties: {
    day: { type: 'number', example: 1 },
    intervals: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          open: { type: 'string', example: '09:00' },
          close: { type: 'string', example: '17:00' },
        },
        required: ['open', 'close'],
      },
      example: [
        { open: '09:00', close: '17:00' },
        { open: '18:00', close: '24:00' },
      ],
    },
  },
  required: ['day', 'intervals'],
  example: {
    day: 1,
    intervals: [
      { open: '09:00', close: '17:00' },
      { open: '18:00', close: '24:00' },
    ],
  },
};

/* MARK: - The GeoJSON Format (RFC 7946) */
export const GeometrySchema = {
  $id: 'Geometry',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      type: 'string',
      enum: ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
      description: 'Specifies the type of GeoJSON object.',
    },
    coordinates: {
      oneOf: [
        {
          // Point: A single coordinate pair [longitude, latitude]
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: { type: 'number' },
          description: 'A single coordinate pair for a Point geometry.',
        },
        {
          // MultiPoint: An array of coordinate pairs for multiple points
          type: 'array',
          items: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            items: { type: 'number' },
          },
          description: 'An array of coordinate pairs for a MultiPoint geometry.',
        },
        {
          // LineString: An array of coordinate pairs representing a line
          type: 'array',
          minItems: 2,
          items: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            items: { type: 'number' },
          },
          description: 'An array of coordinate pairs representing a LineString geometry.',
        },
        {
          // MultiLineString: An array of LineStrings
          type: 'array',
          items: {
            type: 'array',
            minItems: 2,
            items: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              items: { type: 'number' },
            },
          },
          description: 'An array of arrays, each representing a LineString in a MultiLineString geometry.',
        },
        {
          // Polygon: An array of linear ring coordinate arrays, first array as outer boundary, others as holes
          type: 'array',
          minItems: 1,
          items: {
            type: 'array',
            minItems: 4,
            items: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              items: { type: 'number' },
            },
          },
          description: 'A Polygon geometry with an outer boundary and optional inner holes.',
        },
        {
          // MultiPolygon: An array of Polygons
          type: 'array',
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'array',
              minItems: 4,
              items: {
                type: 'array',
                minItems: 2,
                maxItems: 2,
                items: { type: 'number' },
              },
            },
          },
          description: 'An array of Polygons for a MultiPolygon geometry.',
        },
      ],
    },
  },
  description: `
    A GeoJSON Geometry object as defined in RFC 7946.
    The "type" property defines the type of geometry, while "coordinates" provides the geometric coordinates.
    Supported geometry types include Point, MultiPoint, LineString, MultiLineString, Polygon, and MultiPolygon.
    All coordinates should follow the [longitude, latitude] order, in compliance with GeoJSON standards.
  `,
  example: [
    {
      type: 'Point',
      coordinates: [16.464199756272475, 44.9152491664187],
    },
    {
      type: 'MultiPoint',
      coordinates: [
        [16.464199756272475, 44.9152491664187],
        [21.165095541202245, 44.9152491664187],
      ],
    },
    {
      type: 'LineString',
      coordinates: [
        [16.464199756272475, 44.9152491664187],
        [21.165095541202245, 51.073426435525455],
      ],
    },
    {
      type: 'Polygon',
      coordinates: [
        [
          [16.464199756272475, 44.9152491664187],
          [21.165095541202245, 44.9152491664187],
          [21.165095541202245, 51.073426435525455],
          [16.464199756272475, 51.073426435525455],
          [16.464199756272475, 44.9152491664187],
        ],
      ],
    },
    {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [16.464199756272475, 44.9152491664187],
            [21.165095541202245, 44.9152491664187],
            [21.165095541202245, 51.073426435525455],
            [16.464199756272475, 51.073426435525455],
            [16.464199756272475, 44.9152491664187],
          ],
        ],
        [
          [
            [17.464199756272475, 45.9152491664187],
            [22.165095541202245, 45.9152491664187],
            [22.165095541202245, 52.073426435525455],
            [17.464199756272475, 52.073426435525455],
            [17.464199756272475, 45.9152491664187],
          ],
        ],
      ],
    },
  ],
};
export const PolygonSchema = {
  $id: 'Polygon',
  type: 'array',
  minItems: 1,
  items: {
    type: 'array',
    minItems: 4,
    items: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: { type: 'number' },
    },
  },
  description: `
    A Polygon as per GeoJSON RFC 7946.
    Coordinates should represent an outer boundary (first array) and optional holes (subsequent arrays).
  `,
  example: [
    [
      [16.464199756272475, 44.9152491664187],
      [21.165095541202245, 44.9152491664187],
      [21.165095541202245, 51.073426435525455],
      [16.464199756272475, 51.073426435525455],
      [16.464199756272475, 44.9152491664187],
    ],
  ],
};

export const ApiKitSchemas = {
  ErrorResponse: ErrorResponseSchema,
  LocalizableText: LocalizableTextSchema,
  Device: DeviceSchema,
  OSType: OSTypeSchema,
  DeviceType: DeviceTypeSchema,
  PushNotificationStatus: PushNotificationStatusSchema,
  Email: EmailSchema,
  Phone: PhoneSchema,
  OpeningHour: OpeningHourSchema,
  Geometry: GeometrySchema,
  Polygon: PolygonSchema,
};
