# BDSP (Binary Document Serializable Pack)

BDSP 是一个可以将数据格式化成二进制包的库。

- [BDSP (Binary Document Serializable Pack)](#bdsp-binary-document-serializable-pack)
  - [结构](#结构)
  - [数据类型](#数据类型)
    - [Undefined 空](#undefined-空)
    - [Boolean 布尔](#boolean-布尔)
      - [Magic: 0x00 | False](#magic-0x00--false)
      - [Magic: 0x01 | True](#magic-0x01--true)
    - [Decimal 实数类型](#decimal-实数类型)
      - [Magic: 0x02 | Single 单精度浮点数](#magic-0x02--single-单精度浮点数)
      - [Magic: 0x03 | Double 双精度浮点数](#magic-0x03--double-双精度浮点数)
    - [Integer 整数类型](#integer-整数类型)
      - [Magic: 0x04 | Unsigned 8-bytes Int 无符号 8 位整型](#magic-0x04--unsigned-8-bytes-int-无符号-8-位整型)
      - [Magic: 0x05 | Unsigned 16-bytes Int 无符号 16 位整型](#magic-0x05--unsigned-16-bytes-int-无符号-16-位整型)
      - [Magic: 0x06 | Unsigned 32-bytes Int 无符号 32 位整型](#magic-0x06--unsigned-32-bytes-int-无符号-32-位整型)
      - [Magic: 0x07 | Unsigned 64-bytes Int 无符号 64 位整型](#magic-0x07--unsigned-64-bytes-int-无符号-64-位整型)
      - [Magic: 0x84 | Signed 8-bytes Int 带符号 8 位整型](#magic-0x84--signed-8-bytes-int-带符号-8-位整型)
      - [Magic: 0x85 | Signed 16-bytes Int 带符号 16 位整型](#magic-0x85--signed-16-bytes-int-带符号-16-位整型)
      - [Magic: 0x86 | Signed 32-bytes Int 带符号 32 位整型](#magic-0x86--signed-32-bytes-int-带符号-32-位整型)
      - [Magic: 0x87 | Signed 64-bytes Int 带符号 64 位整型](#magic-0x87--signed-64-bytes-int-带符号-64-位整型)
    - [String 字符串类型](#string-字符串类型)
    - [Binary 二进制数据类型](#binary-二进制数据类型)
    - [Document 嵌入文档类型](#document-嵌入文档类型)
  - [EXTEND - DateTime 时间](#extend---datetime-时间)
  - [包结构](#包结构)
    - [Body 部分](#body-部分)
  - [Flags](#flags)
  - [类型汇总](#类型汇总)

## 结构

就如其名，数据结构借鉴了 JSON 等结构，保留了键值对和可嵌套式的结构。而且支持二进制片段数据类型（即支持 byte array)。

示例：

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

将会被序列化成：

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

每个数据块可以被看作是由以下部分组成：

| 数据类型 Magic | 数据长度 Size | 数据 Payload |
| :------------: | :-----------: | :----------: |
|       0D       |      03       |   61 62 63   |

- 只有`String`,`Binary`,`Document`类型需要 `Size` 部分。
- `Boolean`和`Undefined`类型只有`Magic`部分。

## 数据类型

任何数据类型在转换成二进制的过程中都是按照小端序进行转换。（Little Endian）

### Undefined 空

当数据为 `undefined` 或者 `null` 时，为空类型。
该类型没有 `Size` 部分和 `Payload` 部分。
`Magic` 部分固定为 `0xFF`

### Boolean 布尔

布尔类型只有 `true` 和 `false` 两种情况。
该类型没有 `Size` 部分和 `Payload` 部分。

#### Magic: 0x00 | False

当 `Magic` 为 `0x00` 时，类型为布尔类型，取值为 `false`。

示例：

```text
00 - false
```

#### Magic: 0x01 | True

当 `Magic` 为 `0x01` 时，类型为布尔类型，取值为 `true`。

示例：

```text
01 - true
```

### Decimal 实数类型

实数类型是带有小数点的数字类型。`Payload` 部分的数据会遵照 IEEE 754 转为二进制。
该类型没有 `Size` 部分。

#### Magic: 0x02 | Single 单精度浮点数

`0x02 = 0x02 | 0x00`
其中： `0x02 => Flags.Decimal, 0x00 => Flags.Single`

示例：

```text
02 3E 1C 40 00 - 0.152587890625
```

#### Magic: 0x03 | Double 双精度浮点数

`0x03 = 0x02 | 0x01`
其中： `0x02 => Flags.Decimal, 0x00 => Flags.Double`

示例：

```text
03 3F CD CD 65 00 00 00 00 - 0.23283064365386962890625
```

### Integer 整数类型

整数类型包括 8 种分类。
(带符号/不带符号) 的 (8/16/32/64) 位整型。
转换时会自动按照最小位数的格式进行转换。

#### Magic: 0x04 | Unsigned 8-bytes Int 无符号 8 位整型

`0x04 = 0x04 | 0x00 | 0x00`
其中： `0x04 => Flags.Integer, 0x00 => Flags.Int8, 0x00 => Flags.Unsigned`

示例：

```text
04 7F - 127
```

#### Magic: 0x05 | Unsigned 16-bytes Int 无符号 16 位整型

`0x05 = 0x04 | 0x01 | 0x00`
其中： `0x04 => Flags.Integer, 0x01 => Flags.Int16, 0x00 => Flags.Unsigned`

示例：

```text
05 FF FF - 65535
```

#### Magic: 0x06 | Unsigned 32-bytes Int 无符号 32 位整型

`0x06 = 0x04 | 0x03 | 0x00`
其中： `0x04 => Flags.Integer, 0x02 => Flags.Int32, 0x00 => Flags.Unsigned`

示例：

```text
06 2A B5 40 88 - 716521608
```

#### Magic: 0x07 | Unsigned 64-bytes Int 无符号 64 位整型

`0x07 = 0x04 | 0x03 | 0x00`
其中： `0x04 => Flags.Integer, 0x03 => Flags.Int64, 0x00 => Flags.Unsigned`

示例：

```text
07 00 0B 29 43 0A 24 D0 E6 - 3141592653549798
```

#### Magic: 0x84 | Signed 8-bytes Int 带符号 8 位整型

`0x84 = 0x04 | 0x00 | 0x80`
其中： `0x04 => Flags.Integer, 0x00 => Flags.Int8, 0x80 => Flags.Signed`

示例：

```text
84 FF - -1
```

#### Magic: 0x85 | Signed 16-bytes Int 带符号 16 位整型

`0x85 = 0x04 | 0x01 | 0x80`
其中： `0x04 => Flags.Integer, 0x01 => Flags.Int16, 0x80 => Flags.Signed`

示例：

```text
85 FF FF - -1
```

#### Magic: 0x86 | Signed 32-bytes Int 带符号 32 位整型

`0x06 = 0x04 | 0x03 | 0x00`
其中： `0x04 => Flags.Integer, 0x02 => Flags.Int32, 0x80 => Flags.Signed`

示例：

```text
86 FF FF FF FF - -1
```

#### Magic: 0x87 | Signed 64-bytes Int 带符号 64 位整型

`0x07 = 0x04 | 0x03 | 0x00`
其中： `0x04 => Flags.Integer, 0x03 => Flags.Int64, 0x80 => Flags.Signed`

示例：

```text
87 FF FF FF FF FF FF FF FF - -1
```

### String 字符串类型

字符串类型的 `Magic` 部分也包含了 `Size` 部分的数据类型。
即：`Magic` = `Flags.String (0x0c) | Flags.Integer | Flags.Unsigned | <int type>`。

支持`Uint8`,`Uint16`,`Uint32`类型的`Size`数据。
也就是说最长可以支持 4294967295 字节的字符串。
编码方式为`UTF-8`。

示例：

```text
0D 03 61 62 63 - abc
```

### Binary 二进制数据类型

二进制数据类型用于存储纯二进制数据。跟字符串类型一样，`Magic` 部分会含有 `Size` 部分的数据类型。
即：`Magic` = `Flags.Binary (0x10) | Flags.Integer | Flags.Unsigned | <int type>`。

支持`Uint8`,`Uint16`,`Uint32`类型的`Size`数据。
也就是说最长可以支持 4294967295 字节的二进制数据。

示例：

```text
14 04 01 02 03 04 - [0x01, 0x02, 0x03, 0x04]
```

### Document 嵌入文档类型

结构上和二进制数据类型一样，`Payload` 部分的数据可以反序列化成一个新的 `BDSP` 文档。`Magic` 部分会含有 `Size` 部分的数据类型。
即：`Magic` = `Flags.Document (0x20) | <document type> | Flags.Integer | Flags.Unsigned | <int type>`。

支持`Uint8`,`Uint16`,`Uint32`类型的`Size`数据。
也就是说最长可以支持序列化后长度为 4294967295 字节的文档。

`<document type>` 可以是:
`Flags.List (0x10)` 不带 `Property Name` 的文档。
`Flags.Dictionary (0x00)` `key-value` 类型的文档。

示例结构：

```text
34 05 <bytes of doc body>
```

`<bytes of doc body>` 仅包含文档序列化之后的 `Body` 部分，这部分不需要再重复指定 `Magic` 和 `Size`。
因为此时从前面的数据中可以推断出所需要的信息。

## EXTEND - DateTime 时间

时间为扩展类型之一，他实际是通过 javascript 中的 `getTime()` 方法，将当前时间转换成格林威治时间（UTC）之后，
计算自 `1970/01/01 0:00:00 Z` 到当前时间 UTC 时间的毫秒数。
再将这个毫秒总数转换成`UNSIGNED INTEGER`类型，与`INTEGER`相同，会在编码时计算数字最优长度。

## 包结构

| 版本+文档类型+Size 类型 Magic | 数据长度 Size | 数据 Body |
| :---------------------------: | :-----------: | :----------: |
|              0D               |      03       |   61 62 63   |

`Magic` = `Flags.Root (0x40) | Flags.List/Flags.Dictionary | Flags.Integer | Flags.Uint8/16/32`

### Body 部分

当文档为 `Dictionary` 类型时，按照 `prop1.key + prop1.value + prop2.key + prop2.value ...` 的顺序转换数据。`key`始终为`String`类型。

当文档为 `List` 类型时，按照 `prop1.value + prop2.value + ...` 的顺序转换数据。

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

## 类型汇总

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

