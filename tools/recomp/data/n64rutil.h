#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <math.h>

/*
	Structs and Types
*/

typedef uint64_t gpr;

typedef union {
	double d;
	struct {
		float fl;
		float fh;
	};
	struct {
		uint32_t u32l;
		uint32_t u32h;
	};
	uint64_t u64;
} fpr;

typedef struct {
	gpr r0, at, v0, v1, a0, a1, a2, a3,
		t0, t1, t2, t3, t4, t5, t6, t7,
		s0, s1, s2, s3, s4, s5, s6, s7,
		t8, t9, k0, k1, gp, sp, fp, ra;
	fpr f0, f1, f2, f3, f4, f5, f6, f7,
		f8, f9, f10, f11, f12, f13, f14, f15,
		f16, f17, f18, f19, f20, f21, f22, f23,
		f24, f25, f26, f27, f28, f29, f30, f31;
	uint32_t Index, Random, EntryLo0, EntryLo1, Context, PageMask, Wired,
		BadVAddr, Count, EntryHi, Compare, Status, Cause, EPC,
		Config, TagLo, TagHi, ErrorEPC;
	uint32_t pc;
	uint64_t hi, lo;
	uint8_t* rdram;
	_Bool fcondcode;
} n64ctx_t;


/*
	Recompilation Debug Helpers
*/

#define BRKfunc { /*__debugbreak();*/ }
#define BRK(adr, instr) { ctx->pc = adr; if (adr == n64_breakpoint_auto_adr) n64_breakpoint_auto_enabled = TRUE; if (adr == n64_breakpoint_adr || adr == n64_breakpoint2_adr || n64_breakpoint_auto_enabled) { n64BreakpointExec(ctx, instr); BRKfunc; } }

extern uint32_t n64_breakpoint_adr;
extern uint32_t n64_breakpoint2_adr;
extern uint32_t n64_breakpoint_auto_adr;
extern _Bool n64_breakpoint_auto_enabled;

void n64BreakpointExec(n64ctx_t *ctx, const char* instr);
void n64BreakpointMem(n64ctx_t *ctx, int write, int reg_code, int fpr_code, int size_code, uint32_t adr_mem, uint64_t value);


/*
	Instruction Helpers
*/

#define FALSE 0
#define TRUE 1

#define n64CallVirtualFunction(adr) {}
#define n64BreakCall(adr) {}

#define low32(v) ((v)&0xFFFFFFFF)
#define high32(v) (((v)>>32)&0xFFFFFFFF)

#define signExtend16Imm(v) ((int16_t)(uint16_t)(v))

#define N64_MEM_D(offset, base) (*(uint64_t*)(((((base) + signExtend16Imm(offset))&0x0FFFFFFC)) + ctx->rdram))
#define N64_MEM_W(offset, base) (*(uint32_t*)(((((base) + signExtend16Imm(offset))&0x0FFFFFFC)) + ctx->rdram))
#define N64_MEM_H(offset, base) (*(uint16_t*)(((((base) + signExtend16Imm(offset))&0x0FFFFFFE)) + ctx->rdram))
#define N64_MEM_B(offset, base) (*(uint8_t*)(((((base) + signExtend16Imm(offset))&0x0FFFFFFF)) + ctx->rdram))
#define N64_MEM_Wfree(offset, base) (*(uint32_t*)(((base) + signExtend16Imm(offset)) + ctx->rdram))

#define N64_REG_IDX(reg, start) ((int)((&((n64ctx_t*)(0))->reg) - &(((n64ctx_t*)(0))->start)))
#define N64_MEMORY_LOAD(dest, type, offset, base) uint32_t adr_mem = (ctx->base) + signExtend16Imm(offset); uint64_t value = (*(type*)((adr_mem&0x0FFFFFFF) + ctx->rdram)); ctx->dest = value;
#define N64_MEMORY_WRITE(src, type, offset, base) uint32_t adr_mem = (ctx->base) + signExtend16Imm(offset); uint64_t value = ctx->src; (*(type*)((adr_mem&0x0FFFFFFF) + ctx->rdram)) = value;
#define N64_MEMORY_LOAD_S8(dest, offset, base) { N64_MEMORY_LOAD (dest, uint8_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 3, adr_mem, value); }
#define N64_MEMORY_WRITE_S8(src, offset, base) { N64_MEMORY_WRITE(src,  uint8_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 3, adr_mem, value); }
#define N64_MEMORY_LOAD_U8(dest, offset, base) { N64_MEMORY_LOAD (dest, uint8_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 0, adr_mem, value); }
#define N64_MEMORY_WRITE_U8(src, offset, base) { N64_MEMORY_WRITE(src,  uint8_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 0, adr_mem, value); }
#define N64_MEMORY_LOAD_S16(dest, offset, base) { N64_MEMORY_LOAD (dest, uint16_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 4, adr_mem, value); }
#define N64_MEMORY_WRITE_S16(src, offset, base) { N64_MEMORY_WRITE(src,  uint16_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 4, adr_mem, value); }
#define N64_MEMORY_LOAD_U16(dest, offset, base) { N64_MEMORY_LOAD (dest, uint16_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 1, adr_mem, value); }
#define N64_MEMORY_WRITE_U16(src, offset, base) { N64_MEMORY_WRITE(src,  uint16_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 1, adr_mem, value); }
#define N64_MEMORY_LOAD_S32(dest, offset, base) { N64_MEMORY_LOAD (dest, uint32_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 5, adr_mem, value); }
#define N64_MEMORY_WRITE_S32(src, offset, base) { N64_MEMORY_WRITE(src,  uint32_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 5, adr_mem, value); }
#define N64_MEMORY_LOAD_U32(dest, offset, base) { N64_MEMORY_LOAD (dest, uint32_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 2, adr_mem, value); }
#define N64_MEMORY_WRITE_U32(src, offset, base) { N64_MEMORY_WRITE(src,  uint32_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 2, adr_mem, value); }
#define N64_MEMORY_LOAD_S32(dest, offset, base) { N64_MEMORY_LOAD (dest, uint32_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 5, adr_mem, value); }
#define N64_MEMORY_WRITE_S32(src, offset, base) { N64_MEMORY_WRITE(src,  uint32_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 5, adr_mem, value); }
#define N64_MEMORY_LOAD_U64(dest, offset, base) { N64_MEMORY_LOAD (dest, uint64_t, offset, base); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 8, adr_mem, value); }
#define N64_MEMORY_WRITE_U64(src, offset, base) { N64_MEMORY_WRITE(src,  uint64_t, offset, base); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 8, adr_mem, value); }
#define N64_MEMORY_LOAD_F32(dest, offset, base) { N64_MEMORY_LOAD (dest.u32l, uint32_t, offset, base); n64BreakpointMem(ctx, 0, 0, N64_REG_IDX(dest, f0), 6, adr_mem, value); }
#define N64_MEMORY_WRITE_F32(src, offset, base) { N64_MEMORY_WRITE(src.u32l,  uint32_t, offset, base); n64BreakpointMem(ctx, 1, 0, N64_REG_IDX(src,  f0), 6, adr_mem, value); }
#define N64_MEMORY_LOAD_F64(dest, offset, base) { N64_MEMORY_LOAD (dest.u64, uint64_t, offset, base); n64BreakpointMem(ctx, 0, 0, N64_REG_IDX(dest, f0), 7, adr_mem, value); }
#define N64_MEMORY_WRITE_F64(src, offset, base) { N64_MEMORY_WRITE(src.u64,  uint64_t, offset, base); n64BreakpointMem(ctx, 1, 0, N64_REG_IDX(src,  f0), 7, adr_mem, value); }

