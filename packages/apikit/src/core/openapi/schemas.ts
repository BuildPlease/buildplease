/* MARK: - Error Response */
const ErrorResponseSchema = {
  $id: 'ErrorResponse',
  type: 'object',
  properties: {
    code: { type: 'string', example: 'UNAUTHORIZED' },
    message: { type: 'string', example: 'Authorization failed' },
    details: {
      type: 'object',
      additionalProperties: true,
    },
  },
  required: ['code', 'message'],
};

/* MARK: - Coordinates */
const CoordinatesSchema = {
  $id: 'Coordinates',
  type: 'array',
  items: { type: 'number' },
  minItems: 2,
  maxItems: 2,
  description: 'A coordinate pair [longitude, latitude]',
  example: [16.464199756272475, 44.9152491664187],
};

/* MARK: - BBox */
const BBoxSchema = {
  $id: 'BBox',
  oneOf: [
    {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: { type: 'number' },
      description: '2D bounding box [west, south, east, north]',
    },
    {
      type: 'array',
      minItems: 6,
      maxItems: 6,
      items: { type: 'number' },
      description: '3D bounding box [west, south, minZ, east, north, maxZ]',
    },
  ],
  example: [16.46, 44.91, 21.16, 51.07],
};

/* MARK: - Point */
const PointGeometrySchema = {
  $id: 'PointGeometry',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: { type: 'string', enum: ['Point'] },
    coordinates: { $ref: 'Coordinates#' },
    bbox: { $ref: 'BBox#' },
  },
  example: {
    type: 'Point',
    coordinates: [16.46, 44.91],
  },
};

/* MARK: - MultiPoint */
const MultiPointGeometrySchema = {
  $id: 'MultiPointGeometry',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: { type: 'string', enum: ['MultiPoint'] },
    coordinates: {
      type: 'array',
      items: { $ref: 'Coordinates#' },
    },
    bbox: { $ref: 'BBox#' },
  },
  example: {
    type: 'MultiPoint',
    coordinates: [
      [16.46, 44.91],
      [21.16, 44.91],
    ],
  },
};

/* MARK: - LineString */
const LineStringGeometrySchema = {
  $id: 'LineStringGeometry',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: { type: 'string', enum: ['LineString'] },
    coordinates: {
      type: 'array',
      minItems: 2,
      items: { $ref: 'Coordinates#' },
    },
    bbox: { $ref: 'BBox#' },
  },
  example: {
    type: 'LineString',
    coordinates: [
      [16.46, 44.91],
      [21.16, 51.07],
    ],
  },
};

/* MARK: - MultiLineString */
const MultiLineStringGeometrySchema = {
  $id: 'MultiLineStringGeometry',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: { type: 'string', enum: ['MultiLineString'] },
    coordinates: {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        items: { $ref: 'Coordinates#' },
      },
    },
    bbox: { $ref: 'BBox#' },
  },
  example: {
    type: 'MultiLineString',
    coordinates: [
      [
        [16.46, 44.91],
        [21.16, 44.91],
      ],
      [
        [18.46, 46.91],
        [22.16, 48.91],
      ],
    ],
  },
};

/* MARK: - Polygon */
const PolygonGeometrySchema = {
  $id: 'PolygonGeometry',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: { type: 'string', enum: ['Polygon'] },
    coordinates: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'array',
        minItems: 4,
        items: { $ref: 'Coordinates#' },
      },
    },
    bbox: { $ref: 'BBox#' },
  },
  example: {
    type: 'Polygon',
    coordinates: [
      [
        [16.46, 44.91],
        [21.16, 44.91],
        [21.16, 51.07],
        [16.46, 51.07],
        [16.46, 44.91],
      ],
    ],
  },
};

/* MARK: - MultiPolygon */
const MultiPolygonGeometrySchema = {
  $id: 'MultiPolygonGeometry',
  type: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: { type: 'string', enum: ['MultiPolygon'] },
    coordinates: {
      type: 'array',
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'array',
          minItems: 4,
          items: { $ref: 'Coordinates#' },
        },
      },
    },
    bbox: { $ref: 'BBox#' },
  },
  example: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [16.46, 44.91],
          [21.16, 44.91],
          [21.16, 51.07],
          [16.46, 51.07],
          [16.46, 44.91],
        ],
      ],
      [
        [
          [17.46, 45.91],
          [22.16, 45.91],
          [22.16, 52.07],
          [17.46, 52.07],
          [17.46, 45.91],
        ],
      ],
    ],
  },
};

