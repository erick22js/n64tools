const vm = require('vm');
const fs = require('fs');
vm.runInThisContext(fs.readFileSync(__dirname+'/file.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/n64symbols.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/n64disasm.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/n64toc.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/gesyms.js'));

/*
	Load Reference Symbols
*/
const input_bin_path = process.argv[2];//"D:/documentos/meus-projetos/misc/n64tools/gekit/_data/out/";
const output_asm_path = process.argv[3];//"D:/documentos/meus-projetos/misc/n64tools/tools/recomp/data/";
let asm = [
	{
		"file": "code1",
		"base": 0x70000400,
	},
	{
		"file": "code2",
		"base": 0x70200000,
	},
	{
		"file": "code3",
		"base": 0x7F000000,
	},
];

let ctx = {
	"ram_address": 0x7F000000,//"ram_address": 0x70200000,//"ram_address": 0x70000400,
	"position": 0,
	"symbols": [],
	"used": [],
};

// Load all related symbols
geLoadSyms(ctx);
for (let i = 0; i < asm.length; i++){
	let input = File.loadAtPath(fs, input_bin_path + asm[i].file + ".bin", true);
	input.mode = File.BIG_ENDIAN;
	asm[i].size = input.size();
	asm[asm[i].file] = asm[i];
	ctx.ram_address = asm[i].base;
	n64RipSymbols(ctx, input)
}

// Export functions references
let _functions = []; let functions = [];
for (let i = 0; i < ctx.symbols.length; i++){
	if (ctx.symbols[i].type != N64_SYM_FUNCTION) continue;
	let file = asm[asm.length-1].file;
	let adr = ctx.symbols[i].data;
	for (let f = 1; f < asm.length; f++){
		if (adr < asm[f].base) {
			file = asm[f-1].file;
			break;
		}
	}
	_functions.push({
		"name": ctx.symbols[i].name,
		"file": file,
		"adr": adr,
	});
}
while (_functions.length > 0){
	let s = 0;
	for (let i = 1; i < _functions.length; i++) {
		if (_functions[i].adr < _functions[s].adr) s = i;
	}
	functions.push(_functions.splice(s, 1)[0]);
}
for (let i = 0; i < functions.length; i++){
	functions[i].len = functions[i+1] == null || functions[i+1].file != functions[i].file? parseInt(BigInt(asm[functions[i].file].size + asm[functions[i].file].base) - BigInt(functions[i].adr)): parseInt(BigInt(functions[i+1].adr) - BigInt(functions[i].adr));
	functions[i].adr = "0x"+functions[i].adr.toString(16).padStart(8, '0').toUpperCase();
	functions[i].offset = parseInt(functions[i].adr);
}
fs.writeFileSync(output_asm_path + "recompinfo/functions.json", JSON.stringify(functions, null, 4));

// Export labels
let _labels = []; let labels = [];
for (let i = 0; i < ctx.symbols.length; i++){
	if (ctx.symbols[i].type != N64_SYM_LABEL) continue;
	let file = asm[asm.length-1].file;
	let adr = ctx.symbols[i].data;
	for (let f = 1; f < asm.length; f++){
		if (adr < asm[f].base) {
			file = asm[f-1].file;
			break;
		}
	}
	for (let f = functions.length-1; f >= 0; f--){
		if (adr > functions[f].offset){
			ctx.symbols[i]._func = functions[f];
			break;
		}
	}
	_labels.push({
		"name": ctx.symbols[i].name,
		"file": file,
		"adr": adr,
	});
}
while (_labels.length > 0){
	let s = 0;
	for (let i = 1; i < _labels.length; i++) {
		if (_labels[i].adr < _labels[s].adr) s = i;
	}
	labels.push(_labels.splice(s, 1)[0]);
}
for (let i = 0; i < labels.length; i++){
	labels[i].adr = "0x"+labels[i].adr.toString(16).padStart(8, '0').toUpperCase();
	labels[i].offset = parseInt(labels[i].adr);
}
fs.writeFileSync(output_asm_path + "recompinfo/labels.json", JSON.stringify(labels, null, 4));


// Convert assembly data to C readable code
// Generate header for symbols reference
let out = File.openBuffer([]);
out.fixed = false;
out.writeString('#include "n64rutil.h"\n\n');
for (let i = 0; i < functions.length; i++){
	out.writeString("void "+functions[i].name+"(n64ctx_t *ctx);\n");
}
out.writeString("\n");
out.saveAtPath(fs, output_asm_path + "recomp.h");

