#include "n64asm.h"


#define charIsNBinary(chr) (((chr)=='0' || (chr)=='1'))
#define charIsNDecimal(chr) (((chr)>='0' && (chr)<='9'))
#define charIsNHexadecimal(chr) (((chr)>='0' && (chr)<='9') || ((chr)>='a' && (chr)<='f') || ((chr)>='A' && (chr)<='F'))
#define charIsLetter(chr) (((chr)>='a' && (chr)<='z') || ((chr)>='A' && (chr)<='Z') || (chr=='_'))
#define charIsIdentifier(chr) (charIsLetter(chr) || charIsNDecimal(chr))

#define tkIsNumber() ((tk_id == TOKEN_BIN) || (tk_id == TOKEN_DEC) || (tk_id == TOKEN_HEX))
#define tkIsSymbol() ((tk_id == TOKEN_SYMBOL))
#define tkIsTheSymbol(sym) ((tk_id == TOKEN_SYMBOL) && (strcmp(tk, sym)==0))
#define tkIsName() ((tk_id == TOKEN_NAME))
#define tkIsTheName(name) ((tk_id == TOKEN_NAME) && (strcmp(tk, name)==0))
#define tkIsEOL() (tk_id == TOKEN_EOL)
#define fetchAndThrow() { tk_id = n64LexerNextToken(in, tk); if (tk_id == -1) return 1; }
#define fetchAndAssert(exp) { tk_id = n64LexerNextToken(in, tk); if (tk_id == -1) return 1; if (!(exp)) return 1;}
#define justThrowError(err) { if (err) return err; }

#define output4Bytes(data) { streamWrite32(out, data); ctx->position = (pc += 4); }

#define fetchFormat(out) { fetchAndAssert(tkIsTheSymbol(".")); fetchAndAssert(tkIsName()); if ((*(u16*)tk)!='\0s'&&(*(u16*)tk)!='\0d'&&(*(u16*)tk)!='\0w'&&(*(u16*)tk)!='\0l') return 1; out = tk[0]; }
#define fetchCondition(out) { fetchAndAssert(tkIsTheSymbol(".")); fetchAndAssert(tkIsName()); if ((out = n64FindFCompByName(tk)) == -1) return 1; }
#define fetchNumberArg(out, cont) { fetchAndAssert(tkIsNumber()); out = n64ParseNumber(); if (cont) {fetchAndAssert(tkIsTheSymbol(","))} else {fetchAndAssert(tkIsEOL())} }
#define fetchCpuRegArg(out, cont) { fetchAndAssert(tkIsName()); int reg = n64FindCpuRegByName(tk); if (reg == -1) return 1; out = reg; if (cont) {fetchAndAssert(tkIsTheSymbol(","))} else {fetchAndAssert(tkIsEOL())} }
#define fetchCp0RegArg(out, cont) { fetchAndAssert(tkIsName()); int reg = n64FindCp0RegByName(tk); if (reg == -1) return 1; out = reg; if (cont) {fetchAndAssert(tkIsTheSymbol(","))} else {fetchAndAssert(tkIsEOL())} }
#define fetchFprRegArg(out, cont) { fetchAndAssert(tkIsName()); int reg = n64FindFprRegByName(tk); if (reg == -1) return 1; out = reg; if (cont) {fetchAndAssert(tkIsTheSymbol(","))} else {fetchAndAssert(tkIsEOL())} }
#define fetchBaseOffsetArg(out_base, out_offset) { fetchAndAssert(tkIsNumber()); out_offset = n64ParseNumber(); fetchAndAssert(tkIsTheSymbol("(")); fetchAndAssert(tkIsName()); int reg = n64FindCpuRegByName(tk); if (reg == -1) return 1; out_base = reg; fetchAndAssert(tkIsTheSymbol(")")); fetchAndAssert(tkIsEOL()); }

#define TOKEN_BIN 1
#define TOKEN_DEC 2
#define TOKEN_HEX 3
#define TOKEN_NAME 4
#define TOKEN_SYMBOL 5
#define TOKEN_EOL 6

int n64FindCpuRegByName(char* name) {
	for (int i = 0; i < 32; i++){
		if (strcmp(n64_cpu_regs[i].mne_name, name) == 0) {
			return i;
		}
	}
	return -1;
}

