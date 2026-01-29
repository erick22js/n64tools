#include "n64disasm.h"


/*
	Instructions analyze
*/
u32 n64AnalyzeComposedInstructionAddressBuildingJumpAddress(Stream *in, u32 opcode) {
	u32 seek = streamGetSeek(in);
	u32 rt = (opcode>>16)&0x1F;
	u32 adr = (opcode&0xFFFF) << 16;

	if ((opcode&0xFFE00000) == 0x3C000000){ // LUI
		bool matched = FALSE;
		for (int range = 0; range < 2; range++){
			opcode = streamRead32(in);
			if (((opcode>>26)&0x3F) == 9 && ((opcode>>21)&0x1F) == rt){ // ADDIU && rs == before rt
				adr |= opcode&0xFFFF;
				matched = TRUE;
				break;
			}
		}
		if (matched) {
			matched = FALSE;
			for (int range = 0; range < 1; range++){
				opcode = streamRead32(in);
				if ((opcode&0xFC1FFFFF) == 8 && ((opcode>>21)&0x1F) == rt){ // JR && rs == before rt
					matched = TRUE;
					break;
				}
			}
		}
		if (!matched) {
			adr = 0xFFFFFFFF;
		}
	}
	else {
		adr = 0xFFFFFFFF;
	}

	streamSeekStart(in, seek);
	return adr;
}


/*
	Disassembler
*/

N64Reg *n64FindCpuRegByIndex(u32 idx) {
	return &n64_cpu_regs[idx&0x1F];
}

N64Reg *n64FindCp0RegByIndex(u32 idx) {
	return &n64_cp0_regs[idx&0x1F];
}

N64Reg *n64FindFprRegByIndex(u32 idx) {
	return &n64_fpr_regs[idx&0x1F];
}

char n64FFmtCodeSymbol(u8 code) {
	static const char codes[] = { 's', 'd', 0, 0, 'w', 'l' };
	if (code < 16 || code > 21) return 0;
	return codes[code-16];
}

const char* n64FindFCompByIndex(u32 idx) {
	return n64_fcmp_cond[idx&0xF];
}

u32 n64TranslateOffsetToAbsoluteAddress(N64Context *ctx, i32 offset, bool is_256_bound) {
	if (is_256_bound) {
		return (ctx->position & (0xF0000000)) + offset*4;
	}
	return ctx->position + 4 + offset*4;
}

