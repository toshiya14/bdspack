import { flags } from "../binary/flags";

export type IntTypeMeta = {
  signed: boolean;
  length: number;
};

export function parseIntType(magic: number) {
  let intTypeMagic = magic & flags.INT_TYPE_MASK;
  let signed = (magic & flags.SIGNED) === flags.SIGNED;
  switch (intTypeMagic) {
    case 0:
      return { signed, length: 1 };
    case 1:
      return { signed, length: 2 };
    case 2:
      return { signed, length: 4 };
    case 3:
      return { signed, length: 8 };
    default:
      throw new Error(`Excepted int type flags in magic: ${intTypeMagic}.`);
  }
}
