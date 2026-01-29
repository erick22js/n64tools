#include "stream.h"

#define MAX_STREAMS 256
Stream _streams[MAX_STREAMS] = { 0 };


Stream *streamGetAvailable() {
	for (int i = 0; i < MAX_STREAMS; i++){
		if (!_streams[i].max_length){
			return &_streams[i];
		}
	}
	return NULL;
}

Stream *streamOpenFile(const char* path, bool for_write) {
	Stream *stream = streamGetAvailable();
	if (!stream) return NULL;
	
	FILE *file = fopen(path, "rb");
	if (!file) return NULL;
	fseek(file, 0, SEEK_END);
	u32 len = ftell(file);
	fseek(file, 0, SEEK_SET);
	
	stream->stdio_path = path;
	stream->write_enable = for_write;
	stream->extendable = FALSE;
	stream->big_endian = FALSE;
	stream->allocated = TRUE;
	stream->max_length = len == 0? 1: len;
	stream->data = memAlloc(stream->max_length);
	stream->length = len;
	stream->seek = 0;
	
	fread(stream->data, 1, len, file);
	fclose(file);
	return stream;
}

Stream *streamOpenBuffer(u8* buffer, u32 length, bool for_write) {
	Stream *stream = streamGetAvailable();
	if (!stream) return NULL;
	
	stream->stdio_path = NULL;
	stream->write_enable = for_write;
	stream->extendable = FALSE;
	stream->big_endian = FALSE;
	stream->allocated = TRUE;
	stream->max_length = length == 0? 1: length;
	stream->data = memAlloc(stream->max_length);
	if (buffer) memCopy(stream->data, buffer, length);
	else memSet(stream->data, 0, length);
	stream->length = length;
	stream->seek = 0;
	return stream;
}

bool streamFlush(Stream *stream) {
	if (!stream->write_enable) return;
	if (!stream->stdio_path) return;
	
	FILE *file = fopen(stream->stdio_path, "wb");
	if (!file) return FALSE;
	fwrite(stream->data, 1, stream->length, file);
	fclose(file);
	return TRUE;
}

void streamClose(Stream *stream) {
	streamFlush(stream);
	
	stream->max_length = stream->length = 0;
	if (stream->allocated) memFree(stream->data);
}

void streamSetFlushFile(Stream *stream, const char* path) {
	stream->stdio_path = path;
}

void streamSetBigEndian(Stream *stream, bool big_endian) {
	stream->big_endian = big_endian;
}

void streamSetExtendable(Stream *stream, bool extendable) {
	stream->extendable = extendable;
}

u32 streamGetLength(Stream *stream) {
	return stream->length;
}

u32 streamGetSeek(Stream *stream) {
	return stream->seek;
}

bool streamEnded(Stream *stream) {
	return stream->seek >= stream->length;
}

u8 streamRead8(Stream *stream) {
	if (stream->seek >= stream->length) return 0;
	u8 data = stream->data[stream->seek];
	stream->seek++;
	return data;
}

u16 streamRead16(Stream *stream) {
	if (stream->big_endian) {
		return
			(streamRead8(stream)<<8) |
			(streamRead8(stream));
	}
	else {
		return
			(streamRead8(stream)) |
			(streamRead8(stream)<<8);
	}
}

u32 streamRead32(Stream *stream) {
	if (stream->big_endian) {
		return
			(streamRead8(stream)<<24) |
			(streamRead8(stream)<<16) |
			(streamRead8(stream)<<8) |
			(streamRead8(stream));
	}
	else {
		return
			(streamRead8(stream)) |
			(streamRead8(stream)<<8) |
			(streamRead8(stream)<<16) |
			(streamRead8(stream)<<24);
	}
}

u64 streamRead64(Stream *stream) {
	if (stream->big_endian) {
		return
			(((u64)streamRead32(stream))<<32) | ((u64)streamRead32(stream));
	}
	else {
		return ((u64)streamRead32(stream)) | (((u64)streamRead32(stream))<<32);
	}
}

void streamResize(Stream *stream, u32 new_size) {
	stream->length = new_size;
	if (new_size == 0) new_size = 1;
	stream->max_length = new_size*2;
	stream->data = memRealloc(stream->data, stream->max_length);
}

void streamWrite8(Stream *stream, u8 data) {
	if (!stream->write_enable) return;
	if (stream->seek >= stream->length) {
		if (stream->extendable) {
			stream->length = stream->seek+1;
			if (stream->length > stream->max_length) streamResize(stream, stream->length);
		}
		else return;
	}
	stream->data[stream->seek] = data;
	stream->seek++;
}

void streamWrite16(Stream *stream, u16 data) {
	if (!stream->write_enable) return;
	if (stream->big_endian) {
		streamWrite8(stream, data>>8);
		streamWrite8(stream, data);
	}
	else {
		streamWrite8(stream, data);
		streamWrite8(stream, data>>8);
	}
}

void streamWrite32(Stream *stream, u32 data) {
	if (!stream->write_enable) return;
	if (stream->big_endian) {
		streamWrite8(stream, data>>24);
		streamWrite8(stream, data>>16);
		streamWrite8(stream, data>>8);
		streamWrite8(stream, data);
	}
	else {
		streamWrite8(stream, data);
		streamWrite8(stream, data>>8);
		streamWrite8(stream, data>>16);
		streamWrite8(stream, data>>24);
	}
}

void streamWrite64(Stream *stream, u64 data) {
	if (!stream->write_enable) return;
	if (stream->big_endian) {
		streamWrite32(stream, data>>32);
		streamWrite32(stream, data);
	}
	else {
		streamWrite32(stream, data);
		streamWrite32(stream, data>>32);
	}
}

void streamRead(Stream *stream, u32 length, u8* output) {
	for (u32 i = 0; i < length; i++){
		output[i] = streamRead8(stream);
	}
}

void streamWrite(Stream *stream, u32 length, u8* input) {
	if (!stream->write_enable) return;
	for (u32 i = 0; i < length; i++){
		streamWrite8(stream, input[i]);
	}
}

void streamWriteString(Stream *stream, char* str) {
	while (*str){
		streamWrite8(stream, *str);
		str++;
	}
}

void streamSeekStart(Stream *stream, u32 offset) {
	stream->seek = offset;
}

void streamSeekCurrent(Stream *stream, i32 offset) {
	stream->seek += offset;
}

void streamSeekEnd(Stream *stream, i32 offset) {
	stream->seek = stream->length + offset;
}

void streamCopy(Stream *stream, u8* output) {
	for (u32 i = 0; i < stream->length; i++){
		output[i] = stream->data[i];
	}
}