int n64FindCp0RegByName(char* name) {
	for (int i = 0; i < 32; i++){
		if (strcmp(n64_cp0_regs[i].mne_name, name) == 0) {
			return i;
		}
	}
	return -1;
}

int n64FindFprRegByName(char* name) {
	for (int i = 0; i < 32; i++){
		if (strcmp(n64_fpr_regs[i].mne_name, name) == 0) {
			return i;
		}
	}
	return -1;
}

u8 n64FFmtSymbolCode(char symbol) {
	if (symbol == 's') return 16;
	if (symbol == 'd') return 17;
	if (symbol == 'w') return 20;
	if (symbol == 'l') return 21;
	return 0;
}

int n64FindFCompByName(char* name) {
	for (int i = 0; i < 16; i++) {
		if (strcmp(n64_fcmp_cond[i], name) == 0) {
			return i;
		}
	}
	return -1;
}

u32 n64TranslateAbsoluteToOffsetAddress(N64Context *ctx, i32 offset, bool is_256_bound) {
	if (is_256_bound) {
		return (offset - (ctx->position & (~0x3FFFFFF))) >> 2;
	}
	return (offset - 4 - ctx->position) >> 2;
}

// It will fetch a maximum of 63 tokens
// Will return a token type id or a error code (-1)
int n64LexerNextToken(Stream *in, char* out) {
	u8 chr = 0;
	u8 len = 0;

	if (streamEnded(in)){
		out[len] = '\n';
		out[len+1] = 0;
		return TOKEN_EOL;
	}
	do {
		chr = streamRead8(in);
		// Ignore spaces
		if (chr == ' ') continue;
		if (chr == '/') {
			chr = streamRead8(in);
			if (chr == '/') {
				do {
					chr = streamRead8(in);
				} while (chr != '\n' && chr != '\r' && !streamEnded(in));
				out[len] = chr; len++;
				out[len] = 0;
				return TOKEN_EOL;
			}
			if (chr == '*') {
				do {
					chr = streamRead8(in);
					if (chr == '*') {
						chr = streamRead8(in);
						if (chr == '/'){
							break;
						}
					}
				} while (!streamEnded(in));
				continue;;
			}
			return -1;
		}
		else if (chr == '-') {
			out[len] = chr; len++; chr = streamRead8(in);
			if (chr == '0') {
				out[len] = chr; len++; chr = streamRead8(in);
				if (chr == 'b') {
					do {
						out[len] = chr; len++; chr = streamRead8(in);
					} while (charIsNBinary(chr) && len < 63 && !streamEnded(in));
					if (charIsIdentifier(chr)) return -1;
					streamSeekCurrent(in, -1);
					out[len] = 0;
					return TOKEN_BIN;
				}
				else if (chr == 'x') {
					do {
						out[len] = chr; len++; chr = streamRead8(in);
					} while (charIsNHexadecimal(chr) && len < 63 && !streamEnded(in));
					if (charIsIdentifier(chr)) return -1;
					streamSeekCurrent(in, -1);
					out[len] = 0;
					return TOKEN_HEX;
				}
				else if (charIsNDecimal(chr)) {
					do {
						out[len] = chr; len++; chr = streamRead8(in);
					} while (charIsNDecimal(chr) && len < 63 && !streamEnded(in));
					if (charIsIdentifier(chr)) return -1;
					streamSeekCurrent(in, -1);
					out[len] = 0;
					return TOKEN_DEC;
				}
				else if (charIsIdentifier(chr)) return -1;
				streamSeekCurrent(in, -1);
				out[len] = 0;
				return TOKEN_DEC;
			}
			else if (charIsNDecimal(chr)) {
				do {
					out[len] = chr; len++; chr = streamRead8(in);
				} while (charIsNDecimal(chr) && len < 63 && !streamEnded(in));
				if (charIsIdentifier(chr)) return -1;
				streamSeekCurrent(in, -1);
				out[len] = 0;
				return TOKEN_DEC;
			}
			return -1;
		}
		else if (chr == '0') {
			out[len] = chr; len++; chr = streamRead8(in);
			if (chr == 'b') {
				do {
					out[len] = chr; len++; chr = streamRead8(in);
				} while (charIsNBinary(chr) && len < 63 && !streamEnded(in));
				if (charIsIdentifier(chr)) return -1;
				streamSeekCurrent(in, -1);
				out[len] = 0;
				return TOKEN_BIN;
			}
			else if (chr == 'x') {
				do {
					out[len] = chr; len++; chr = streamRead8(in);
				} while (charIsNHexadecimal(chr) && len < 63 && !streamEnded(in));
				if (charIsIdentifier(chr)) return -1;
				streamSeekCurrent(in, -1);
				out[len] = 0;
				return TOKEN_HEX;
			}
			else if (charIsNDecimal(chr)) {
				do {
					out[len] = chr; len++; chr = streamRead8(in);
				} while (charIsNDecimal(chr) && len < 63 && !streamEnded(in));
				if (charIsIdentifier(chr)) return -1;
				streamSeekCurrent(in, -1);
				out[len] = 0;
				return TOKEN_DEC;
			}
			else if (charIsIdentifier(chr)) return -1;
			streamSeekCurrent(in, -1);
			out[len] = 0;
			return TOKEN_DEC;
		}
		else if (charIsNDecimal(chr)) {
			do {
				out[len] = chr; len++; chr = streamRead8(in);
			} while (charIsNDecimal(chr) && len < 63 && !streamEnded(in));
			if (charIsIdentifier(chr)) return -1;
			streamSeekCurrent(in, -1);
			out[len] = 0;
			return TOKEN_DEC;
		}
		else if (charIsIdentifier(chr)) {
			do {
				out[len] = chr; len++; chr = streamRead8(in);
			} while (charIsIdentifier(chr) && len < 63 && !streamEnded(in));
			streamSeekCurrent(in, -1);
			out[len] = 0;
			return TOKEN_NAME;
		}
		else if (chr == 0 || chr == '\n' || chr == '\r') {
			out[len] = chr; len++;
			out[len] = 0;
			return TOKEN_EOL;
		}
		out[len] = chr; len++;
		out[len] = 0;
		return TOKEN_SYMBOL;
	} while (len < 63 && !streamEnded(in));
	return 0;
}

