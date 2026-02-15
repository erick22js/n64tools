#include <string.h>
#include "recomp.h"


/*
	Global properties
*/
n64ctx_t ge_ctx;
uint32_t n64_breakpoint_adr = 0;
uint32_t n64_breakpoint2_adr = 0;
uint32_t n64_breakpoint_auto_adr = 0;
_Bool n64_breakpoint_auto_enabled = FALSE;

#define STEP_MODE TRUE

#define dump_limit 1024*1024*128
uint64_t dump[dump_limit] = {0};
/*uint64_t dump2[dump_limit] = {0};
uint64_t dump3[dump_limit] = {0};
uint64_t dump4[dump_limit] = {0};
uint64_t dump5[dump_limit] = {0};
uint64_t dump6[dump_limit] = {0};
uint64_t dump7[dump_limit] = {0};
uint64_t dump8[dump_limit] = {0};*/
uint64_t dump_i = 0;


/*
	Main Procedure
*/

void n64DumpState(n64ctx_t *ctx, uint32_t pc) {
	if (dump_i + 75 + 2 > dump_limit) return;
	dump[dump_i] = pc; dump_i++;
	dump[dump_i] = ctx->fcondcode; dump_i++;
	memcpy(&dump[dump_i], ctx, 75*sizeof(uint64_t)); dump_i += 75;
	for (int i = 0; i < 5; i++){
		dump[dump_i] = 0xF0E0D0C0B0A09080 + 0x0101010101010101*i*2; dump_i++;
	}
}

