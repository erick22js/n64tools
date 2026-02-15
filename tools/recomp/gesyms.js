
function geLoadSyms(ctx) {
	n64AddFunctionSym(ctx, 0x80000450, "func_70000450");
	n64AddFunctionSym(ctx, 0x70000450, "func_70000450");
	n64AddFunctionSym(ctx, 0x70000510, "init");
	n64AddFunctionSym(ctx, 0x700006F0, "setSPToEnd");
	n64AddFunctionSym(ctx, 0x700006FC, "piStatusRegReset");
	n64AddFunctionSym(ctx, 0x70000718, "idleproc");
	n64AddFunctionSym(ctx, 0x7000089C, "mainproc");
	n64AddFunctionSym(ctx, 0x7000CF90, "osPiRawStartDma");
	n64AddFunctionSym(ctx, 0x7000D080, "osInitialize");
	n64AddFunctionSym(ctx, 0x7000D430, "osCreateThread");
	n64AddFunctionSym(ctx, 0x7000D580, "osStartThread");
	n64AddFunctionSym(ctx, 0x7000D740, "osStopThread");
	n64AddFunctionSym(ctx, 0x7000D800, "osSetThreadPri");
	n64AddFunctionSym(ctx, 0x7000E8B0, "osVirtualToPhysical");
	n64AddFunctionSym(ctx, 0x70010BD0, "osWritebackDCache");
	n64AddFunctionSym(ctx, 0x70017B20, "__osSetSR");
	n64AddFunctionSym(ctx, 0x70017B30, "__osGetSR");
	n64AddFunctionSym(ctx, 0x70017BE0, "osPiRawWriteIo");
	n64AddFunctionSym(ctx, 0x700185F0, "__osDisableInt");
	n64AddFunctionSym(ctx, 0x70018610, "__osRestoreInt");
}
