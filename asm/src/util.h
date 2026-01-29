#ifndef UTIL_H
#define UTIL_H

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <math.h>


typedef uint8_t u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;

typedef int8_t i8;
typedef int16_t i16;
typedef int32_t i32;
typedef int64_t i64;

typedef float_t f32;
typedef double_t f64;

typedef _Bool bool;


#define TRUE 1
#define FALSE 0
#define NULL ((void*)0)


u8* memAlloc(u32 size);
void memFree(u8* buff);
u8* memRealloc(u8* buff, u32 size);
void memCopy(u8* dest, u8* src, u32 len);
void memSet(u8* dest, u8 v, u32 len);

#endif