void n64BreakpointExec(n64ctx_t *ctx, const char* instr) {
	// Procces code
	if (STEP_MODE){
		system("cls");
		printf("\n0x%.8X: %s\n\n", ctx->pc, instr);

		printf("                    GPR                                                  FPR                                               CP0\n");
		printf("r0: %.8X %.8X;  s0: %.8X %.8X;      f0:  %.8X %.8X;  f16: %.8X %.8X;     Index:    %.8X;  TagHi:    %.8X\n", (uint32_t)((ctx->r0>>32)&0xFFFFFFFF), (uint32_t)((ctx->r0)&0xFFFFFFFF), (uint32_t)((ctx->s0>>32)&0xFFFFFFFF), (uint32_t)((ctx->s0)&0xFFFFFFFF), ctx->f0.u32h, ctx->f0.u32l, ctx->f16.u32h, ctx->f16.u32l, ctx->Index, ctx->TagHi);
		printf("at: %.8X %.8X;  s1: %.8X %.8X;      f1:  %.8X %.8X;  f17: %.8X %.8X;     Random:   %.8X;  ErrorEPC: %.8X\n", (uint32_t)((ctx->at>>32)&0xFFFFFFFF), (uint32_t)((ctx->at)&0xFFFFFFFF), (uint32_t)((ctx->s1>>32)&0xFFFFFFFF), (uint32_t)((ctx->s1)&0xFFFFFFFF), ctx->f1.u32h, ctx->f1.u32l, ctx->f17.u32h, ctx->f17.u32l, ctx->Random, ctx->ErrorEPC);
		printf("v0: %.8X %.8X;  s2: %.8X %.8X;      f2:  %.8X %.8X;  f18: %.8X %.8X;     EntryLo0: %.8X;  \n", (uint32_t)((ctx->v0>>32)&0xFFFFFFFF), (uint32_t)((ctx->v0)&0xFFFFFFFF), (uint32_t)((ctx->s2>>32)&0xFFFFFFFF), (uint32_t)((ctx->s2)&0xFFFFFFFF), ctx->f2.u32h, ctx->f2.u32l, ctx->f18.u32h, ctx->f18.u32l, ctx->EntryLo0);
		printf("v1: %.8X %.8X;  s3: %.8X %.8X;      f3:  %.8X %.8X;  f19: %.8X %.8X;     EntryLo1: %.8X;  \n", (uint32_t)((ctx->v1>>32)&0xFFFFFFFF), (uint32_t)((ctx->v1)&0xFFFFFFFF), (uint32_t)((ctx->s3>>32)&0xFFFFFFFF), (uint32_t)((ctx->s3)&0xFFFFFFFF), ctx->f3.u32h, ctx->f3.u32l, ctx->f19.u32h, ctx->f19.u32l, ctx->EntryLo1);
		printf("a0: %.8X %.8X;  s4: %.8X %.8X;      f4:  %.8X %.8X;  f20: %.8X %.8X;     Context:  %.8X;  \n", (uint32_t)((ctx->a0>>32)&0xFFFFFFFF), (uint32_t)((ctx->a0)&0xFFFFFFFF), (uint32_t)((ctx->s4>>32)&0xFFFFFFFF), (uint32_t)((ctx->s4)&0xFFFFFFFF), ctx->f4.u32h, ctx->f4.u32l, ctx->f20.u32h, ctx->f20.u32l, ctx->Context);
		printf("a1: %.8X %.8X;  s5: %.8X %.8X;      f5:  %.8X %.8X;  f21: %.8X %.8X;     PageMask: %.8X;  \n", (uint32_t)((ctx->a1>>32)&0xFFFFFFFF), (uint32_t)((ctx->a1)&0xFFFFFFFF), (uint32_t)((ctx->s5>>32)&0xFFFFFFFF), (uint32_t)((ctx->s5)&0xFFFFFFFF), ctx->f5.u32h, ctx->f5.u32l, ctx->f21.u32h, ctx->f21.u32l, ctx->PageMask);
		printf("a2: %.8X %.8X;  s6: %.8X %.8X;      f6:  %.8X %.8X;  f22: %.8X %.8X;     Wired:    %.8X;  \n", (uint32_t)((ctx->a2>>32)&0xFFFFFFFF), (uint32_t)((ctx->a2)&0xFFFFFFFF), (uint32_t)((ctx->s6>>32)&0xFFFFFFFF), (uint32_t)((ctx->s6)&0xFFFFFFFF), ctx->f6.u32h, ctx->f6.u32l, ctx->f22.u32h, ctx->f22.u32l, ctx->Wired);
		printf("a3: %.8X %.8X;  s7: %.8X %.8X;      f7:  %.8X %.8X;  f23: %.8X %.8X;     BadVAddr: %.8X;  \n", (uint32_t)((ctx->a3>>32)&0xFFFFFFFF), (uint32_t)((ctx->a3)&0xFFFFFFFF), (uint32_t)((ctx->s7>>32)&0xFFFFFFFF), (uint32_t)((ctx->s7)&0xFFFFFFFF), ctx->f7.u32h, ctx->f7.u32l, ctx->f23.u32h, ctx->f23.u32l, ctx->BadVAddr);
		printf("t0: %.8X %.8X;  t8: %.8X %.8X;      f8:  %.8X %.8X;  f24: %.8X %.8X;     Count:    %.8X;  \n", (uint32_t)((ctx->t0>>32)&0xFFFFFFFF), (uint32_t)((ctx->t0)&0xFFFFFFFF), (uint32_t)((ctx->t8>>32)&0xFFFFFFFF), (uint32_t)((ctx->t8)&0xFFFFFFFF), ctx->f8.u32h, ctx->f8.u32l, ctx->f24.u32h, ctx->f24.u32l, ctx->Count);
		printf("t1: %.8X %.8X;  t9: %.8X %.8X;      f9:  %.8X %.8X;  f25: %.8X %.8X;     EntryHi:  %.8X;  \n", (uint32_t)((ctx->t1>>32)&0xFFFFFFFF), (uint32_t)((ctx->t1)&0xFFFFFFFF), (uint32_t)((ctx->t9>>32)&0xFFFFFFFF), (uint32_t)((ctx->t9)&0xFFFFFFFF), ctx->f9.u32h, ctx->f9.u32l, ctx->f25.u32h, ctx->f25.u32l, ctx->EntryHi);
		printf("t2: %.8X %.8X;  k0: %.8X %.8X;      f10: %.8X %.8X;  f26: %.8X %.8X;     Compare:  %.8X;  \n", (uint32_t)((ctx->t2>>32)&0xFFFFFFFF), (uint32_t)((ctx->t2)&0xFFFFFFFF), (uint32_t)((ctx->k0>>32)&0xFFFFFFFF), (uint32_t)((ctx->k0)&0xFFFFFFFF), ctx->f10.u32h, ctx->f10.u32l, ctx->f26.u32h, ctx->f26.u32l, ctx->Compare);
		printf("t3: %.8X %.8X;  k1: %.8X %.8X;      f11: %.8X %.8X;  f27: %.8X %.8X;     Status:   %.8X;  \n", (uint32_t)((ctx->t3>>32)&0xFFFFFFFF), (uint32_t)((ctx->t3)&0xFFFFFFFF), (uint32_t)((ctx->k1>>32)&0xFFFFFFFF), (uint32_t)((ctx->k1)&0xFFFFFFFF), ctx->f11.u32h, ctx->f11.u32l, ctx->f27.u32h, ctx->f27.u32l, ctx->Status);
		printf("t4: %.8X %.8X;  gp: %.8X %.8X;      f12: %.8X %.8X;  f28: %.8X %.8X;     Cause:    %.8X;  \n", (uint32_t)((ctx->t4>>32)&0xFFFFFFFF), (uint32_t)((ctx->t4)&0xFFFFFFFF), (uint32_t)((ctx->gp>>32)&0xFFFFFFFF), (uint32_t)((ctx->gp)&0xFFFFFFFF), ctx->f12.u32h, ctx->f12.u32l, ctx->f28.u32h, ctx->f28.u32l, ctx->Cause);
		printf("t5: %.8X %.8X;  sp: %.8X %.8X;      f13: %.8X %.8X;  f29: %.8X %.8X;     EPC:      %.8X;  \n", (uint32_t)((ctx->t5>>32)&0xFFFFFFFF), (uint32_t)((ctx->t5)&0xFFFFFFFF), (uint32_t)((ctx->sp>>32)&0xFFFFFFFF), (uint32_t)((ctx->sp)&0xFFFFFFFF), ctx->f13.u32h, ctx->f13.u32l, ctx->f29.u32h, ctx->f29.u32l, ctx->EPC);
		printf("t6: %.8X %.8X;  fp: %.8X %.8X;      f14: %.8X %.8X;  f30: %.8X %.8X;     Config:   %.8X;  \n", (uint32_t)((ctx->t6>>32)&0xFFFFFFFF), (uint32_t)((ctx->t6)&0xFFFFFFFF), (uint32_t)((ctx->fp>>32)&0xFFFFFFFF), (uint32_t)((ctx->fp)&0xFFFFFFFF), ctx->f14.u32h, ctx->f14.u32l, ctx->f30.u32h, ctx->f30.u32l, ctx->Config);
		printf("t7: %.8X %.8X;  ra: %.8X %.8X;      f15: %.8X %.8X;  f31: %.8X %.8X;     TagLo:    %.8X;  \n", (uint32_t)((ctx->t7>>32)&0xFFFFFFFF), (uint32_t)((ctx->t7)&0xFFFFFFFF), (uint32_t)((ctx->ra>>32)&0xFFFFFFFF), (uint32_t)((ctx->ra)&0xFFFFFFFF), ctx->f15.u32h, ctx->f15.u32l, ctx->f31.u32h, ctx->f31.u32l, ctx->TagLo);
		printf("hi: %.8X %.8X;  lo: %.8X %.8X;\n", (uint32_t)((ctx->hi>>32)&0xFFFFFFFF), (uint32_t)((ctx->hi)&0xFFFFFFFF), (uint32_t)((ctx->lo>>32)&0xFFFFFFFF), (uint32_t)((ctx->lo)&0xFFFFFFFF));

		printf("\n> ");

		uint64_t code = 0;
		int chr = 0;
		do {
			chr = getc(stdin);
			if (code == 0){
				if (chr == 'R' || chr == 'r') code = 'R';
				if (chr == 'T' || chr == 't') code = 'T';
			}
			if (code != 'R' || code != 'T'){
				if (chr >= '0' && chr <= '9') { code <<= 4; code += (chr-'0'); }
				if (chr >= 'a' && chr <= 'f') { code <<= 4; code += (chr-'a') + 10; }
				if (chr >= 'A' && chr <= 'F') { code <<= 4; code += (chr-'A') + 10; }
			}
		} while (chr!=10);
		if (code){
			if (code == 'R'){
				n64_breakpoint_auto_adr = n64_breakpoint_adr;
				n64_breakpoint_auto_enabled = FALSE;
			}
			else if (code == 'T'){
				__debugbreak();
			}
			else {
				n64_breakpoint_auto_adr = n64_breakpoint_adr = (code&0xFFFFFFF) | 0x70000000;
				n64_breakpoint_auto_enabled = FALSE;
			}
		}
	}
	// Dump code
	else {
		//printf("%.8X: %s\n", adr, instr);
		n64DumpState(ctx, ctx->pc);
		if (ctx->pc == n64_breakpoint2_adr){
			FILE *fi = fopen("dump.bin", "wb");
			fwrite(dump, sizeof(uint64_t), dump_i, fi);
			fclose(fi);
			__debugbreak();
		}
	}
}