u32 _n64ParseNumber(char* tk, u8 id) {
	bool is_signed = FALSE;
	i64 v = 0;
	int i = id == 2? 0: 2;
	if (tk[0] == '-') {
		is_signed = TRUE;
		i++;
	}
	for (; tk[i]; i++){
		if (id==1){
			v *= 2;
			v += tk[i]-'0';
		}
		if (id==2){
			v *= 10;
			v += tk[i]-'0';
		}
		if (id==3){
			v *= 16;
			if (tk[i]>='0' && tk[i]<='9') v += tk[i]-'0';
			if (tk[i]>='a' && tk[i]<='f') v += tk[i]-'a' + 10;
			if (tk[i]>='A' && tk[i]<='F') v += tk[i]-'A' + 10;
		}
		v &= 0xFFFFFFFF;
	}
	return is_signed? (i32)(-v): v;
}
#define n64ParseNumber() (_n64ParseNumber(tk, tk_id))

int n64TestMnemonicMatches(char* tk, N64Inst *inst, Stream *in, bool *matches) {
	u32 tk_id = 0;
	u32 pos = streamGetSeek(in);
	if (*matches) {
		printf("");
	}
	if (*matches && ((*(u32*)tk) == '\0dda' || (*(u32*)tk) == '\0vid' || (*(u32*)tk) == '\0bus')) {
		*matches = inst->enc[0]!=ENC64_FMT;
		tk += 3;
		fetchAndThrow();
		streamSeekStart(in, pos);
		if (!tkIsTheSymbol(".")) { return 0; tk[0] = 0; }
		tk[0] = 0;
		*matches = inst->enc[0]==ENC64_FMT;
	}
	else if ((*(u16*)inst->mnemonic) == (*(u16*)tk) && ((*(u32*)tk) == 'nurt' || (*(u32*)tk) == 'nuor' || (*(u32*)tk) == 'oolf' || (*(u32*)tk) == '\0tvc' || (*(u32*)tk) == 'liec')) {
		u8 len = 5;
		if ((*(u32*)tk) == '\0tvc') len = 3;
		else if ((*(u32*)tk) == 'liec') len = 4;
		tk += len;
		fetchAndThrow();
		if (!tkIsTheSymbol(".")) { streamSeekStart(in, pos); tk[0] = 0; return 0; }
		tk += 1;
		fetchAndThrow();
		if (strcmp(tk-1-len, inst->mnemonic) == 0) *matches = TRUE;
		else {
			streamSeekStart(in, pos);
			tk--; tk[0] = 0;
		}
	}
	return 0;
}