bool n64DisasmSingle(N64Context *ctx, u32 instcode, char* out) {
	u8 opcode = (instcode >> 26) & 0x3F;
	u32 co = 0, op = 0, stype = 0, sa = 0, instr = 0;
	i32 immediate = 0, offset = 0;
	bool i_c0 = FALSE;
	bool i_signed = FALSE;
	bool i_trim = FALSE;
	N64Reg *rs = NULL, *rt = NULL, *rd = NULL, *base = NULL, *ft = NULL, *fs = NULL, *fd = NULL;
	char fmt = 0;
	const char* cond = NULL;

	// Specific cases
	if (instcode == 0) {
		sprintf(out, "nop");
		return TRUE;
	}

	// General cases
	for (int i = 0; i < N64_ALL_INST; i++){
		N64Inst *inst = &n64_instrs[i];
		if (inst->opcode != opcode) continue;
		u32 masked_out = instcode & 0x3FFFFFF;
		i_c0 = (inst->flag&N64_IFLAG_CO0);
		i_signed = (inst->flag&N64_IFLAG_ISIGNED);
		i_trim = (inst->flag&N64_IFLAG_ITRIM);

		// Decode operators from code
		bool abort = FALSE;
		for (int o = 0; o < 8; o++) {
			u32 enc_opr = inst->enc[o];
			if (enc_opr == ENC64__END__) break;
			u32 enc_v = (instcode >> n64_enc_off[enc_opr]) & n64_enc_mask[enc_opr];
			switch (enc_opr) {
				case ENC64_CO: co = enc_v;
				break;
				case ENC64_BASE: base = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_RS_21:
				case ENC64_RS_6: rs = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_RT: rt = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_OP: op = enc_v;
				break;
				case ENC64_RD: rd = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_STYPE: stype = enc_v;
				break;
				case ENC64_SA: sa = enc_v;
				break;
				case ENC64_CODE_10:
				case ENC64_CODE_20: offset = enc_v;
				break;
				case ENC64_OFFSET: offset = inst->flag&N64_IFLAG_JUMP_INSTRUCTION? n64TranslateOffsetToAbsoluteAddress(ctx, (i16)((u16)enc_v), FALSE): enc_v;
				break;
				case ENC64_IMMEDIATE: immediate = i_signed && (enc_v >= 0xF000)? -(0x10000-(i32)enc_v): enc_v;
				break;
				case ENC64_INSTR: instr = inst->flag&N64_IFLAG_JUMP_INSTRUCTION? n64TranslateOffsetToAbsoluteAddress(ctx, enc_v, TRUE): enc_v;
				break;
				case ENC64_FMT: {
					if (!(fmt = n64FFmtCodeSymbol((instcode >> 21)&0x1F))) {
						abort = TRUE;
						break;
					}
				}
				break;
				case ENC64_FT: ft = i_c0? n64FindCp0RegByIndex(enc_v): n64FindFprRegByIndex(enc_v);
				break;
				case ENC64_FS: fs = i_c0? n64FindCp0RegByIndex(enc_v): n64FindFprRegByIndex(enc_v);
				break;
				case ENC64_FD: fd = i_c0? n64FindCp0RegByIndex(enc_v): n64FindFprRegByIndex(enc_v);
				break;
				case ENC64_COND: cond = n64FindFCompByIndex(enc_v);
				break;
				case ENC64_SBFUNC_0:
				case ENC64_SBFUNC_16:
				case ENC64_SBFUNC_21:
				case ENC64_FNDTF:
				case ENC64_CCOND_SBFUNC: {
					if (enc_v != inst->subfunc) {
						abort = TRUE;
						break;
					}
				}
				break;
			}
			masked_out &= ~(n64_enc_mask[enc_opr] << n64_enc_off[enc_opr]);
		}
		//if (abort || masked_out) continue; // Avoid decoding instruction with data within gaps
		if (abort) continue;

		//sprintf(out, "%s", inst->mnemonic);
		switch (inst->format) {
			case N64_FMT__: {
				sprintf(out, "%s",
					inst->mnemonic);
			}
			break;
			case N64_FMT_RT_OFFSET_BASE: {
				sprintf(out, i_trim? "%s %s, 0x%X (%s)": "%s %s, 0x%.4X (%s)",
					inst->mnemonic,
					rt->mne_name,
					offset,
					base->mne_name);
			}
			break;
			case N64_FMT_RD_RS_RT: {
				sprintf(out, "%s %s, %s, %s",
					inst->mnemonic,
					rd->mne_name,
					rs->mne_name,
					rt->mne_name);
			}
			break;
			case N64_FMT_RT_RS_IMMEDIATE: {
				sprintf(out, i_trim? "%s %s, %s, %s0x%X": "%s %s, %s, %s0x%.4X",
					inst->mnemonic,
					rt->mne_name,
					rs->mne_name,
					immediate < 0? "-": "", abs(immediate));
			}
			break;
			case N64_FMT_RS_RT: {
				sprintf(out, "%s %s, %s",
					inst->mnemonic,
					rs->mne_name,
					rt->mne_name);
			}
			break;
			case N64_FMT_RD_RT_SA: {
				sprintf(out, "%s %s, %s, %d",
					inst->mnemonic,
					rd->mne_name,
					rt->mne_name,
					sa);
			}
			break;
			case N64_FMT_RD_RT_RS: {
				sprintf(out, "%s %s, %s, %s",
					inst->mnemonic,
					rd->mne_name,
					rt->mne_name,
					rs->mne_name);
			}
			break;
			case N64_FMT_RT_IMMEDIATE: {
				sprintf(out, i_trim? "%s %s, %s0x%X": "%s %s, %s0x%.4X",
					inst->mnemonic,
					rt->mne_name,
					immediate < 0? "-": "", abs(immediate));
			}
			break;
			case N64_FMT_RD: {
				sprintf(out, "%s %s",
					inst->mnemonic,
					rd->mne_name);
			}
			break;
			case N64_FMT_RS: {
				sprintf(out, "%s %s",
					inst->mnemonic,
					rs->mne_name);
			}
			break;
			case N64_FMT_RS_RT_OFFSET: {
				sprintf(out, i_trim? "%s %s, %s, 0x%X": "%s %s, %s, 0x%.4X",
					inst->mnemonic,
					rs->mne_name,
					rt->mne_name,
					offset);
			}
			break;
			case N64_FMT_RS_OFFSET: {
				sprintf(out, i_trim? "%s %s, 0x%X": "%s %s, 0x%.4X",
					inst->mnemonic,
					rs->mne_name,
					offset);
			}
			break;
			case N64_FMT_TARGET: {
				sprintf(out, i_trim? "%s 0x%X": "%s 0x%.8X",
					inst->mnemonic,
					instr);
			}
			break;
			case N64_FMT_OFFSET: {
				sprintf(out, i_trim? "%s 0x%X": "%s 0x%.8X",
					inst->mnemonic,
					offset);
			}
			break;
			case N64_FMT_RD_RS: {
				sprintf(out, "%s %s, %s",
					inst->mnemonic,
					rd->mne_name,
					rs->mne_name);
			}
			break;
			case N64_FMT_RS_IMMEDIATE: {
				sprintf(out, i_trim? "%s %s, %s0x%X": "%s %s, %s0x%.4X",
					inst->mnemonic,
					rs->mne_name,
					immediate < 0? "-": "", abs(immediate));
			}
			break;
			case N64_FMT_OP_OFFSET_BASE: {
				sprintf(out, "%s %d, 0x%.4X (%s)",
					inst->mnemonic,
					op,
					offset,
					base->mne_name);
			}
			break;
			case N64_FMT_RT_RD: {
				sprintf(out, "%s %s, %s",
					inst->mnemonic,
					rt->mne_name,
					rd->mne_name);
			}
			break;
			case N64_FMT_FMT_FD_FS: {
				sprintf(out, "%s.%c %s, %s",
					inst->mnemonic,
					fmt,
					fd->mne_name,
					fs->mne_name);
			}
			break;
			case N64_FMT_COND_FMT_FS_FT: {
				sprintf(out, "%s.%s.%c %s, %s",
					inst->mnemonic,
					cond,
					fmt,
					fs->mne_name,
					ft->mne_name);
			}
			break;
			case N64_FMT_RT_FS: {
				sprintf(out, "%s %s, %s",
					inst->mnemonic,
					rt->mne_name,
					fs->mne_name);
			}
			break;
			case N64_FMT_FMT_FD_FS_FT: {
				sprintf(out, "%s.%c %s, %s, %s",
					inst->mnemonic,
					fmt,
					fd->mne_name,
					fs->mne_name,
					ft->mne_name);
			}
			break;
			case N64_FMT_FT_OFFSET_BASE: {
				sprintf(out, i_trim? "%s %s, 0x%X (%s)": "%s %s, 0x%.4X (%s)",
					inst->mnemonic,
					ft->mne_name,
					offset,
					base->mne_name);
			}
			break;
			default: {
				sprintf(out, "TODO: %s",
					inst->mnemonic);
			}
		}
		return TRUE;
	}

	sprintf(out, ".word 0x%.8X", instcode);
	return FALSE;
}

