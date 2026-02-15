
/*
	Util
*/

function hex(value, digits=0, unsigned=true) {
	if (digits) return value.toString(16).padStart(digits, '0').toUpperCase();
	return value.toString(16).toUpperCase();
}


/*
	Instructions analyze
*/

function n64AnalyzeComposedInstructionAddressBuildingJumpAddress(input, opcode) {
	let seek = input.tell();
	let rt = (opcode>>16)&0x1F;
	let adr = (BigInt(opcode)&0xFFFFn) << 16n;

	if ((opcode&0xFFE00000) == 0x3C000000){ // LUI
		let matched = false;
		for (let range = 0; range < 2; range++){
			opcode = input.read32();
			if (((opcode>>26)&0x3F) == 9 && ((opcode>>21)&0x1F) == rt){ // ADDIU && rs == before rt
				adr |= BigInt(opcode)&0xFFFFn;
				matched = true;
				break;
			}
		}
		if (matched) {
			matched = false;
			for (let range = 0; range < 1; range++){
				opcode = input.read32();
				if ((opcode&0xFC1FFFFF) == 8 && ((opcode>>21)&0x1F) == rt){ // JR && rs == before rt
					matched = true;
					break;
				}
			}
		}
		if (!matched) {
			adr = 0xFFFFFFFFn;
		}
	}
	else {
		adr = 0xFFFFFFFFn;
	}
	
	input.seekSet(seek);
	return adr;
}


/*
	Disassembler
*/

function n64FindCpuRegByIndex(idx) {
	return n64_cpu_regs[idx&0x1F];
}

function n64FindCp0RegByIndex(idx) {
	return n64_cp0_regs[idx&0x1F];
}

function n64FindFprRegByIndex(idx) {
	return n64_fpr_regs[idx&0x1F];
}

function n64FFmtCodeSymbol(code) {
	if (code < 16 || code > 21) return null;
	return ([ 's', 'd', null, null, 'w', 'l' ])[code-16];
}

function n64FindFCompByIndex(idx) {
	return n64_fcmp_cond[idx&0xF];
}

function n64TranslateOffsetToAbsoluteAddress(ctx, offset, is_256_bound) {
	if (is_256_bound) {
		return (BigInt(ctx.position) & (0xF0000000n)) + BigInt(offset)*4n;
	}
	return BigInt(ctx.position) + 4n + BigInt(offset)*4n;
}

