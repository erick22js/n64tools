#include "n64disasm.h"

#define sym(adr, name) { n64AddSym(ctx, adr, adr, 0, 0, name); }

void loadBanjoTooieSymbols(N64Context *ctx) {
	// LIBULTRA
	// os
	sym(0x8002E9E0, "osViSetMode");
	sym(0x8002F330, "osSetIntMask");
	sym(0x8002F930, "__osDisableInt");
	sym(0x8002F9A0, "__osRestoreInt");

}
