import { NIL, v1, v3, v4, v5, validate } from "uuid";

// UUID version type
export type UUIDVersion = "v1" | "v3" | "v4" | "v5" | "nil";

// Options interface for UUID generation
export interface UUIDOptions {
  version: UUIDVersion;
  namespace?: string;
  name?: string;
  quantity?: number;
  hyphens?: boolean;
  uppercase?: boolean;
  braces?: boolean;
  quotes?: boolean;
  commas?: boolean;
}

// Predefined namespaces (RFC4122)
export const PREDEFINED_NAMESPACES = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
} as const;

// Supported UUID versions
export const UUID_VERSIONS: readonly UUIDVersion[] = [
  "v1",
  "v3",
  "v4",
  "v5",
  "nil",
];

// Versions requiring namespace
export const NAMESPACE_VERSIONS: readonly UUIDVersion[] = ["v3", "v5"];

// Validate if a string is a valid UUID
export function ValidateUUID(uuid: string): boolean {
  try {
    return validate(uuid);
  } catch {
    return false;
  }
}

// Check if UUID version requires namespace and name
export function RequiresNamespace(version: UUIDVersion): boolean {
  return NAMESPACE_VERSIONS.includes(version);
}

// Format UUID string according to options
function formatUUID(
  uuid: string,
  options: Pick<
    UUIDOptions,
    "hyphens" | "uppercase" | "braces" | "quotes" | "commas"
  >
): string {
  let formatted = uuid;

  // remove hyphens if needed
  if (options.hyphens === false) {
    formatted = formatted.replace(/-/g, "");
  }

  // apply case formatting
  formatted = options.uppercase
    ? formatted.toUpperCase()
    : formatted.toLowerCase();

  // add braces if needed
  if (options.braces) {
    formatted = `{${formatted}}`;
  }

  // add quotes if needed
  if (options.quotes) {
    formatted = `"${formatted}"`;
  }

  // add comma at the end if needed
  if (options.commas) {
    formatted = `${formatted},`;
  }

  return formatted;
}

// Generate UUID v3 or v5 from namespace and name
function generateNamespaceUUID(
  version: "v3" | "v5",
  name: string,
  namespace: string
): string {
  if (!name || !namespace) {
    return "";
  }

  return version === "v3" ? v3(name, namespace) : v5(name, namespace);
}

// Generate a single UUID with the specified options
export function GenerateUUID(options: UUIDOptions): string {
  try {
    let uuid: string;

    switch (options.version) {
      case "v1":
        uuid = v1();
        break;
      case "v3":
      case "v5":
        uuid = generateNamespaceUUID(
          options.version,
          options.name || "",
          options.namespace || ""
        );
        break;
      case "nil":
        uuid = NIL;
        break;
      case "v4":
      default:
        uuid = v4();
    }

    return formatUUID(uuid, options);
  } catch (error) {
    console.error("UUID generation error:", error);
    return "";
  }
}

// Generate multiple UUIDs with the specified options
export function GenerateUUIDs(options: UUIDOptions): string[] {
  try {
    const quantity = Math.max(1, options.quantity || 1);
    const uuids = Array.from({ length: quantity }, () =>
      GenerateUUID(options)
    ).filter((uuid) => uuid !== "");

    return uuids;
  } catch (error) {
    console.error("UUID generation error:", error);
    return [];
  }
}