void n64BreakpointMem(n64ctx_t *ctx, int write, int reg_code, int fpr_code, int size_code, uint32_t adr_mem, uint64_t value) {
	
}

void n64InitState(n64ctx_t *ctx) {
	memset(ge_ctx.rdram, 0, 1024 * 1024 * 256);
	ctx->fcondcode = 0;
	ctx->r0 = 0x0000000000000000; ctx->s0 = 0x0000000000000400;
	ctx->at = 0xFFFFFFFFA4600000; ctx->s1 = 0xFFFFFFFFA3F08000;
	ctx->v0 = 0x000000003C048009; ctx->s2 = 0;
	ctx->v1 = 0x0000000000000009; ctx->s3 = 0;
	ctx->a0 = 0x0000000009001278; ctx->s4 = 0x0000000000000001;
	ctx->a1 = 0x0000000068DA915E; ctx->s5 = 0;
	ctx->a2 = 0xFFFFFFFF93143DFE; ctx->s6 = 0x000000000000003F;
	ctx->a3 = 0xFFFFFFFFDCBC50D1; ctx->s7 = 0;
	ctx->t0 = 0xFFFFFFFFA4002000; ctx->t8 = 0x000000002F0C8354;
	ctx->t1 = 0xFFFFFFFF80000400; ctx->t9 = 0x000000004EE69134;
	ctx->t2 = 0xFFFFFFFFF8CBA2F7; ctx->k0 = 0xFFFFFFFFA4300000;
	ctx->t3 = 0xFFFFFFFFB0000000; ctx->k1 = 0x0000000000000001;
	ctx->t4 = 0x0000000026F199F7; ctx->gp = 0x0000000000000008;
	ctx->t5 = 0x0000000000000020; ctx->sp = 0xFFFFFFFFA4001FF0;
	ctx->t6 = 0xFFFFFFFF901133A9; ctx->fp = 0xFFFFFFFFA4001F90;
	ctx->t7 = 0xFFFFFFFF801C3EA3; ctx->ra = 0xFFFFFFFFA40002F4;
	ctx->hi = 0x0000000000000016; ctx->lo = 0xFFFFFFFFF8CA4DDB;
	ctx->Index = 0;
	ctx->Random = 0x00000015;
	ctx->EntryLo0 = 0;
	ctx->EntryLo1 = 0;
	ctx->Context = 0x007FFFF0;
	ctx->PageMask = 0;
	ctx->Wired = 0;
	ctx->BadVAddr = 0xFFFFFFFF;
	ctx->Count = 0x00B03D52;
	ctx->EntryHi = 0;
	ctx->Compare = 0;
	ctx->Status = 0x34000000;
	ctx->Cause = 0x0000005C;
	ctx->EPC = 0xFFFFFFFF;
	ctx->Config = 0x7006E463;
	ctx->TagLo = 0;
	ctx->TagHi = 0;
	ctx->ErrorEPC = 0xFFFFFFFF;
}

int main() {
	// Setup debug and execution info
	n64_breakpoint_adr = n64_breakpoint_auto_adr = 0x70000400; // Start debugging address
	n64_breakpoint2_adr = 0x70000450; // End debugging address
	memset(&ge_ctx, 0, sizeof(n64ctx_t));
	ge_ctx.rdram = malloc(1024 * 1024 * 256);

	n64InitState(&ge_ctx);
	func_70000400(&ge_ctx);
	/*
	__debugbreak();
	printf("Recompiled code!\n");
	__debugbreak();
	*/
	system("pause");
	return 0;
}