function n64DisasmSingle(ctx, instcode) {
	let out = {
		"code": instcode,
		"r": null,
	};
	out.opcode = (instcode >> 26) & 0x3F;
	out.co = 0; out.op = 0; out.stype = 0; out.sa = 0; out.instr = 0;
	out.immediate = 0; out.offset = 0;
	out.i_c0 = false;
	out.i_signed = false;
	out.i_trim = false;
	out.rs = null; out.rt = null; out.rd = null; out.base = null; out.ft = null; out.fs = null; out.fd = null;
	out.fmt = 0;
	out.cond = null;

	// Specific cases
	if (instcode == 0) {
		out.r = n64_instrs[0];
		return out;
	}

	// General cases
	for (let i = 0; i < n64_instrs.length; i++){
		let inst = n64_instrs[i];
		if (inst.opcode != out.opcode) continue;
		let masked_out = instcode & 0x3FFFFFF;
		out.i_c0 = (inst.flag&N64_IFLAG_CO0);
		out.i_signed = (inst.flag&N64_IFLAG_ISIGNED);
		out.i_trim = (inst.flag&N64_IFLAG_ITRIM);
		
		// Decode operators from code
		let abort = false;
		for (let o = 0; o < 8; o++) {
			let enc_opr = inst.enc[o];
			if (enc_opr == ENC64__END__) break;
			let enc_v = (instcode >> n64_enc_off[enc_opr]) & n64_enc_mask[enc_opr];
			switch (enc_opr) {
				case ENC64_CO: out.co = enc_v;
				break;
				case ENC64_BASE: out.base = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_RS_21:
				case ENC64_RS_6: out.rs = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_RT: out.rt = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_OP: out.op = enc_v;
				break;
				case ENC64_RD: out.rd = n64FindCpuRegByIndex(enc_v);
				break;
				case ENC64_STYPE: out.stype = enc_v;
				break;
				case ENC64_SA: out.sa = enc_v;
				break;
				case ENC64_CODE_10:
				case ENC64_CODE_20: out.offset = enc_v;
				break;
				case ENC64_OFFSET: out.offset = inst.flag&N64_IFLAG_JUMP_INSTRUCTION? n64TranslateOffsetToAbsoluteAddress(ctx, enc_v > 0x8000? enc_v-0x10000: enc_v, false): enc_v;
				break;
				case ENC64_IMMEDIATE: out.immediate = out.i_signed && (enc_v >= 0xF000)? -(0x10000-enc_v): enc_v;
				break;
				case ENC64_INSTR: out.instr = inst.flag&N64_IFLAG_JUMP_INSTRUCTION? n64TranslateOffsetToAbsoluteAddress(ctx, enc_v, true): enc_v;
				break;
				case ENC64_FMT: {
					if (!(out.fmt = n64FFmtCodeSymbol((instcode >> 21)&0x1F))) {
						abort = true;
						break;
					}
				}
				break;
				case ENC64_FT: out.ft = out.i_c0? n64FindCp0RegByIndex(enc_v): n64FindFprRegByIndex(enc_v);
				break;
				case ENC64_FS: out.fs = out.i_c0? n64FindCp0RegByIndex(enc_v): n64FindFprRegByIndex(enc_v);
				break;
				case ENC64_FD: out.fd = out.i_c0? n64FindCp0RegByIndex(enc_v): n64FindFprRegByIndex(enc_v);
				break;
				case ENC64_COND: out.cond = n64FindFCompByIndex(enc_v);
				break;
				case ENC64_SBFUNC_0:
				case ENC64_SBFUNC_16:
				case ENC64_SBFUNC_21:
				case ENC64_FNDTF:
				case ENC64_CCOND_SBFUNC: {
					if (enc_v != inst.subfunc) {
						abort = true;
						break;
					}
				}
				break;
				case ENC64___: {
					if (enc_v) {
						abort = true;
						break;
					}
				}
				break;
			}
			masked_out &= ~(n64_enc_mask[enc_opr] << n64_enc_off[enc_opr]);
		}
		//if (abort || masked_out) continue; // Avoid decoding instruction with data within gaps
		if (abort) continue;
		
		out.r = inst;
		return out;
	}
	
	out.r = null;
	return out;
}

