import { DataType } from "./data-types";
import { IntTypeMeta } from "./int-type-meta";

export type DataBox = {
  value: any;
  boxes?: DataBox[];
  name?: string;
  dataType: DataType;
  isDictType?: boolean;
  intMeta?: IntTypeMeta;
  dataLength?: number;
};

export function makeDataBox(value: any, name?: string): DataBox {
  let dataType: DataType;
  let dataLength: number | undefined;
  let intMeta: IntTypeMeta | undefined;
  let isDictType: boolean | undefined;
  let newValue = value;
  let boxes: DataBox[] | undefined;
  if (typeof value === "undefined" || value === null) {
    dataType = DataType.Undefined;
  } else if (typeof value === "string") {
    dataType = DataType.String;
  } else if (typeof value === "boolean") {
    dataType = DataType.Boolean;
  } else if (value instanceof Date) {
    dataType = DataType.DateTime;
    newValue = value.getTime();
  } else if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
    dataType = DataType.Binary;
    newValue = new Uint8Array(value);
  } else if (typeof value === "number") {
    if (Number.isInteger(value)) {
      dataType = DataType.Integer;
      intMeta = determineMinimalIntType(value);
      dataLength = intMeta.length;
    } else {
      dataType = DataType.Decimal;
      dataLength = 8;
    }
  } else if (typeof value === "bigint") {
    dataType = DataType.Integer;
    intMeta = determineMinimalIntType(value);
    dataLength = intMeta.length;
  } else if (typeof value === "object") {
    dataType = DataType.Document;
    if (Array.isArray(value)) {
      isDictType = false;
      boxes = value.map((x, i) => makeDataBox(x, i.toString()));
    } else {
      isDictType = true;
      boxes = Object.entries(value).map((x, i) => makeDataBox(x[1], x[0]));
    }
  } else {
    throw new Error(`Unsupported data type: ${typeof value}`);
  }
  return { boxes, value: newValue, name, dataType, isDictType, intMeta, dataLength };
}

function determineMinimalIntType(num: number | bigint): IntTypeMeta {
  let signed = num < 0;

  if (num >= -128 && num <= 255) {
    return { signed, length: 1 };
  } else if (num >= -32768 && num <= 65535) {
    return { signed, length: 2 };
  } else if (num >= -2147483648 && num <= 4294967295) {
    return { signed, length: 4 };
  } else {
    return { signed, length: 8 };
  }
}