int n64AsmProccess(N64Context *ctx, Stream *in, Stream *out) {
	char tk[64];
	u32 tk_id = 0;

	streamSeekStart(in, 0);
	streamSeekStart(out, 0); streamResize(out, 0);
	u32 pc = ctx->position = ctx->ram_address;

	while (!streamEnded(in)){
		u32 co = 0, op = 0, stype = 0, sa = 0, instr = 0;
		i32 immediate = 0, offset = 0;
		bool i_c0 = FALSE;
		u8 rs = -1, rt = -1, rd = -1, base = -1, ft = -1, fs = -1, fd = -1;
		char fmt = 0;
		int cond = 0;

		fetchAndThrow();
		if (tkIsTheSymbol(".")) {
			fetchAndAssert(tkIsTheName("word"));
			fetchAndAssert(tkIsNumber());
			output4Bytes(n64ParseNumber());
			fetchAndAssert(tkIsEOL());
			continue;
		}
		if (tkIsName()) {
			bool matched = FALSE;

			if (tkIsTheName("nop")){
				fetchAndAssert(tkIsEOL());
				output4Bytes(0);
				continue;
			}

			for (int i = 0; i < N64_ALL_INST; i++){
				N64Inst *inst = &n64_instrs[i];
				if (tkIsTheName(inst->mnemonic)) matched = TRUE;
				justThrowError(n64TestMnemonicMatches(tk, inst, in, &matched));
				if (!matched) continue;
				i_c0 = (inst->flag&N64_IFLAG_CO0);

				switch (inst->format) {
					case N64_FMT__: {
						fetchAndAssert(tkIsEOL());
					}
					break;
					case N64_FMT_RT_OFFSET_BASE: {
						fetchCpuRegArg(rt, TRUE);
						fetchBaseOffsetArg(base, offset);
					}
					break;
					case N64_FMT_RD_RS_RT: {
						fetchCpuRegArg(rd, TRUE);
						fetchCpuRegArg(rs, TRUE);
						fetchCpuRegArg(rt, FALSE);
					}
					break;
					case N64_FMT_RT_RS_IMMEDIATE: {
						fetchCpuRegArg(rt, TRUE);
						fetchCpuRegArg(rs, TRUE);
						fetchNumberArg(immediate, FALSE);
					}
					break;
					case N64_FMT_RS_RT: {
						fetchCpuRegArg(rs, TRUE);
						fetchCpuRegArg(rt, FALSE);
					}
					break;
					case N64_FMT_RD_RT_SA: {
						fetchCpuRegArg(rd, TRUE);
						fetchCpuRegArg(rt, TRUE);
						fetchNumberArg(sa, FALSE);
					}
					break;
					case N64_FMT_RD_RT_RS: {
						fetchCpuRegArg(rd, TRUE);
						fetchCpuRegArg(rt, TRUE);
						fetchCpuRegArg(rs, FALSE);
					}
					break;
					case N64_FMT_RT_IMMEDIATE: {
						fetchCpuRegArg(rt, TRUE);
						fetchNumberArg(immediate, FALSE);
					}
					break;
					case N64_FMT_RD: {
						fetchCpuRegArg(rd, FALSE);
					}
					break;
					case N64_FMT_RS: {
						fetchCpuRegArg(rs, FALSE);
					}
					break;
					case N64_FMT_RS_RT_OFFSET: {
						fetchCpuRegArg(rs, TRUE);
						fetchCpuRegArg(rt, TRUE);
						fetchNumberArg(offset, FALSE);
					}
					break;
					case N64_FMT_RS_OFFSET: {
						fetchCpuRegArg(rs, TRUE);
						fetchNumberArg(offset, FALSE);
					}
					break;
					case N64_FMT_TARGET: {
						fetchNumberArg(instr, FALSE);
					}
					break;
					case N64_FMT_OFFSET: {
						fetchNumberArg(offset, FALSE);
					}
					break;
					case N64_FMT_RD_RS: {
						fetchCpuRegArg(rd, TRUE);
						fetchCpuRegArg(rs, FALSE);
					}
					break;
					case N64_FMT_RS_IMMEDIATE: {
						fetchCpuRegArg(rs, TRUE);
						fetchNumberArg(immediate, FALSE);
					}
					break;
					case N64_FMT_OP_OFFSET_BASE: {
						fetchNumberArg(op, TRUE);
						fetchBaseOffsetArg(base, offset);
					}
					break;
					case N64_FMT_RT_RD: {
						fetchCpuRegArg(rt, TRUE);
						fetchCpuRegArg(rd, FALSE);
					}
					break;
					case N64_FMT_FMT_FD_FS: {
						fetchFormat(fmt);
						fetchFprRegArg(fd, TRUE);
						fetchFprRegArg(fs, FALSE);
					}
					break;
					case N64_FMT_COND_FMT_FS_FT: {
						fetchCondition(cond);
						fetchFormat(fmt);
						fetchFprRegArg(fs, TRUE);
						fetchFprRegArg(ft, FALSE);
					}
					break;
					case N64_FMT_RT_FS: {
						fetchCpuRegArg(rt, TRUE);
						if (i_c0){
							fetchCp0RegArg(fs, FALSE);
						}
						else {
							fetchFprRegArg(fs, FALSE);
						}
					}
					break;
					case N64_FMT_FMT_FD_FS_FT: {
						fetchFormat(fmt);
						fetchFprRegArg(fd, TRUE);
						fetchFprRegArg(fs, TRUE);
						fetchFprRegArg(ft, FALSE);
					}
					break;
					case N64_FMT_FT_OFFSET_BASE: {
						fetchFprRegArg(ft, TRUE);
						fetchBaseOffsetArg(base, offset);
					}
					break;
					default: {
						justThrowError(1);
					}
				}

				// Encode operators to code
				u32 instcode = 0;
				for (int o = 0; o < 8; o++) {
					u32 enc_opr = inst->enc[o];
					if (enc_opr == ENC64__END__) break;
					u32 enc_v = 0;
					switch (enc_opr) {
						case ENC64_CO: enc_v = 1;
						break;
						case ENC64_BASE: enc_v = base;
						break;
						case ENC64_RS_21:
						case ENC64_RS_6: enc_v = rs;
						break;
						case ENC64_RT: enc_v = rt;
						break;
						case ENC64_OP: enc_v = op;
						break;
						case ENC64_RD: enc_v = rd;
						break;
						case ENC64_STYPE: enc_v = stype;
						break;
						case ENC64_SA: enc_v = sa;
						break;
						case ENC64_CODE_10:
						case ENC64_CODE_20: enc_v = offset;
						break;
						case ENC64_OFFSET: enc_v = inst->flag&N64_IFLAG_JUMP_INSTRUCTION? n64TranslateAbsoluteToOffsetAddress(ctx, offset, FALSE): offset;
						break;
						case ENC64_IMMEDIATE: enc_v = immediate;
						break;
						case ENC64_INSTR: enc_v = inst->flag&N64_IFLAG_JUMP_INSTRUCTION? n64TranslateAbsoluteToOffsetAddress(ctx, instr, TRUE): instr;
						break;
						case ENC64_FMT: {
							enc_v = n64FFmtSymbolCode(fmt);
						}
						break;
						case ENC64_FT: enc_v = ft;
						break;
						case ENC64_FS: enc_v = fs;
						break;
						case ENC64_FD: enc_v = fd;
						break;
						case ENC64_COND: enc_v = cond;
						break;
						case ENC64_SBFUNC_0:
						case ENC64_SBFUNC_16:
						case ENC64_SBFUNC_21:
						case ENC64_FNDTF:
						case ENC64_CCOND_SBFUNC: {
							enc_v = inst->subfunc;
						}
						break;
					}
					instcode |= (enc_v & n64_enc_mask[enc_opr]) << n64_enc_off[enc_opr];
				}
				instcode |= (inst->opcode & 0x3F) << 26;
				output4Bytes(instcode);
				break;
			}
			if (matched) continue;
			justThrowError(1);
		}
		if (tkIsEOL()) continue;
		justThrowError(1);
		//printf("%.2d = '%s'\n", tk_id, tk);
	}
	return 0;
}
