export class MemoryStream {
  private varlength: boolean;
  length: number;
  private buffer: Uint8Array;
  private cursor: number;
  private dataview: DataView;

  position() {
    return this.cursor;
  }

  getBuffer() {
    return this.buffer.slice(0, this.length);
  }

  constructor();
  constructor(byte: Uint8Array);
  constructor(bytes?: Uint8Array) {
    this.cursor = 0;
    if (typeof bytes === "undefined") {
      this.varlength = true;
      this.length = 0;
      this.buffer = new Uint8Array(1024);
    } else {
      this.varlength = false;
      this.length = bytes.byteLength;
      this.buffer = bytes;
    }

    if (this.buffer instanceof ArrayBuffer) {
      this.dataview = new DataView(this.buffer);
    } else if (this.buffer instanceof Uint8Array) {
      this.dataview = new DataView(this.buffer.buffer);
    } else {
      throw new Error(`Excepted buffer type.`);
    }
  }

  private extend(target?: number) {
    let targetLength = target || this.buffer.byteLength + Math.min(this.length, 4096);
    if (!this.varlength) {
      throw new Error("This memory stream could not be extended.");
    }
    let newBuffer = new ArrayBuffer(targetLength);
    let newArray = new Uint8Array(newBuffer);
    newArray.set(this.buffer, 0);
    this.buffer = newArray;
    this.dataview = new DataView(this.buffer.buffer);
  }

  seek(offset: number) {
    this.cursor = offset;
    if (this.cursor >= this.length) {
      this.extend(offset + 512);
    }
  }

  read(count: number) {
    let bytes = new Uint8Array(count);
    let dv2 = new DataView(bytes.buffer);
    for (let i = 0; i < count; i++) {
      dv2.setUint8(i, this.readbyte());
    }
    return bytes;
  }

  readbyte() {
    if (this.endOfStream()) {
      throw new Error("Reaches the end of the stream.");
    }
    let byte = this.dataview.getUint8(this.cursor);
    this.cursor += 1;
    return byte;
  }

  write(buffer: Uint8Array) {
    for (let i = 0; i < buffer.byteLength; i++) {
      let byte = buffer.at(i);
      if (typeof byte === "undefined") {
        throw new Error(`Failed to get byte from buffer at ${i}`);
      }
      this.writebyte(byte);
    }
  }

  endOfStream() {
    return this.cursor > this.length;
  }

  writebyte(byte: number) {
    if (this.cursor >= this.buffer.byteLength) {
      this.extend();
    }
    if (byte < 0 || byte > 255) {
      throw new Error("byte out of range(0-255): " + byte);
    }
    this.dataview.setUint8(this.cursor, byte);
    this.cursor += 1;
    if (this.cursor > this.length) {
      this.length = this.cursor;
    }
  }
}
