export function UInt8ToBytes(value: number) {
  let buffer = new ArrayBuffer(1);
  let dv = new DataView(buffer);
  dv.setUint8(0, value);
  return new Uint8Array(buffer);
}

export function UInt16ToBytes(value: number) {
  let buffer = new ArrayBuffer(2);
  let dv = new DataView(buffer);
  dv.setUint16(0, value, true);
  return new Uint8Array(buffer);
}

export function UInt32ToBytes(value: number) {
  let buffer = new ArrayBuffer(4);
  let dv = new DataView(buffer);
  dv.setUint32(0, value, true);
  return new Uint8Array(buffer);
}

export function UInt64ToBytes(value: bigint) {
  let buffer = new ArrayBuffer(8);
  let dv = new DataView(buffer);
  dv.setBigUint64(0, value, true);
  return new Uint8Array(buffer);
}

export function Int8ToBytes(value: number) {
  let buffer = new ArrayBuffer(1);
  let dv = new DataView(buffer);
  dv.setInt8(0, value);
  return new Uint8Array(buffer);
}

export function Int16ToBytes(value: number) {
  let buffer = new ArrayBuffer(2);
  let dv = new DataView(buffer);
  dv.setInt16(0, value, true);
  return new Uint8Array(buffer);
}

export function Int32ToBytes(value: number) {
  let buffer = new ArrayBuffer(4);
  let dv = new DataView(buffer);
  dv.setInt32(0, value, true);
  return new Uint8Array(buffer);
}

export function Int64ToBytes(value: bigint) {
  let buffer = new ArrayBuffer(8);
  let dv = new DataView(buffer);
  dv.setBigInt64(0, value, true);
  return new Uint8Array(buffer);
}

export function SingleToBytes(value: number) {
  let buffer = new ArrayBuffer(4);
  let dv = new DataView(buffer);
  dv.setFloat32(0, value, true);
  return new Uint8Array(buffer);
}

export function DoubleToBytes(value: number) {
  let buffer = new ArrayBuffer(8);
  let dv = new DataView(buffer);
  dv.setFloat64(0, value, true);
  return new Uint8Array(buffer);
}

export function BytesToInt8(bytes: Uint8Array) {
  if (bytes.byteLength !== 1) {
    throw new Error(`The length of bytes should be 1, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getInt8(0);
  return num;
}

export function BytesToInt16(bytes: Uint8Array) {
  if (bytes.byteLength !== 2) {
    throw new Error(`The length of bytes should be 2, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getInt16(0, true);
  return num;
}

export function BytesToInt32(bytes: Uint8Array) {
  if (bytes.byteLength !== 4) {
    throw new Error(`The length of bytes should be 4, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getInt32(0, true);
  return num;
}

export function BytesToInt64(bytes: Uint8Array) {
  if (bytes.byteLength !== 8) {
    throw new Error(`The length of bytes should be 8, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getBigInt64(0, true);
  return num;
}

export function BytesToUInt8(bytes: Uint8Array) {
  if (bytes.byteLength !== 1) {
    throw new Error(`The length of bytes should be 1, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getUint8(0);
  return num;
}

export function BytesToUInt16(bytes: Uint8Array) {
  if (bytes.byteLength !== 2) {
    throw new Error(`The length of bytes should be 2, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getUint16(0, true);
  return num;
}

export function BytesToUInt32(bytes: Uint8Array) {
  if (bytes.byteLength !== 4) {
    throw new Error(`The length of bytes should be 4, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getUint32(0, true);
  return num;
}

export function BytesToUInt64(bytes: Uint8Array) {
  if (bytes.byteLength !== 8) {
    throw new Error(`The length of bytes should be 8, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getBigUint64(0, true);
  return num;
}

export function BytesToSingle(bytes: Uint8Array) {
  if (bytes.byteLength !== 4) {
    throw new Error(`The length of bytes should be 4, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getFloat32(0, true);
  return num;
}

export function BytesToDouble(bytes: Uint8Array) {
  if (bytes.byteLength !== 8) {
    throw new Error(`The length of bytes should be 8, but it is ${bytes.byteLength}`);
  }
  let dv = new DataView(bytes.buffer);
  let num = dv.getFloat64(0, true);
  return num;
}
