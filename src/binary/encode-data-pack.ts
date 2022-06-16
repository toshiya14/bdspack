import { encodeBox } from "../encoder";
import { makeDataBox } from "../types/data-box";
import { MemoryStream } from "../utils/memory-stream";
import { flags } from "./flags";

export class EncodeDataPack {
  private _isRoot: boolean;
  private _isDictType: boolean;
  private _payload?: Uint8Array;
  private _bodysizePayload?: Uint8Array;
  constructor(isRoot: boolean, isDictType: boolean) {
    this._isRoot = isRoot;
    this._isDictType = isDictType;
  }
  setBody(payload: Uint8Array) {
    this._payload = payload;
    if (payload) {
      let box = makeDataBox(payload.byteLength);
      let fragment = encodeBox(box);
      if (!fragment.payload) {
        throw new Error("Failed to encode body size.");
      }
      this._bodysizePayload = fragment.payload;
    }
  }
  toBytes(): Uint8Array {
    let body = new MemoryStream();
    if (this._isRoot) {
      body.writebyte(this.getMagic());
      if (!this._bodysizePayload) {
        throw new Error("Body size not set, could not serialize this pack.");
      }
      body.write(this._bodysizePayload);
    }
    if (!this._payload) {
      throw new Error("Payload not set, could not serialize this pack.");
    }
    body.write(this._payload);
    return body.getBuffer();
  }
  private getMagic() {
    return (
      (this._isRoot ? flags.ROOT : flags.EMBEDDED) |
      (this._isDictType ? flags.DICTIONARY : flags.LIST) |
      this.getIntegerFlags()
    );
  }

  private getIntegerFlags() {
    let sizeLength = this._bodysizePayload?.byteLength;
    if (sizeLength === 1) {
      return flags.INT8;
    } else if (sizeLength === 2) {
      return flags.INT16;
    } else if (sizeLength === 4) {
      return flags.INT32;
    } else {
      throw new Error(`Unsupported sizeLength: ${sizeLength}.`);
    }
  }
}
