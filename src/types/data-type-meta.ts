import { flags } from "../binary/flags";
import { DataType } from "./data-types";
import { IntTypeMeta, parseIntType } from "./int-type-meta";

export type DataTypeMeta = {
  magic: number;
  type: DataType;
  lengthType?: IntTypeMeta;
  dataLength?: number;
};

export function resolveLengthType(magic: number) {
  let meta = parseIntType(magic);
  if (meta.length > 4 || meta.signed) {
    throw new Error(`Failed to parse length type from magic: ${magic}.`);
  }
  return meta;
}

export function makeDataTypeMeta(magic: number): DataTypeMeta {
  let type: DataType;
  let lengthType: IntTypeMeta | undefined;
  let dataLength: number | undefined;
  if (magic === flags.UNDEFINED) {
    type = DataType.Undefined;
    dataLength = 0;
  } else if ((magic & flags.EXTENDABLE_MASK) === flags.EXTENDABLE_MASK) {
    if ((magic & flags.EXTEND_DATETIME) === flags.EXTEND_DATETIME) {
      type = DataType.DateTime;
      let intType = parseIntType(magic);
      dataLength = intType.length;
    } else {
      throw new Error(`Un-recognized extendable magic: ${magic}.`);
    }
  } else if ((magic & flags.DOCUMENT) === flags.DOCUMENT) {
    type = DataType.Document;
    lengthType = resolveLengthType(magic);
  } else if ((magic & flags.BINARY) === flags.BINARY) {
    type = DataType.Binary;
    lengthType = resolveLengthType(magic);
  } else if ((magic & flags.STRING) === flags.STRING) {
    type = DataType.String;
    lengthType = resolveLengthType(magic);
  } else if ((magic & flags.INTEGER) === flags.INTEGER) {
    type = DataType.Integer;
    let intType = parseIntType(magic);
    dataLength = intType.length;
  } else if ((magic & flags.DECIMAL) === flags.DECIMAL) {
    type = DataType.Decimal;
    if ((magic & flags.DOUBLE) === flags.DOUBLE) {
      dataLength = 8;
    } else {
      dataLength = 4;
    }
  } else if (magic === flags.TRUE || magic === flags.FALSE) {
    type = DataType.Boolean;
    dataLength = 0;
  } else {
    throw new Error(`Un-recognized magic: ${magic}.`);
  }
  return { magic, type, lengthType, dataLength };
}
