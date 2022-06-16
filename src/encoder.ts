import { DataFragment } from "./binary/data-fragment";
import { EncodeDataPack } from "./binary/encode-data-pack";
import { flags } from "./binary/flags";
import { DataBox, makeDataBox } from "./types/data-box";
import { DataType } from "./types/data-types";
import {
  DoubleToBytes,
  Int16ToBytes,
  Int32ToBytes,
  Int64ToBytes,
  Int8ToBytes,
  SingleToBytes,
  UInt16ToBytes,
  UInt32ToBytes,
  UInt64ToBytes,
  UInt8ToBytes
} from "./utils/bit-converter";
import { MemoryStream } from "./utils/memory-stream";

export function pack(obj: any) {
  let box = makeDataBox(obj);
  if (box.dataType !== DataType.Document) {
    throw new Error(`The object to be packed should be \`document\` type, but got ${box.dataType}.`);
  }
  var boxes = box.boxes;
  if (typeof boxes === "undefined") {
    throw new Error("While packing document, boxes should be set.");
  }
  if (typeof box.isDictType === "undefined") {
    throw new Error("While packing boxes, isDictType should be set.");
  }
  return packBoxes(boxes, true, box.isDictType);
}

function packBoxes(boxes: DataBox[], isRoot: boolean, isDictType: boolean) {
  let pack = new EncodeDataPack(isRoot, isDictType);
  let body = new MemoryStream();
  for (let box of boxes) {
    if (isDictType) {
      if (!box.name) {
        throw new Error("Got name={null} in dictionary mode.");
      }
      let nameBox = makeDataBox(box.name);
      let nameFragment = encodeBox(nameBox);
      body.writebyte(nameFragment.magic);
      if (nameFragment.length) {
        body.write(nameFragment.length);
      } else {
        throw new Error("Must write name but got {null}.");
      }
      if (nameFragment.payload) {
        body.write(nameFragment.payload);
      } else {
        throw new Error("Must write name but got {null}.");
      }
    }

    let valueFragment = encodeBox(box);
    body.writebyte(valueFragment.magic);
    if (valueFragment.length) {
      body.write(valueFragment.length);
    }
    if (valueFragment.payload) {
      body.write(valueFragment.payload);
    }
    pack.setBody(body.getBuffer());
  }
  return pack.toBytes();
}

function encodeInteger(box: DataBox): DataFragment {
  if (!box.intMeta) {
    console.error(`Failed to get intMeta from `, box);
    throw new Error(`Failed to get intMeta.`);
  }
  let intValue = box.value;
  if (typeof intValue === "undefined") {
    console.error("box:", box, "value:", intValue);
    throw new Error("Failed to get intValue.");
  }
  switch (box.intMeta.length) {
    case 1:
      return {
        magic: flags.INTEGER | (box.intMeta.signed ? flags.SIGNED : 0) | flags.INT8,
        payload: box.intMeta.signed ? Int8ToBytes(intValue) : UInt8ToBytes(intValue)
      };
    case 2:
      return {
        magic: flags.INTEGER | (box.intMeta.signed ? flags.SIGNED : 0) | flags.INT16,
        payload: box.intMeta.signed ? Int16ToBytes(intValue) : UInt16ToBytes(intValue)
      };
    case 4:
      return {
        magic: flags.INTEGER | (box.intMeta.signed ? flags.SIGNED : 0) | flags.INT32,
        payload: box.intMeta.signed ? Int32ToBytes(intValue) : UInt32ToBytes(intValue)
      };
    case 8:
      return {
        magic: flags.INTEGER | (box.intMeta.signed ? flags.SIGNED : 0) | flags.INT64,
        payload: box.intMeta.signed ? Int64ToBytes(intValue) : UInt64ToBytes(intValue)
      };
    default:
      throw new Error("Unsupported int length.");
  }
}

export function encodeBox(box: DataBox): DataFragment {
  switch (box.dataType) {
    case DataType.Boolean:
      let boolValue = box.value as boolean;
      return {
        magic: boolValue ? flags.TRUE : flags.FALSE
      };
    case DataType.Decimal:
      return {
        magic: flags.DOUBLE | flags.DECIMAL,
        payload: DoubleToBytes(box.value as number)
      };
    case DataType.Undefined:
      return {
        magic: flags.UNDEFINED
      };
    case DataType.Binary:
      let bytesValue = box.value as Uint8Array;
      if (!bytesValue) {
        console.error("box:", box, "value:", bytesValue);
        throw new Error("value is not Uint8Array.");
      }
      let bytesLength = bytesValue.byteLength;
      let lengthBox = makeDataBox(bytesLength);
      let lengthFragment = encodeBox(lengthBox);
      let magic = lengthFragment.magic | flags.BINARY;
      return {
        magic,
        length: lengthFragment.payload,
        payload: bytesValue
      };
    case DataType.Integer:
      return encodeInteger(box);

    case DataType.String:
      let stringValue = box.value as string;
      if (typeof stringValue === "undefined") {
        console.error("box:", box, "value:", stringValue);
        throw new Error("Could not fetch string value.");
      } else {
        let txtenc = new TextEncoder();
        let bytes = txtenc.encode(stringValue);
        let bytesLength = bytes.byteLength;
        let lengthBox = makeDataBox(bytesLength);
        let lengthFragment = encodeBox(lengthBox);
        let magic = lengthFragment.magic | flags.STRING;
        return {
          magic,
          length: lengthFragment.payload,
          payload: bytes
        };
      }

    case DataType.Document:
      let docValue = box.boxes;
      if (!docValue) {
        console.error("box:", box, "value:", docValue);
        throw new Error(`Failed to fetch boxes.`);
      } else {
        if (typeof box.isDictType === "undefined") {
          throw new Error("isDictType must be set while encoding document type.");
        } else {
          let bytes = packBoxes(docValue, false, box.isDictType);
          let bytesLength = bytes.byteLength;
          let lengthBox = makeDataBox(bytesLength);
          let lengthFragment = encodeBox(lengthBox);
          let magic =
            lengthFragment.magic | flags.DOCUMENT | (box.isDictType ? flags.DICTIONARY : flags.LIST);
          return {
            magic,
            length: lengthFragment.payload,
            payload: bytes
          };
        }
      }

    case DataType.DateTime:
      let fragment = encodeInteger(box);
      fragment.magic = fragment.magic | flags.EXTENDABLE_MASK | flags.EXTEND_DATETIME;
      return fragment;

    default:
      throw new Error(`Unsupported data type: ${box.dataType}.`);
  }
}
