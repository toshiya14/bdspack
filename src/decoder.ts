import { DataHeader } from "./binary/data-header";
import { flags } from "./binary/flags";
import { DataBox, makeDataBox } from "./types/data-box";
import { makeDataTypeMeta, resolveLengthType } from "./types/data-type-meta";
import { DataType } from "./types/data-types";
import { IntTypeMeta, parseIntType } from "./types/int-type-meta";
import {
  BytesToDouble,
  BytesToInt16,
  BytesToInt32,
  BytesToInt64,
  BytesToInt8,
  BytesToUInt16,
  BytesToUInt32,
  BytesToUInt64,
  BytesToUInt8
} from "./utils/bit-converter";
import { MemoryStream } from "./utils/memory-stream";

export function unpack(bytes: Uint8Array) {
  let stream = new MemoryStream(bytes);
  return unpackStream(stream, true);
}

function unpackStream(stream: MemoryStream, isRoot: boolean, isDictType?: boolean) {
  let length = stream.length;
  if (isRoot) {
    let header = getHeader(stream);
    isDictType = header.isDictType;
    length = header.length;
  }
  let dict: { [name: string]: any } = {};
  let index = 0;
  while (stream.position() < length) {
    var name = index.toString();
    if (isDictType) {
      let nameBox = decodeNextValue(stream);
      if (nameBox.dataType !== DataType.String) {
        throw new Error(`Get non-string value while getting the name. index: ${index}`);
      }
      name = nameBox.value as string;
    }
    let box = decodeNextValue(stream);
    let value = box.value;
    dict[name] = value;
    index += 1;
  }
  return dict;
}

function getHeader(stream: MemoryStream): DataHeader {
  let docMagic = stream.readbyte();
  let lengthIntType = resolveLengthType(docMagic);

  // length part
  let lengthPayload = stream.read(lengthIntType.length);
  let bodySizeBox = decodeInt(lengthPayload, lengthIntType);
  let bodySize = bodySizeBox.value as number;
  let bodyOffset = 1 + lengthPayload.length;

  if (bodySize + bodyOffset > stream.length) {
    throw new Error("The datapack is broken.");
  }

  let h: DataHeader = {
    magic: docMagic,
    isDictType: checkDocType(docMagic),
    length: bodySize
  };
  return h;
}

function decodeInt(payload: Uint8Array, meta?: IntTypeMeta): DataBox {
  let intMeta: IntTypeMeta;
  let copy = payload;
  if (meta) {
    intMeta = meta;
    if (payload.byteLength !== meta.length) {
      throw new Error("The length of payload not matches meta length.");
    }
  } else {
    let magic = payload.at(0);
    if (!magic) {
      throw new Error("Reaches the end of stream.");
    }
    intMeta = resolveLengthType(magic);
    if (payload.byteLength < 1 + intMeta.length) {
      throw new Error("The length of payload not matches its meta length.");
    }
    copy = payload.slice(1);
  }

  if (intMeta.signed) {
    switch (intMeta.length) {
      case 1:
        return makeDataBox(BytesToInt8(copy));
      case 2:
        return makeDataBox(BytesToInt16(copy));
      case 4:
        return makeDataBox(BytesToInt32(copy));
      case 8:
        return makeDataBox(BytesToInt64(copy));
      default:
        throw new Error(`Excepted int length: ${intMeta.length}.`);
    }
  } else {
    switch (intMeta.length) {
      case 1:
        return makeDataBox(BytesToUInt8(copy));
      case 2:
        return makeDataBox(BytesToUInt16(copy));
      case 4:
        return makeDataBox(BytesToUInt32(copy));
      case 8:
        return makeDataBox(BytesToUInt64(copy));
      default:
        throw new Error(`Excepted int length: ${intMeta.length}.`);
    }
  }
}

function checkDocType(magic: number): boolean {
  let docType = magic & flags.DOCTYPE_MASK;

  // embedded
  if ((docType & flags.DOCUMENT) !== flags.DOCUMENT) {
    // root
    if ((docType & flags.ROOT) !== flags.ROOT) {
      throw new Error(`Not document type: ${docType}.`);
    }
  }

  if ((docType & flags.LIST) === flags.LIST) {
    return false;
  } else {
    return true;
  }
}

function decodeNextValue(stream: MemoryStream): DataBox {
  let magic = stream.readbyte();
  if (magic < 0) {
    throw new Error("Failed to read magic from stream");
  }
  let dataType = makeDataTypeMeta(magic);
  let length: number;
  if (
    dataType.type === DataType.String ||
    dataType.type === DataType.Document ||
    dataType.type === DataType.Binary
  ) {
    if (typeof dataType.lengthType === "undefined") {
      throw new Error(`When type is ${dataType.type}, lengthType should be set in DataTypeMeta.FromMagic().`);
    }
    let lengthPayload = stream.read(dataType.lengthType.length);
    let bodySizeBox = decodeInt(lengthPayload, dataType.lengthType);
    let bodySize = bodySizeBox.value as number;
    length = bodySize;
  } else {
    if (typeof dataType.dataLength === "undefined") {
      console.error("When type is ", DataType, "dataLength should be set in DataTypeMeta.FromMagic().");
      throw new Error(`When type is ${dataType.type}, dataLength should be set in DataTypeMeta.FromMagic().`);
    }
    length = dataType.dataLength;
  }

  let payload = stream.read(length);
  return decodeValue(dataType.type, payload, magic);
}

function decodeValue(type: DataType, payload: Uint8Array, magic: number): DataBox {
  switch (type) {
    case DataType.Undefined:
      return makeDataBox(null);

    case DataType.Boolean:
      if ((magic & flags.TRUE) === magic) {
        return makeDataBox(true);
      } else {
        return makeDataBox(false);
      }

    case DataType.Decimal:
      if ((magic & flags.DOUBLE) === magic) {
        return makeDataBox(BytesToDouble(payload));
      } else {
        return makeDataBox(BytesToDouble(payload));
      }

    case DataType.Integer:
      return decodeInt(payload, parseIntType(magic));

    case DataType.String:
      let dec = new TextDecoder();
      return makeDataBox(dec.decode(payload));

    case DataType.Binary:
      return makeDataBox(payload);

    case DataType.Document:
      return makeDataBox(unpackStream(new MemoryStream(payload), false, checkDocType(magic)));

    case DataType.DateTime:
      let intBox = decodeInt(payload, parseIntType(magic));
      intBox.dataType = DataType.DateTime;
      intBox.value = new Date(intBox.value * 1000);
      return intBox;

    default:
      throw new Error(`Unsupported data type while decode: ${type}`);
  }
}