// Generate c code
out = File.openBuffer([]);
out.fixed = false;
out.writeString('#include "recomp.h"\n\n');
for (let i = 0; i < asm.length; i++){
	let input = File.loadAtPath(fs, input_bin_path + asm[i].file + ".bin", true);
	input.mode = File.BIG_ENDIAN;
	
	ctx.ram_address = asm[i].base;
	
	n64ToC(ctx, functions, input, out);
}
out.saveAtPath(fs, output_asm_path + "recomp.c");

/*
// Disassembles the binaries to assembly files
for (let i = 0; i < asm.length; i++){
	let input = File.loadAtPath(fs, input_bin_path + asm[i].file + ".bin", true);
	input.mode = File.BIG_ENDIAN;
	
	let out = File.openBuffer([]);
	out.fixed = false;
	
	ctx.ram_address = asm[i].base;
	
	n64DisasmStream(ctx, input, out);
	out.saveAtPath(fs, output_asm_path + asm[i].file + ".asm");
}
*/

fs.writeFileSync(output_asm_path + "n64rutil.h",
`#include <stdio.h>
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
	uint64_t hi, lo;
	uint32_t pc;
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

#define N64_REG_IDX(reg, start) ((int)((&((n64ctx_t*)(0))->reg) - &(((n64ctx_t*)(0))->start)))

#define N64_MEMORY_SWAP_8(tv) (tv&0xFF)
#define N64_MEMORY_SWAP_16(tv) (((tv&0xFF00) >> 8) | ((tv&0x00FF) << 8))
#define N64_MEMORY_SWAP_32(tv) (((tv&0xFF000000) >> 24) | ((tv&0x00FF0000) >> 8) | ((tv&0x0000FF00) << 8) | ((tv&0x000000FF) << 24))
#define N64_MEMORY_SWAP_64(tv) (((tv&0xFF00000000000000) >> 56) | ((tv&0x00FF000000000000) >> 40) | ((tv&0x0000FF0000000000) >> 24) | ((tv&0x000000FF00000000) >> 8) | ((tv&0x00000000FF000000) << 8) | ((tv&0x0000000000FF0000) << 24) | ((tv&0x000000000000FF00) << 40) | ((tv&0x00000000000000FF) << 56))

#define N64_MEMORY_LOAD(dest, type, offset, base, swap) uint32_t adr_mem = (uint32_t)(ctx->base) + (uint32_t)signExtend16Imm(offset); uint64_t tmp_value = (uint64_t)(*(type*)((adr_mem&0x0FFFFFFF) + ctx->rdram)); type value = (type)swap(tmp_value); ctx->dest = value;
#define N64_MEMORY_WRITE(src, type, offset, base, swap) uint32_t adr_mem = (uint32_t)(ctx->base) + (uint32_t)signExtend16Imm(offset); type value = (type)ctx->src; uint64_t tmp_value = (uint64_t)value; tmp_value = swap(tmp_value); (*(type*)((adr_mem&0x0FFFFFFF) + ctx->rdram)) = (type)tmp_value;

#define N64_MEMORY_LOAD_S8(dest, offset, base) { N64_MEMORY_LOAD (dest, int8_t, offset, base, N64_MEMORY_SWAP_8); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 3, adr_mem, value); }
#define N64_MEMORY_WRITE_S8(src, offset, base) { N64_MEMORY_WRITE(src,  int8_t, offset, base, N64_MEMORY_SWAP_8); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 3, adr_mem, value); }
#define N64_MEMORY_LOAD_U8(dest, offset, base) { N64_MEMORY_LOAD (dest, uint8_t, offset, base, N64_MEMORY_SWAP_8); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 0, adr_mem, value); }
#define N64_MEMORY_WRITE_U8(src, offset, base) { N64_MEMORY_WRITE(src,  uint8_t, offset, base, N64_MEMORY_SWAP_8); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 0, adr_mem, value); }
#define N64_MEMORY_LOAD_S16(dest, offset, base) { N64_MEMORY_LOAD (dest, int16_t, offset, base, N64_MEMORY_SWAP_16); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 4, adr_mem, value); }
#define N64_MEMORY_WRITE_S16(src, offset, base) { N64_MEMORY_WRITE(src,  int16_t, offset, base, N64_MEMORY_SWAP_16); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 4, adr_mem, value); }
#define N64_MEMORY_LOAD_U16(dest, offset, base) { N64_MEMORY_LOAD (dest, uint16_t, offset, base, N64_MEMORY_SWAP_16); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 1, adr_mem, value); }
#define N64_MEMORY_WRITE_U16(src, offset, base) { N64_MEMORY_WRITE(src,  uint16_t, offset, base, N64_MEMORY_SWAP_16); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 1, adr_mem, value); }
#define N64_MEMORY_LOAD_S32(dest, offset, base) { N64_MEMORY_LOAD (dest, int32_t, offset, base, N64_MEMORY_SWAP_32); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 5, adr_mem, value); }
#define N64_MEMORY_WRITE_S32(src, offset, base) { N64_MEMORY_WRITE(src,  int32_t, offset, base, N64_MEMORY_SWAP_32); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 5, adr_mem, value); }
#define N64_MEMORY_LOAD_U32(dest, offset, base) { N64_MEMORY_LOAD (dest, uint32_t, offset, base, N64_MEMORY_SWAP_32); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 2, adr_mem, value); }
#define N64_MEMORY_WRITE_U32(src, offset, base) { N64_MEMORY_WRITE(src,  uint32_t, offset, base, N64_MEMORY_SWAP_32); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 2, adr_mem, value); }
#define N64_MEMORY_LOAD_U64(dest, offset, base) { N64_MEMORY_LOAD (dest, uint64_t, offset, base, N64_MEMORY_SWAP_64); n64BreakpointMem(ctx, 0, N64_REG_IDX(dest, r0), 0, 8, adr_mem, value); }
#define N64_MEMORY_WRITE_U64(src, offset, base) { N64_MEMORY_WRITE(src,  uint64_t, offset, base, N64_MEMORY_SWAP_64); n64BreakpointMem(ctx, 1, N64_REG_IDX(src,  r0), 0, 8, adr_mem, value); }
#define N64_MEMORY_LOAD_F32(dest, offset, base) { N64_MEMORY_LOAD (dest.u32l, uint32_t, offset, base, N64_MEMORY_SWAP_32); n64BreakpointMem(ctx, 0, 0, N64_REG_IDX(dest, f0), 6, adr_mem, value); }
#define N64_MEMORY_WRITE_F32(src, offset, base) { N64_MEMORY_WRITE(src.u32l,  uint32_t, offset, base, N64_MEMORY_SWAP_32); n64BreakpointMem(ctx, 1, 0, N64_REG_IDX(src,  f0), 6, adr_mem, value); }
#define N64_MEMORY_LOAD_F64(dest, offset, base) { N64_MEMORY_LOAD (dest.u64, uint64_t, offset, base, N64_MEMORY_SWAP_64); n64BreakpointMem(ctx, 0, 0, N64_REG_IDX(dest, f0), 7, adr_mem, value); }
#define N64_MEMORY_WRITE_F64(src, offset, base) { N64_MEMORY_WRITE(src.u64,  uint64_t, offset, base, N64_MEMORY_SWAP_64); n64BreakpointMem(ctx, 1, 0, N64_REG_IDX(src,  f0), 7, adr_mem, value); }

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
#define N64_XOR(v1, v2) (gpr)((v1) ^ (v2))
#define N64_XORI(v1, v2) (gpr)((v1) ^ ((uint16_t)(v2)))
#define N64_NOR(v1, v2) (gpr)(~((v1) | (v2)))
#define N64_SLA32(v1, v2) (gpr)((int64_t)((int32_t)((int32_t)(v1) << ((uint32_t)(v2)&0x1F))))
#define N64_SL32(v1, v2)  (gpr)((int64_t)((int32_t)((uint32_t)(v1) << ((uint32_t)(v2)&0x1F))))
#define N64_SRA32(v1, v2) (gpr)((int64_t)((int32_t)((int32_t)(v1) >> ((uint32_t)(v2)&0x1F))))
#define N64_SR32(v1, v2)  (gpr)((int64_t)((int32_t)((uint32_t)(v1) >> ((uint32_t)(v2)&0x1F))))
#define N64_SLA(v1, v2) (gpr)((int64_t)(v1) << ((uint64_t)(v2)&0x3F))
#define N64_SL(v1, v2) (gpr)((uint64_t)(v1) << ((uint64_t)(v2)&0x3F))
#define N64_SRA(v1, v2) (gpr)((int64_t)(v1) >> ((uint64_t)(v2)&0x3F))
#define N64_SR(v1, v2) (gpr)((uint64_t)(v1) >> ((uint64_t)(v2)&0x3F))
#define N64_SLT(v1, v2, type) (((type)(v1)) < ((type)(v2)))
`);

console.log("Done!");
