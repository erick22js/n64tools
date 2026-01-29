#ifndef STREAM_H
#define STREAM_H

#include "util.h"


typedef struct {
	const char* stdio_path;
	bool write_enable;
	bool extendable;
	bool big_endian;
	bool allocated;
	u8* data;
	u32 length;
	u32 max_length;
	u32 seek;
} Stream;

extern Stream _streams[];

Stream *streamOpenFile(const char* path, bool for_write);
Stream *streamOpenBuffer(u8* buffer, u32 length, bool for_write);
bool streamFlush(Stream *stream);
void streamClose(Stream *stream);
void streamSetFlushFile(Stream *stream, const char* path);
void streamSetBigEndian(Stream *stream, bool big_endian);
void streamSetExtendable(Stream *stream, bool extendable);
u32 streamGetLength(Stream *stream);
u32 streamGetSeek(Stream *stream);
bool streamEnded(Stream *stream);
u8 streamRead8(Stream *stream);
u16 streamRead16(Stream *stream);
u32 streamRead32(Stream *stream);
u64 streamRead64(Stream *stream);
void streamResize(Stream *stream, u32 new_size);
void streamWrite8(Stream *stream, u8 data);
void streamWrite16(Stream *stream, u16 data);
void streamWrite32(Stream *stream, u32 data);
void streamWrite64(Stream *stream, u64 data);
void streamRead(Stream *stream, u32 length, u8* output);
void streamWrite(Stream *stream, u32 length, u8* input);
void streamWriteString(Stream *stream, char* str);
void streamSeekStart(Stream *stream, u32 offset);
void streamSeekCurrent(Stream *stream, i32 offset);
void streamSeekEnd(Stream *stream, i32 offset);
void streamCopy(Stream *stream, u8* output);


#endif