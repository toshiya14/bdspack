# BDSP (Binary Document Serializable Pack)

A library to serialize document data into binary format.

[中文文档](docs/readme_CN.md)

- [BDSP (Binary Document Serializable Pack)](#bdsp-binary-document-serializable-pack)
  - [Structure](#structure)
  - [Data types](#data-types)
    - [Undefined](#undefined)
    - [Boolean](#boolean)
      - [Magic: 0x00 | False](#magic-0x00--false)
      - [Magic: 0x01 | True](#magic-0x01--true)
    - [Decimal](#decimal)
      - [Magic: 0x02 | Single](#magic-0x02--single)
      - [Magic: 0x03 | Double](#magic-0x03--double)
    - [Integer](#integer)
      - [Magic: 0x04 | Unsigned 8-bytes Int](#magic-0x04--unsigned-8-bytes-int)
      - [Magic: 0x05 | Unsigned 16-bytes Int](#magic-0x05--unsigned-16-bytes-int)
      - [Magic: 0x06 | Unsigned 32-bytes Int](#magic-0x06--unsigned-32-bytes-int)
      - [Magic: 0x07 | Unsigned 64-bytes Int](#magic-0x07--unsigned-64-bytes-int)
      - [Magic: 0x84 | Signed 8-bytes Int](#magic-0x84--signed-8-bytes-int)
      - [Magic: 0x85 | Signed 16-bytes Int](#magic-0x85--signed-16-bytes-int)
      - [Magic: 0x86 | Signed 32-bytes Int](#magic-0x86--signed-32-bytes-int)
      - [Magic: 0x87 | Signed 64-bytes Int](#magic-0x87--signed-64-bytes-int)
    - [String](#string)
    - [Binary](#binary)
    - [Document](#document)
    - [EXTEND - DateTime](#extend---datetime)
  - [The structure of the package](#the-structure-of-the-package)
    - [Body](#body)
  - [Flags](#flags)
  - [Magic in all](#magic-in-all)

## Structure

As the name of the library, we keep the structure in key-value pairs just like JSON format.
And what's more, we support `Byte Array` - RAW binary data fragment.

Example：

```javascript
{
    "id": 13,
    "formats": ["xml", "json"],
    "title": "test",
    "meta":
        {
            "isFile": true,
            "size": 6.43,
            "payload": new Uint8Array([0x01, 0x02, 0x03]),
            "tag": undefined
        }
}
```

Would be serialized as：

```text
            0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
===========================================================
00000010 |  44 61 14 02 69 64 04 03 14 07 66 6F 72 6D 61 74
00000020 |  73 14 0D 14 0B 14 03 78 6D 6C 14 04 6A 73 6F 6E
00000030 |  14 05 74 69 74 6C 65 14 04 74 65 73 74 14 04 6D
00000040 |  65 74 61 14 2E 04 2C 14 06 69 73 46 69 6C 65 01
00000050 |  14 04 73 69 7A 65 03 B8 1E 85 EB 51 B8 19 40 14
00000060 |  07 70 61 79 6C 6F 61 64 14 03 01 02 03 14 03 74
00000070 |  61 67 FF
```

With each data block, they are built up with:

| Magic | Size | Payload  |
| :---: | :--: | :------: |
|  0D   |  03  | 61 62 63 |

- Only `String`, `Binary`, `Document` types need `Size` part.
- `Boolean` and `Undefined` types only contains `Magic` part.

## Data types

All data types would use **LITTLE ENDIAN** to convert to binary.

### Undefined

When the data value is `undefined` or `null`, this data would be identified as `Undefined` type.
The `Magic` part is always `0xFF` and no `Size` part and `Payload` part.

### Boolean

Boolean only has two types of value, `true` or `false`.
This data type do not have `Size` part and `Payload` part.

#### Magic: 0x00 | False

When the `Magic` is `0x00`, this data would be identified as `Boolean` type.
And also, its value would be `false`.

Example：

```text
00 - false
```

#### Magic: 0x01 | True

When the `Magic` is `0x01`, this data would be identified as `Boolean` type.
And also, its value would be `true`.

Example：

```text
01 - true
```

### Decimal

`Decimal` is the number with fractional part. So, it is not an integer.
The value would be converted to `Payload` part following IEEE 754 standard.
This type do not have `Size` part.

#### Magic: 0x02 | Single

`0x02 = 0x02 | 0x00`
`0x02 => Flags.Decimal, 0x00 => Flags.Single`

Example：

```text
02 3E 1C 40 00 - 0.152587890625
```

#### Magic: 0x03 | Double

`0x03 = 0x02 | 0x01`
`0x02 => Flags.Decimal, 0x00 => Flags.Double`

Example：

```text
03 3F CD CD 65 00 00 00 00 - 0.23283064365386962890625
```

### Integer

There are 8 types of `Integer` in total.
(signed/unsigned) (8/16/32/64) bit integer.
You do not need to concern which type to use.
Because the library would find out the best type of these to use.

#### Magic: 0x04 | Unsigned 8-bytes Int

`0x04 = 0x04 | 0x00 | 0x00`
`0x04 => Flags.Integer, 0x00 => Flags.Int8, 0x00 => Flags.Unsigned`

Example:

```text
04 7F - 127
```

#### Magic: 0x05 | Unsigned 16-bytes Int

`0x05 = 0x04 | 0x01 | 0x00`
`0x04 => Flags.Integer, 0x01 => Flags.Int16, 0x00 => Flags.Unsigned`

Example:

```text
05 FF FF - 65535
```

#### Magic: 0x06 | Unsigned 32-bytes Int

`0x06 = 0x04 | 0x03 | 0x00`
`0x04 => Flags.Integer, 0x02 => Flags.Int32, 0x00 => Flags.Unsigned`

Example:

```text
06 2A B5 40 88 - 716521608
```

#### Magic: 0x07 | Unsigned 64-bytes Int

`0x07 = 0x04 | 0x03 | 0x00`
`0x04 => Flags.Integer, 0x03 => Flags.Int64, 0x00 => Flags.Unsigned`

Example:

```text
07 00 0B 29 43 0A 24 D0 E6 - 3141592653549798
```

#### Magic: 0x84 | Signed 8-bytes Int

`0x84 = 0x04 | 0x00 | 0x80`
`0x04 => Flags.Integer, 0x00 => Flags.Int8, 0x80 => Flags.Signed`

Example:

```text
84 FF - -1
```

#### Magic: 0x85 | Signed 16-bytes Int

`0x85 = 0x04 | 0x01 | 0x80`
`0x04 => Flags.Integer, 0x01 => Flags.Int16, 0x80 => Flags.Signed`

Example:

```text
85 FF FF - -1
```

#### Magic: 0x86 | Signed 32-bytes Int

`0x06 = 0x04 | 0x03 | 0x00`
`0x04 => Flags.Integer, 0x02 => Flags.Int32, 0x80 => Flags.Signed`

Example:

```text
86 FF FF FF FF - -1
```

#### Magic: 0x87 | Signed 64-bytes Int

`0x07 = 0x04 | 0x03 | 0x00`
`0x04 => Flags.Integer, 0x03 => Flags.Int64, 0x80 => Flags.Signed`

Example:

```text
87 FF FF FF FF FF FF FF FF - -1
```

### String

The `Magic` of `String` type is built up with _Data Type Magic_ and _Size Integer Type Magic_.
In another words: `Magic` = `Flags.String (0x0c) | Flags.Integer | Flags.Unsigned | <int type>`。

_Size Integer Type Magic_ could be `Uint8`, `Uint16` and `Uint32`.
That is the type of `Size`.
For this reason, we support the max size(bytes size) of the `String` is 4294967295.
And the `String` would use `UTF-8` encoding.

Example:

```text
0D 03 61 62 63 - abc
```

### Binary

This type used for encode the RAW binary data.
The `Magic` of `Binary` type is built up with _Data Type Magic_ and _Size Integer Type Magic_.
In another words: `Magic` = `Flags.Binary (0x10) | Flags.Integer | Flags.Unsigned | <int type>`。
That is the type of `Size`.
For this reason, we support the max size(bytes size) of the `Binary` is 4294967295.
And the `Binary` would use `UTF-8` encoding.

示例：

```text
14 04 01 02 03 04 - [0x01, 0x02, 0x03, 0x04]
```

### Document

The stucture would be the same with `Binary` type.
The binary data in `Payload` part could be unpack to a `BDSP` document.
The `Magic` of `Binary` type is built up with _Data Type Magic_ and _Size Integer Type Magic_.
In another words: `Magic` = `Flags.Document (0x20) | <document type> | Flags.Integer | Flags.Unsigned | <int type>`
That is the type of `Size`.
For this reason, we support the max size(bytes size) of the `Document` is 4294967295.
And the `Document` would use `UTF-8` encoding.

`<document type>` could be:
`Flags.List (0x10)` - each properties do not have `Property Name`.
`Flags.Dictionary (0x00)` `key-value` type.

Example:

```text
34 05 <bytes of doc body>
```

`<bytes of doc body>` only contains the `Body` part of the document. `Magic` and `Size` is not includes.
Because it is duplicated with the `Magic` part and `Size` part for the property defination.

### EXTEND - DateTime

`DateTime` is one of the extend type. It is actually a integer type.
The value would be the total milliseconds from the `1970/01/01 0:00:00 Z` to the specified datetime in UTC timezone.
Then the total milliseconds stored as an `Integer` type.

## The structure of the package

| Version + Doctype + Size Integer Type Magic | Data Size | Data Body |
| :-----------------------------------------: | :-------: | :-------: |
|                     0D                      |    03     | 61 62 63  |

`Magic` = `Flags.Root (0x40) | Flags.List/Flags.Dictionary | Flags.Integer | Flags.Uint8/16/32`

### Body

When the document is `Dictionary` type, the body would be
`prop1.key + prop1.value + prop2.key + prop2.value ...`.
The `key` is always `String` type.

When the document is `List` type, the body would be
`prop1.value + prop2.value + ...`.

## Flags

```text
ROOT: 0x40

BOOLEAN: 0x00
FALSE: 0x00
TRUE: 0x01

DECIMAL: 0x02
SINGLE: 0x00
DOUBLE: 0x01

INTEGER: 0x04
INT8: 0x00
INT16: 0x01
INT32: 0x02
INT64: 0x03
SIGNED: 0x80
UNSIGNED: 0x00
INTMASK: 0x03

STRING: 0x08

BINARY: 0x10

DOCUMENT: 0x20
DICTIONARY: 0x00
LIST: 0x10

EXTENDABLE_MASK: 0x44
EXTEND_DATETIME: 0x10

UNDEFINED: 0xFF
```

## Magic in all

```text
  Magic (Binary)  |  Magic (Hex)  |  Type
   0b 0000 0000   |    0x 00      | boolean(false)
   0b 0000 0001   |    0x 01      | boolean(true)
   0b 0000 0010   |    0x 02      | decimal(single)
   0b 0000 0011   |    0x 03      | decimal(double)
   0b 0000 0100   |    0x 04      | integer(8bit,unsigned)
   0b 0000 0101   |    0x 05      | integer(16bit,unsigned)
   0b 0000 0110   |    0x 06      | integer(32bit,unsigned)
   0b 0000 0111   |    0x 07      | integer(64bit,unsigned)
   0b 1000 0100   |    0x 84      | integer(8bit,signed)
   0b 1000 0101   |    0x 85      | integer(16bit,signed)
   0b 1000 0110   |    0x 86      | integer(32bit,signed)
   0b 1000 0111   |    0x 87      | integer(64bit,signed)
   0b 0000 1000   |    0x 08      | string flag
   0b 0000 1100   |    0x 0c      | string with uint8 length
   0b 0000 1101   |    0x 0d      | string with uint16 length
   0b 0000 1110   |    0x 0e      | string with uint32 length
   0b 0001 0000   |    0x 10      | binary flag
   0b 0001 0100   |    0x 14      | binary with uint8 length
   0b 0001 0101   |    0x 15      | binary with uint16 length
   0b 0001 0110   |    0x 16      | binary with uint32 length
   0b 0010 0000   |    0x 20      | document(type:dict) flag
   0b 0010 0100   |    0x 24      | document(type:dict) with uint8 length
   0b 0010 0101   |    0x 25      | document(type:dict) with uint16 length
   0b 0010 0110   |    0x 26      | document(type:dict) with uint32 length
   0b 0011 0000   |    0x 30      | document(type:list) flag
   0b 0011 0100   |    0x 34      | document(type:list) with uint8 length
   0b 0011 0101   |    0x 35      | document(type:list) with uint16 length
   0b 0011 0110   |    0x 36      | document(type:list) with uint32 length
   0b 0100 0000   |    0x 40      | root document flag
   0b 0100 0100   |    0x 44      | root document with uint8 length
   0b 0100 0101   |    0x 45      | root document with uint16 length
   0b 0100 0110   |    0x 46      | root document with uint32 length
   0b 1000 1000   |    0x 44      | extendable zone
   0b 1xxx 1iii   |               | x -> type id, i -> uint(i) length
   0b 1001 1100   |    0x 9c      | datetime with uint8 timestamp
   0b 1001 1100   |    0x 9d      | datetime with uint16 timestamp
   0b 1001 1100   |    0x 9e      | datetime with uint32 timestamp
   0b 1111 1111   |    0x FF      | undefined

```