int n64DisasmStream(N64Context *ctx, Stream *in, Stream *out) {
	if (in->length&3) {
		printf("Stream length should be multiple of 4 bytes");
		return 0;
	}
	streamSeekStart(in, 0);
	streamSeekStart(out, 0);
	streamResize(out, 0);
	//FILE *out = fopen("seg0.asm", "w");
	u32 pc = ctx->position = ctx->ram_address;
	int valid = 0;
	while (!streamEnded(in)){
		char line[128];
		char line2[128];
		u32 opcode = streamRead32(in);
		valid += n64DisasmSingle(ctx, opcode, line);
		N64Symbol *sym = n64FindSymById(ctx, ctx->position);
		if (sym) {
			sprintf(line2, "//\n//\t%s()\n//\n", sym->name);
			streamWriteString(out, line2);
		}
		// JAL instruction
		if ((opcode>>26) == 3){
			u32 function_adr = n64TranslateOffsetToAbsoluteAddress(ctx, opcode&0x3FFFFFF, TRUE);
			N64Symbol *sym = n64FindSymById(ctx, function_adr);
			if (sym){
				sprintf(line2, "/* 0x%.8X */ %s // %s()\n", pc, line, sym->name);
			}
			else {
				sprintf(line2, "/* 0x%.8X */ %s // func_%.8X()\n", pc, line, function_adr);
			}
		}
		else {
			u32 function_adr = 0;
			// A composed instruction set to build a constant long jump address
			if ((function_adr = n64AnalyzeComposedInstructionAddressBuildingJumpAddress(in, opcode)) != 0xFFFFFFFF){
				sprintf(line2, "/* 0x%.8X */ %s // func_%.8X()\n", pc, line, function_adr);
			}
			else {
				sprintf(line2, "/* 0x%.8X */ %s\n", pc, line);
			}
		}
		streamWriteString(out, line2);
		//fprintf(out, "%.8X: %s\n", pc, line);
		ctx->position = (pc += 4);
	}
	return valid;
}

