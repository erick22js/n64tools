#include "stdio.h"
#include "stdlib.h"
#include "string.h"
#include "goldutils.h"


void* memAlloc(int size) {
	return calloc(size, 1);
}

void memFree(void* mem) {
	free(mem);
}

void* memSet(u8* mem, int v, int size) {
	memset(mem, v, size);
}

void memCopy(u8* dest, void* src, int size) {
	memcpy(dest, src, size);
}
