#ifndef N64_ASM_H
#define N64_ASM_H

#include "n64disasm.h"


u32 _n64ParseNumber(char* tk, u8 id);

// Assembles a stream of characters given by in
// Returns a error code, or zero if success
int n64AsmProccess(N64Context *ctx, Stream *in, Stream *out);


#endif