#define N64_ADD32(v1, v2) (gpr)((int32_t)((v1) + (v2)))
#define N64_ADDI32(v1, v2) (gpr)((int32_t)((v1) + signExtend16Imm(v2)))
#define N64_ADD64(v1, v2) (gpr)((int64_t)((v1) + (v2)))
#define N64_ADDI64(v1, v2) (gpr)((int64_t)((v1) + signExtend16Imm(v2)))
#define N64_SUB32(v1, v2) (gpr)((int32_t)((v1) - (v2)))
#define N64_SUBI32(v1, v2) (gpr)((int32_t)((v1) - signExtend16Imm(v2)))
#define N64_MUL32(v1, v2, cast) { uint64_t r = (gpr)((int32_t)((v1) * (v2))); ctx->lo = (r)&0xFFFFFFFF; ctx->hi = (r>>32)&0xFFFFFFFF; }
#define N64_MUL64(v1, v2, cast) { uint64_t r00 = (gpr)((low32(v1) * low32(v2))); uint64_t r01 = (gpr)((high32(v1) * low32(v2>>32))); uint64_t r10 = (gpr)((low32(v1>>32) * high32(v2))); uint64_t r11 = (gpr)((high32(v1>>32) * high32(v2>>32))); uint64_t sum0 = r00; uint64_t sum1 = high32(sum0) + r01 + r10; uint64_t sum2 = high32(sum1) + r11; ctx->lo = sum0 + (low32(sum1)<<32); ctx->hi = sum2 + high32(sum1); }
#define N64_DIV(v1, v2, cast) { ctx->lo = ((cast)v1 / (cast)v2); ctx->hi = ((cast)v1 % (cast)v2); }
#define N64_LUI(v) (gpr)(((uint16_t)(v)&0xFFFF) << 16)
#define N64_AND(v1, v2) (gpr)((v1) & (v2))
#define N64_ANDI(v1, v2) (gpr)((v1) & ((uint16_t)(v2)))
#define N64_OR(v1, v2) (gpr)((v1) | (v2))
#define N64_ORI(v1, v2) (gpr)((v1) | ((uint16_t)(v2)))
#define N64_XOR(v1, v2) (gpr)((v1) | (v2))
#define N64_XORI(v1, v2) (gpr)((v1) | ((uint16_t)(v2)))
#define N64_NOR(v1, v2) (gpr)(~((v1) | (v2)))
#define N64_SLA32(v1, v2) (gpr)((int32_t)(v1) << ((uint32_t)(v2)&0x1F))
#define N64_SL32(v1, v2) (gpr)((uint32_t)(v1) << ((uint32_t)(v2)&0x1F))
#define N64_SRA32(v1, v2) (gpr)((int32_t)(v1) >> ((uint32_t)(v2)&0x1F))
#define N64_SR32(v1, v2) (gpr)((uint32_t)(v1) >> ((uint32_t)(v2)&0x1F))
#define N64_SLA(v1, v2) (gpr)((int64_t)(v1) << ((uint64_t)(v2)&0x3F))
#define N64_SL(v1, v2) (gpr)((uint64_t)(v1) << ((uint64_t)(v2)&0x3F))
#define N64_SRA(v1, v2) (gpr)((int64_t)(v1) >> ((uint64_t)(v2)&0x3F))
#define N64_SR(v1, v2) (gpr)((uint64_t)(v1) >> ((uint64_t)(v2)&0x3F))
#define N64_SLT(v1, v2, type) (((type)(v1)) < ((type)(v2)))
