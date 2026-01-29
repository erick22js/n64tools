#ifndef N64_DISASM_H
#define N64_DISASM_H

#include "stream.h"
#include "n64symbols.h"


typedef struct {
	u32 data; // Holded data
	u32 type; // reserved
	u32 flags; // reserved
	u32 id; // id or hash code
	char name[64]; // Sym name
} N64Symbol;

typedef struct {
	u32 ram_address;
	u32 position;
	N64Symbol* symbols;
	u32 symbols_limit;
	u32 symbols_count;
} N64Context;

void n64AddSym(N64Context *ctx, u32 id, u32 data, u32 type, u32 flags, const char* name);
void n64AddFunctionSym(N64Context *ctx, u32 adr);
N64Symbol *n64FindSymByName(N64Context *ctx, char* name);
N64Symbol *n64FindSymById(N64Context *ctx, u32 id);

// Rip functions and symbols references
u32 n64RipSymbols(N64Context *ctx, Stream *in);

// Disassembles a single instruction by its code
// Returns if is a valid instruction
bool n64DisasmSingle(N64Context *ctx, u32 code, char* out);

// Disassembles a stream of bytes
// Returns the count of valid instructions
int n64DisasmStream(N64Context *ctx, Stream *in, Stream *out);


#endif