/*
	Symbols ripper
*/

void n64AddSym(N64Context *ctx, u32 id, u32 data, u32 type, u32 flags, const char* name) {
	if (ctx->symbols_limit == 0 || ctx->symbols == NULL) {
		ctx->symbols_limit = 8;
		ctx->symbols = memAlloc(sizeof(N64Symbol) * ctx->symbols_limit);
	}
	if (ctx->symbols_count >= ctx->symbols_limit) {
		ctx->symbols_limit *= 2;
		ctx->symbols = memRealloc(ctx->symbols, sizeof(N64Symbol) * ctx->symbols_limit);
	}
	for (int i = 0; i < ctx->symbols_count; i++) {
		N64Symbol *sym = &ctx->symbols[i];
		if (sym->id == id){
			return;
		}
	}
	N64Symbol *sym = &ctx->symbols[ctx->symbols_count];
	sym->id = id;
	sym->data = data;
	sym->type = type;
	sym->flags = flags;
	memSet(sym->name, 0, 64);
	strcpy(sym->name, name);
	ctx->symbols_count++;
}

void n64AddFunctionSym(N64Context *ctx, u32 adr) {
	char name[64]; sprintf(name, "func_%.8X", adr);
	n64AddSym(ctx, adr, adr, 0, 0, name);
}

N64Symbol *n64FindSymByName(N64Context *ctx, char* name) {
	for (int i = 0; i < ctx->symbols_count; i++) {
		N64Symbol *sym = &ctx->symbols[i];
		if (strcmp(sym->name, name) == 0){
			return sym;
		}
	}
	return NULL;
}

N64Symbol *n64FindSymById(N64Context *ctx, u32 id) {
	for (int i = 0; i < ctx->symbols_count; i++) {
		N64Symbol *sym = &ctx->symbols[i];
		if (sym->id == id){
			return sym;
		}
	}
	return NULL;
}

u32 n64RipSymbols(N64Context *ctx, Stream *in) {
	if (in->length&3) {
		printf("Stream length should be multiple of 4 bytes");
		return 0;
	}
	streamSeekStart(in, 0);
	u32 pc = ctx->position = ctx->ram_address;
	u32 count = 0;
	n64AddFunctionSym(ctx, pc);
	while (!streamEnded(in)){
		u32 opcode = streamRead32(in);
		u32 function_adr = 0;

		// JAL instruction
		if ((opcode>>26) == 3){
			function_adr = n64TranslateOffsetToAbsoluteAddress(ctx, opcode&0x3FFFFFF, TRUE);
			n64AddFunctionSym(ctx, function_adr);
			count++;
		}
		// A composed instruction set to build a constant long jump address
		else if ((function_adr = n64AnalyzeComposedInstructionAddressBuildingJumpAddress(in, opcode)) != 0xFFFFFFFF){
			n64AddFunctionSym(ctx, function_adr);
			count++;
		}

		ctx->position = (pc += 4);
	}
	return count;
}
