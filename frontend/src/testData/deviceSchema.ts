export const C_deviceSchema: any = {
  name: "device",
  kind: "Device",
  description: null,
  default_filter: "name__value",
  display_labels: ["name__value"],
  attributes: [
    {
      name: "name",
      kind: "Text",
      label: "Name",
      description: null,
      default_value: null,
      enum: null,
      regex: null,
      max_length: null,
      min_length: null,
      inherited: false,
      unique: true,
      branch: true,
      optional: false,
    },
    {
      name: "type",
      kind: "Text",
      label: "Type",
      description: null,
      default_value: null,
      enum: null,
      regex: null,
      max_length: null,
      min_length: null,
      inherited: false,
      unique: false,
      branch: true,
      optional: false,
    },
    {
      name: "description",
      kind: "Text",
      label: "Description",
      description: null,
      default_value: null,
      enum: null,
      regex: null,
      max_length: null,
      min_length: null,
      inherited: false,
      unique: false,
      branch: true,
      optional: true,
    },
  ],
  relationships: [
    {
      name: "interfaces",
      peer: "Interface",
      kind: "Component",
      label: "Interfaces",
      description: null,
      identifier: "device__interface",
      inherited: false,
      cardinality: "many",
      branch: true,
      optional: true,
      filters: [
        {
          name: "id",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "enabled__value",
          kind: "Boolean",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "speed__value",
          kind: "Number",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "description__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "name__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
      ],
    },
    {
      name: "role",
      peer: "Role",
      kind: "Attribute",
      label: "Role",
      description: null,
      identifier: "device__role",
      inherited: false,
      cardinality: "one",
      branch: true,
      optional: false,
      filters: [
        {
          name: "id",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "description__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "name__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "label__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
      ],
    },
    {
      name: "status",
      peer: "Status",
      kind: "Attribute",
      label: "Status",
      description: null,
      identifier: "device__status",
      inherited: false,
      cardinality: "one",
      branch: true,
      optional: false,
      filters: [
        {
          name: "id",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "name__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "description__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "label__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
      ],
    },
    {
      name: "asn",
      peer: "AutonomousSystem",
      kind: "Attribute",
      label: "Asn",
      description: null,
      identifier: "autonomoussystem__device",
      inherited: false,
      cardinality: "one",
      branch: true,
      optional: true,
      filters: [
        {
          name: "id",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "asn__value",
          kind: "Number",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "name__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "description__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
      ],
    },
    {
      name: "site",
      peer: "Location",
      kind: "Attribute",
      label: "Site",
      description: null,
      identifier: "device__location",
      inherited: false,
      cardinality: "one",
      branch: true,
      optional: false,
      filters: [
        {
          name: "id",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "type__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "description__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "name__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
      ],
    },
    {
      name: "tags",
      peer: "Tag",
      kind: "Attribute",
      label: "Tags",
      description: null,
      identifier: "device__tag",
      inherited: false,
      cardinality: "many",
      branch: true,
      optional: true,
      filters: [
        {
          name: "id",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "name__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
        {
          name: "description__value",
          kind: "Text",
          enum: null,
          object_kind: null,
          description: null,
        },
      ],
    },
  ],
  label: "Device",
  inherit_from: [],
  groups: [],
  branch: true,
  filters: [
    {
      name: "ids",
      kind: "Text",
      enum: null,
      object_kind: null,
      description: null,
    },
    {
      name: "name__value",
      kind: "Text",
      enum: null,
      object_kind: null,
      description: null,
    },
    {
      name: "type__value",
      kind: "Text",
      enum: null,
      object_kind: null,
      description: null,
    },
    {
      name: "description__value",
      kind: "Text",
      enum: null,
      object_kind: null,
      description: null,
    },
    {
      name: "role__id",
      kind: "Object",
      enum: null,
      object_kind: "Role",
      description: null,
    },
    {
      name: "status__id",
      kind: "Object",
      enum: null,
      object_kind: "Status",
      description: null,
    },
    {
      name: "asn__id",
      kind: "Object",
      enum: null,
      object_kind: "AutonomousSystem",
      description: null,
    },
    {
      name: "site__id",
      kind: "Object",
      enum: null,
      object_kind: "Location",
      description: null,
    },
    {
      name: "tags__id",
      kind: "Object",
      enum: null,
      object_kind: "Tag",
      description: null,
    },
  ],
};

export const C_deviceAttributeColumns = [
  { label: "Description", name: "description" },
  { label: "Name", name: "name" },
  { label: "Type", name: "type" },
];

export const C_deviceRelationshipColumns = [
  { label: "Asn", name: "asn" },
  { label: "Role", name: "role" },
  { label: "Site", name: "site" },
  { label: "Status", name: "status" },
];
export const C_deviceObjectColumns = [
  { label: "Asn", name: "asn" },
  { label: "Description", name: "description" },
  { label: "Name", name: "name" },
  { label: "Role", name: "role" },
  { label: "Site", name: "site" },
  { label: "Status", name: "status" },
  { label: "Type", name: "type" },
];

