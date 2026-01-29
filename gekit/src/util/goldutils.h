#ifndef port_goldutils
#define port_goldutils


/*
    TYPES DEFINITION
*/

typedef unsigned char u8;
typedef unsigned short u16;
typedef unsigned int u32;
typedef unsigned long long u64;

typedef signed char s8;
typedef short s16;
typedef int s32;
typedef long long s64;

typedef volatile unsigned char vu8;
typedef volatile unsigned short vu16;
typedef volatile unsigned int vu32;
typedef volatile unsigned long long vu64;

typedef volatile signed char vs8;
typedef volatile short vs16;
typedef volatile int vs32;
typedef volatile long long vs64;

typedef float f32;
typedef double f64;

typedef u64 uptr;
typedef s64 sptr;

typedef _Bool bool;


/*
    CONSTANTS DEFINITION
*/

#define TRUE 1
#define FALSE 0
#define NULL (void *)0


/*
    FUNCTIONS DEFINITION
*/

#define bzero(ptr, cnt) {\
        for (int i=0; i<(cnt); i++){\
            ((u8*)ptr)[i] = 0;\
        }\
    }
#define BSWAP32(x) (((x >> 24) & 0xff) | ((x >> 8) & 0xff00) | ((x << 8) & 0xff0000) | (x << 24))
#define BSWAP16(x) ((x << 8) | ((x >> 8) & 0xff))
void* memAlloc(int size);
void memFree(void* mem);
void* memSet(u8* mem, int v, int size);
void memCopy(u8* dest, void* src, int size);


#endif