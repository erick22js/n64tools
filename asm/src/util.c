#include "util.h"



u8* memAlloc(u32 size) {
	return malloc(size);
}

void memFree(u8* buff) {
	free(buff);
}

u8* memRealloc(u8* buff, u32 size) {
	return realloc(buff, size);
}

void memCopy(u8* dest, u8* src, u32 len) {
	memcpy(dest, src, len);
}

void memSet(u8* dest, u8 v, u32 len) {
	memset(dest, v, len);
}