/* MARK: - Union Geometry */
const GeometrySchema = {
  $id: 'Geometry',
  oneOf: [
    { $ref: 'PointGeometry#' },
    { $ref: 'MultiPointGeometry#' },
    { $ref: 'LineStringGeometry#' },
    { $ref: 'MultiLineStringGeometry#' },
    { $ref: 'PolygonGeometry#' },
    { $ref: 'MultiPolygonGeometry#' },
  ],
  description: `
    GeoJSON Geometry object (Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon) as defined in RFC 7946.
    The "type" property defines the type of geometry, while "coordinates" provides the geometric coordinates.
    Supported geometry types include Point, MultiPoint, LineString, MultiLineString, Polygon, and MultiPolygon.
    All coordinates should follow the [longitude, latitude] order, in compliance with GeoJSON standards.
  `,
};

/* MARK: - Localizable Text */
const LocalizableTextSchema = {
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
const DeviceSchema = {
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

const OSTypeSchema = {
  $id: 'OSType',
  type: 'string',
  description: 'Operating system of the device',
  example: 'ios',
};

const DeviceTypeSchema = {
  $id: 'DeviceType',
  type: 'string',
  description: 'Type of the device',
  example: 'mobile',
};

const PushNotificationStatusSchema = {
  $id: 'PushNotificationStatus',
  type: 'string',
  enum: ['UNKNOWN', 'ON', 'OFF'],
  description: 'Push notification status',
  example: 'ON',
};

/* MARK: - Email */
const EmailSchema = {
  $id: 'Email',
  type: 'object',
  properties: {
    original: { type: 'string', example: 'john@doe.com' },
    normalized: { type: 'string', example: 'john.doe@gmail.com' },
  },
  required: ['original', 'normalized'],
};

/* MARK: - Phone */
const PhoneSchema = {
  $id: 'Phone',
  type: 'object',
  properties: {
    e164: { type: 'string', example: '+421000000000' },
    international: { type: 'string', example: '+421 000 000 000' },
  },
  required: ['e164', 'international'],
};

/* MARK: - Opening Hour */
const OpeningHourSchema = {
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

/* MARK: - Contacts */
export const ContactsSchema = {
  $id: 'Contacts',
  type: 'object',
  properties: {
    email: {
      type: 'string',
      nullable: true,
      format: 'email',
      example: 'example@example.com',
    },
    fb: {
      type: 'string',
      nullable: true,
      example: 'example_facebook',
    },
    ig: {
      type: 'string',
      nullable: true,
      example: '@example_instagram',
    },
    phone: {
      type: 'string',
      nullable: true,
      example: '+421 123 456 789',
    },
  },
  additionalProperties: false,
};

/* MARK: - Address */
export const AddressSchema = {
  $id: 'Address',
  type: 'object',
  properties: {
    streetLine1: {
      type: 'string',
      description: 'Primary street line (street and house number)',
      example: '1 Infinite Loop',
    },
    streetLine2: {
      type: 'string',
      nullable: true,
      description: 'Secondary street line (apartment, suite, etc.)',
      example: 'Suite 500',
    },
    city: {
      type: 'string',
      description: 'City or locality',
      example: 'Cupertino',
    },
    postalCode: {
      type: 'string',
      nullable: true,
      description: 'Postal or ZIP code',
      example: '95014',
    },
    state: {
      type: 'string',
      nullable: true,
      description: 'State, province or region',
      example: 'CA',
    },
    country: {
      type: 'string',
      description: 'Country name',
      example: 'United States',
    },
    countryCode: {
      type: 'string',
      nullable: true,
      description: 'ISO 3166-1 alpha-2 country code',
      example: 'US',
    },
  },
  required: ['streetLine1', 'city', 'country'],
  additionalProperties: false,
};

export const OpenAPISchemas = {
  ErrorResponse: ErrorResponseSchema,

  Coordinates: CoordinatesSchema,
  BBox: BBoxSchema,
  PointGeometry: PointGeometrySchema,
  MultiPointGeometry: MultiPointGeometrySchema,
  LineStringGeometry: LineStringGeometrySchema,
  MultiLineStringGeometry: MultiLineStringGeometrySchema,
  PolygonGeometry: PolygonGeometrySchema,
  MultiPolygonGeometry: MultiPolygonGeometrySchema,
  Geometry: GeometrySchema,

  LocalizableText: LocalizableTextSchema,
  Device: DeviceSchema,
  OSType: OSTypeSchema,
  DeviceType: DeviceTypeSchema,
  PushNotificationStatus: PushNotificationStatusSchema,
  Email: EmailSchema,
  Phone: PhoneSchema,
  OpeningHour: OpeningHourSchema,
  Contacts: ContactsSchema,
  Address: AddressSchema,
};