function n64InstructionToString(ctx, inst) {
	let out = '';
	if (inst.r){
		switch (inst.r.format) {
			case N64_FMT__: {
				out = inst.r.mnemonic;
			}
			break;
			case N64_FMT_RT_OFFSET_BASE: {
				out = inst.r.mnemonic + " " + inst.rt + ", 0x" + inst.offset.toString(16).toUpperCase().padStart(4, '0') + " (" + inst.base + ")";
			}
			break;
			case N64_FMT_RD_RS_RT: {
				out = inst.r.mnemonic + " " + inst.rd + ", " + inst.rs + ", " + inst.rt;
			}
			break;
			case N64_FMT_RT_RS_IMMEDIATE: {
				out = inst.r.mnemonic + " " + inst.rt + ", " + inst.rs + ", " + (inst.immediate < 0? "-0x": "0x") + (Math.abs(inst.immediate).toString(16).toUpperCase());
			}
			break;
			case N64_FMT_RS_RT: {
				out = inst.r.mnemonic + " " + inst.rs + ", " + inst.rt;
			}
			break;
			case N64_FMT_RD_RT_SA: {
				out = inst.r.mnemonic + " " + inst.rd + ", " + inst.rt + ", " + inst.sa;
			}
			break;
			case N64_FMT_RD_RT_RS: {
				out = inst.r.mnemonic + " " + inst.rd + ", " + inst.rt + ", " + inst.rs;
			}
			break;
			case N64_FMT_RT_IMMEDIATE: {
				out = inst.r.mnemonic + " " + inst.rt + ", " + (inst.immediate < 0? "-0x": "0x") + (Math.abs(inst.immediate).toString(16).toUpperCase());
			}
			break;
			case N64_FMT_RD: {
				out = inst.r.mnemonic + " " + inst.rd;
			}
			break;
			case N64_FMT_RS: {
				out = inst.r.mnemonic + " " + inst.rs;
			}
			break;
			case N64_FMT_RS_RT_OFFSET: {
				out = inst.r.mnemonic + " " + inst.rs + ", " + inst.rt + ", 0x" + inst.offset.toString(16).toUpperCase().padStart(4, '0');
			}
			break;
			case N64_FMT_RS_OFFSET: {
				out = inst.r.mnemonic + " " + inst.rs + ", 0x" + inst.offset.toString(16).toUpperCase().padStart(4, '0');
			}
			break;
			case N64_FMT_TARGET: {
				out = inst.r.mnemonic + " 0x" + inst.instr.toString(16).toUpperCase().padStart(8, '0');
			}
			break;
			case N64_FMT_OFFSET: {
				out = inst.r.mnemonic + " 0x" + inst.offset.toString(16).toUpperCase().padStart(8, '0');
			}
			break;
			case N64_FMT_RD_RS: {
				out = inst.r.mnemonic + " " + inst.rd + ", " + inst.rs;
			}
			break;
			case N64_FMT_RS_IMMEDIATE: {
				out = inst.r.mnemonic + " " + inst.rs + ", " + (inst.immediate < 0? "-0x": "0x") + (Math.abs(inst.immediate).toString(16).toUpperCase());
			}
			break;
			case N64_FMT_OP_OFFSET_BASE: {
				out = inst.r.mnemonic + " " + inst.op + ", 0x" + inst.offset.toString(16).toUpperCase().padStart(4, '0') + " (" + inst.base + ")";
			}
			break;
			case N64_FMT_RT_RD: {
				out = inst.r.mnemonic + " " + inst.rt + ", " + inst.rd;
			}
			break;
			case N64_FMT_FMT_FD_FS: {
				out = inst.r.mnemonic + "." + inst.fmt + " " + inst.fd + ", " + inst.fs;
			}
			break;
			case N64_FMT_COND_FMT_FS_FT: {
				out = inst.r.mnemonic + "." + inst.cond + "." + inst.fmt + " " + inst.fs + ", " + inst.ft;
			}
			break;
			case N64_FMT_RT_FS: {
				out = inst.r.mnemonic + " " + inst.rt + ", " + inst.fs;
			}
			break;
			case N64_FMT_FMT_FD_FS_FT: {
				out = inst.r.mnemonic + "." + inst.fmt + " " + inst.fd + ", " + inst.fs + ", " + inst.ft;
			}
			break;
			case N64_FMT_FT_OFFSET_BASE: {
				out = inst.r.mnemonic + " " + inst.ft + ", 0x" + inst.offset.toString(16).toUpperCase().padStart(4, '0') + " (" + inst.base + ")";
			}
			break;
			default: {
				out = "TODO-ASM: " + inst.mnemonic;
			}
		}
	}
	else {
		out = ".word 0x" + inst.code.toString(16).toUpperCase().padStart(8, '0');
	}
	return out;
}

function n64DisasmStream(ctx, input, output) {
	if (input.size()&3) {
		printf("Stream length should be multiple of 4 bytes");
		return 0;
	}
	input.seekSet(0);
	output.seekSet(0);
	let pc = ctx.position = ctx.ram_address;
	while (!input.eof()){
		let line = "";
		let line2 = "";
		let opcode = input.read32();
		let inst = n64DisasmSingle(ctx, opcode);
		line = n64InstructionToString(ctx, inst);
		
		let sym = n64FindSymById(ctx, ctx.position, N64_SYM_FUNCTION);
		if (sym) {
			output.writeString("//\n//\t"+sym.name+"()\n//\n");
		}
		// JAL instruction
		if ((opcode>>26) == 3){
			let function_adr = n64TranslateOffsetToAbsoluteAddress(ctx, opcode&0x3FFFFFF, true);
			let sym = n64FindSymById(ctx, function_adr, N64_SYM_FUNCTION);
			if (sym){
				output.writeString("/* 0x" + pc.toString(16).padStart(8, '0').toUpperCase() + " */ " + line + " // " + sym.name + "()\n");
			}
			else {
				output.writeString("/* 0x" + pc.toString(16).padStart(8, '0').toUpperCase() + " */ " + line + " // func_" + function_adr.toString(16).padStart(8, '0').toUpperCase() + "()\n");
			}
		}
		else {
			let function_adr = 0;
			// A composed instruction set to build a constant long jump address
			if ((function_adr = n64AnalyzeComposedInstructionAddressBuildingJumpAddress(input, opcode)) != 0xFFFFFFFF){
				output.writeString("/* 0x" + pc.toString(16).padStart(8, '0').toUpperCase() + " */ " + line + " // func_" + hex(function_adr, 8) + "()\n");
			}
			else {
				output.writeString("/* 0x" + pc.toString(16).padStart(8, '0').toUpperCase() + " */ " + line + "\n");
			}
		}
		ctx.position = (pc += 4);
	}
}

/*
	Symbols ripper
*/

const N64_SYM_FUNCTION = 0;
const N64_SYM_LABEL = 1;

function n64AddSym(ctx, id, data, type, flags, name) {
	/*for (let i = 0; i < ctx.symbols.length; i++) {
		let sym = ctx.symbols[i];
		if (sym.id == id && sym.type == type){
			return null;
		}
	}*/
	if (!ctx._syms) ctx._syms = {};
	if (ctx._syms[id]) {
		for (let i = 0; i < ctx._syms[id].length; i++) {
			let sym = ctx._syms[id][i];
			if (sym.id == id && sym.type == type){
				return null;
			}
		}
	}
	let sym = {
		"id": id,
		"data": data,
		"type": type,
		"flags": flags,
		"name": name
	};
	ctx.symbols.push(sym);
	if (!ctx._syms[id]) ctx._syms[id] = [ sym ];
	else {
		ctx._syms[id].push(sym);
	}
}

function n64AddFunctionSym(ctx, adr, name = null) {
	n64AddSym(ctx, adr, adr, N64_SYM_FUNCTION, 0, name? name : "func_" + adr.toString(16).padStart(8, '0').toUpperCase());
}

function n64AddLabelSym(ctx, adr, name = null) {
	n64AddSym(ctx, adr, adr, N64_SYM_LABEL, 0, name? name : "l_" + adr.toString(16).padStart(8, '0').toUpperCase());
}

function n64FindSymByName(ctx, name, type = -1) {
	if (!ctx._syms) ctx._syms = {};
	/*for (let i = 0; i < ctx.symbols.length; i++) {
		let sym = ctx.symbols[i];
		if ((sym.name == name) && (type < 0? true: type == sym.type)){
			return sym;
		}
	}*/
	if (ctx._syms[id]) {
		for (let i = 0; i < ctx._syms[id].length; i++) {
			let sym = ctx._syms[id][i];
			if ((sym.name == name) && (type < 0? true: type == sym.type)){
				return sym;
			}
		}
	}
	return null;
}

function n64FindSymById(ctx, id, type = -1) {
	if (!ctx._syms) ctx._syms = {};
	/*for (let i = 0; i < ctx.symbols.length; i++) {
		let sym = ctx.symbols[i];
		if ((sym.id == id) && (type < 0? true: type == sym.type)){
			return sym;
		}
	}*/
	if (ctx._syms[id]) {
		for (let i = 0; i < ctx._syms[id].length; i++) {
			let sym = ctx._syms[id][i];
			if ((sym.id == id) && (type < 0? true: type == sym.type)){
				return sym;
			}
		}
	}
	return null;
}

function n64RipSymbols(ctx, input) {
	if (input.size()&3) {
		printf("Stream length should be multiple of 4 bytes");
		return 0;
	}
	input.seekSet(0);
	let pc = ctx.position = ctx.ram_address;
	let count = 0;
	n64AddFunctionSym(ctx, pc);
	while (!input.eof()){
		let opcode = input.read32(input);
		let inst = n64DisasmSingle(ctx, opcode);
		let function_adr = 0;
		
		// JAL instruction
		if (inst.r.mnemonic == 'jal'){
			n64AddFunctionSym(ctx, inst.instr);
			count++;
		}
		// BRANCHES instructions
		else if (inst.r.mnemonic.startsWith("bl") || inst.r.mnemonic.startsWith("bg") || inst.r.mnemonic.startsWith("bn") || inst.r.mnemonic.startsWith("be") || inst.r.mnemonic.startsWith("bc")) {
			n64AddLabelSym(ctx, inst.offset);
			count++;
		}
		// J instruction
		else if (inst.r.mnemonic == 'j') {
			n64AddLabelSym(ctx, inst.instr);
			count++;
		}
		// A composed instruction set to build a constant long jump address
		else if ((function_adr = n64AnalyzeComposedInstructionAddressBuildingJumpAddress(input, opcode)) != 0xFFFFFFFF){
			n64AddFunctionSym(ctx, function_adr);
			count++;
		}

		ctx.position = (pc += 4);
	}
	return count;
}
