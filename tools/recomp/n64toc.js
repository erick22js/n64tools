
/*
	Util functions
*/

function n64ImmHex(v){
	return v < 0? "-0x" + (-v).toString(16).toUpperCase(): "0x" + v.toString(16).toUpperCase();
}

function n64MemLoad(sd, base, acc, offset, swap_d = false, cast = null){
	if (swap_d){
		return acc + "(ctx->" + base + ", " + n64ImmHex(offset) + ") = " + "ctx->" + sd;
	}
	return "ctx->" + sd + " = " + acc + "(ctx->" + base + ", " + n64ImmHex(offset) + ")";
}

function n64Memory(reg, base, offset, type, write=false){
	return "N64_MEMORY_" + (write? "WRITE": "LOAD") + "_" + type.toUpperCase() + "(" + reg + ", " + n64ImmHex(offset) + ", " + base + ")";
}

function n64branchTest(v1, opr, v2, cast="int64_t"){
	if (!(typeof(v2) === 'string')) v2 = n64ImmHex(v2);
	else v2 = "ctx->" + v2;
	return "if (((" + cast + ")ctx->" + v1 + ") " + opr + " ((" + cast + ")" + v2 + ")){";
}

function n64attrib(d, v){
	if (!(typeof(v) === 'string')) v = n64ImmHex(v);
	else v = "ctx->" + v;
	return "ctx->" + d + " = " + v;
}

function n64unOpr(d, v, opr){
	if (!(typeof(v) === 'string')) v = n64ImmHex(v);
	else v = "ctx->" + v;
	return "ctx->" + d + " = " + opr + "(" + v + ")";
}

function n64binOpr(d, v1, opr, v2){
	if (!(typeof(v2) === 'string')) v2 = n64ImmHex(v2);
	else v2 = "ctx->" + v2;
	return "ctx->" + d + " = " + opr + "(ctx->" + v1 + ", " + v2 + ")";
}

function n64fpOpr(d, v1, opr, v2){
	if (!(typeof(v2) === 'string')) v2 = n64ImmHex(v2);
	else v2 = "ctx->" + v2;
	return "ctx->" + d + " = ctx->" + v1 + " " + opr + " " + v2 + "";
}

function n64muldiv(v1, opr, v2, type){
	if (!(typeof(v2) === 'string')) v2 = n64ImmHex(v2);
	else v2 = "ctx->" + v2;
	return opr + "(ctx->" + v1 + ", " + v2 + ", " + type + ")";
}

function n64slt(d, v1, v2, type){
	if (!(typeof(v2) === 'string')) v2 = n64ImmHex(v2);
	else v2 = "ctx->" + v2;
	return "ctx->" + d + " = N64_SLT(ctx->" + v1 + ", " + v2 + ", " + type + ")";
}

function n64jrConstReg(ctx, input, reg) {
	let add_found = false;
	let done = false;
	let adr = 0n;
	for (let i = 0; i < 6; i++){
		if (add_found){
			let inst = n64DisasmAt(ctx, input, -i*4);
			if ((inst.r.mnemonic == "lui") && (inst.rt == reg)) {
				done = true;
				adr |= BigInt(inst.immediate&0xFFFF) << 16n;
				break;
			}
		}
		else {
			let inst = n64DisasmAt(ctx, input, -i*4);
			if ((inst.r.mnemonic == "addiu") && (inst.rt == inst.rs) && (inst.rs == reg)) {
				add_found = true;
				adr = BigInt(inst.immediate&0xFFFF);
			}
		}
	}
	//if (done) console.log("Const adr: 0x"+hex(adr));
	return done? adr: 0;
}

/*
	Convert each instruction as C equivalent
*/

function n64InstructionLineToC(ctx, inst, input, output, info=0) {
	let instruction = n64InstructionToString(ctx, inst);
	let line = "";
	
	let instr_delay_copies = 0;
	let jump_line = null;
	
	switch (inst.r.mnemonic){
		case "lb": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s8", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_B', inst.offset, false);
		}
		break;
		case "lbu": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "u8", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_B', inst.offset, false);
		}
		break;
		case "ld": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "u64", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_D', inst.offset, false);
		}
		break;
		case "lh": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s16", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_H', inst.offset, false);
		}
		break;
		case "lhu": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "u16", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_H', inst.offset, false);
		}
		break;
		case "lw": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s32", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_W', inst.offset, false);
		}
		break;
		case "lwl": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s32", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_D', inst.offset, false);
		}
		break;
		case "lwr": {
			line = n64Memory(inst.rt, inst.base, inst.offset-3, "s32", false);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_W', inst.offset-3, false);
		}
		break;
		case "sb": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s8", true);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_B', inst.offset, true);
		}
		break;
		case "sd": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "u64", true);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_D', inst.offset, true);
		}
		break;
		case "sh": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s16", true);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_H', inst.offset, true);
		}
		break;
		case "sw": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s32", true);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_W', inst.offset, true);
		}
		break;
		case "swl": {
			line = n64Memory(inst.rt, inst.base, inst.offset, "s32", true);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_Wfree', inst.offset, true);
		}
		break;
		case "swr": {
			line = n64Memory(inst.rt, inst.base, inst.offset-3, "s32", true);
			//line = n64MemLoad(inst.rt, inst.base, 'N64_MEM_Wfree', inst.offset-3, true);
		}
		break;
		case "add": {
			if (inst.rd){
				line = n64binOpr(inst.rd, inst.rs, 'N64_ADD32', inst.rt, false);
			}
			else {
				let acc = '';
				if (inst.fmt == "d") acc = ".d";
				if (inst.fmt == "l") acc = ".u64";
				if (inst.fmt == "s") acc = ".fl";
				if (inst.fmt == "w") acc = ".u32l";
				line = n64fpOpr(inst.fd + acc, inst.fs + acc, '+', inst.ft + acc);
			}
		}
		break;
		case "addi": {
			line = n64binOpr(inst.rt, inst.rs, 'N64_ADDI32', inst.immediate, false);
		}
		break;
		case "addiu": {
			line = n64binOpr(inst.rt, inst.rs, 'N64_ADDI32', inst.immediate, false);
		}
		break;
		case "addu": {
			line = n64binOpr(inst.rd, inst.rs, 'N64_ADD32', inst.rt, false);
		}
		break;
		case "and": {
			line = n64binOpr(inst.rd, inst.rs, 'N64_AND', inst.rt, false);
		}
		break;
		case "andi": {
			line = n64binOpr(inst.rt, inst.rs, 'N64_ANDI', inst.immediate, false);
		}
		break;
		case "daddiu": {
			line = n64binOpr(inst.rt, inst.rs, 'N64_ADDI64', inst.immediate, false);
		}
		break;
		case "daddu": {
			line = n64binOpr(inst.rd, inst.rs, 'N64_ADD64', inst.rt, false);
		}
		break;
		case "ddiv": {
			line = n64muldiv(inst.rs, "N64_DIV", inst.rt, "int64_t");
		}
		break;
		case "ddivu": {
			line = n64muldiv(inst.rs, "N64_DIV", inst.rt, "uint64_t");
		}
		break;
		case "div": {
			if (inst.rd){
				line = n64muldiv(inst.rs, "N64_DIV", inst.rt, "int32_t");
			}
			else {
				let acc = '';
				if (inst.fmt == "d") acc = ".d";
				if (inst.fmt == "l") acc = ".u64";
				if (inst.fmt == "s") acc = ".fl";
				if (inst.fmt == "w") acc = ".u32l";
				line = n64fpOpr(inst.fd + acc, inst.fs + acc, '/', inst.ft + acc);
			}
		}
		break;
		case "divu": {
			line = n64muldiv(inst.rs, "N64_DIV", inst.rt, "uint32_t");
		}
		break;
		case "dmultu": {
			line = n64muldiv(inst.rs, "N64_MUL64", inst.rt, "uint32_t");
		}
		break;
		case "dsll": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SL', inst.sa, false);
		}
		break;
		case "dsll32": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SL', inst.sa+32, false);
		}
		break;
		case "dsllv": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SL', inst.rt, false);
		}
		break;
		case "dsra": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SRA', inst.sa, false);
		}
		break;
		case "dsra32": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SRA', inst.sa+32, false);
		}
		break;
		case "dsrav": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SRA', inst.rt, false);
		}
		break;
		case "dsrl": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SR', inst.sa, false);
		}
		break;
		case "dsrl32": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SR', inst.sa+32, false);
		}
		break;
		case "dsrlv": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SR', inst.rt, false);
		}
		break;
		case "lui": {
			line = n64unOpr(inst.rt, inst.immediate, 'N64_LUI');
		}
		break;
		case "mfhi": {
			line = n64attrib(inst.rd, "hi");
		}
		break;
		case "mflo": {
			line = n64attrib(inst.rd, "lo");
		}
		break;
		case "mthi": {
			line = n64attrib("hi", inst.rd);
		}
		break;
		case "mtlo": {
			line = n64attrib("lo", inst.rd);
		}
		break;
		case "multu": {
			line = n64muldiv(inst.rs, "N64_MUL32", inst.rt, "uint32_t");
		}
		break;
		case "nor": {
			line = n64binOpr(inst.rd, inst.rs, 'N64_NOR', inst.rt, false);
		}
		break;
		case "or": {
			line = n64binOpr(inst.rd, inst.rs, 'N64_OR', inst.rt, false);
		}
		break;
		case "ori": {
			line = n64binOpr(inst.rt, inst.rs, 'N64_ORI', inst.immediate, false);
		}
		break;
		case "sll": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SL32', inst.sa, false);
		}
		break;
		case "sllv": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SL32', inst.rs, false);
		}
		break;
		case "slt": {
			line = n64slt(inst.rd, inst.rs, inst.rt, 'int64_t');
		}
		break;
		case "slti": {
			line = n64slt(inst.rt, inst.rs, inst.immediate, 'int64_t');
		}
		break;
		case "sltiu": {
			line = n64slt(inst.rt, inst.rs, inst.immediate, 'uint64_t');
		}
		break;
		case "sltu": {
			line = n64slt(inst.rd, inst.rs, inst.rt, 'uint64_t');
		}
		break;
		case "sra": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SRA32', inst.sa, false);
		}
		break;
		case "srav": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SRA32', inst.rs, false);
		}
		break;
		case "srl": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SR32', inst.sa, false);
		}
		break;
		case "srlv": {
			line = n64binOpr(inst.rd, inst.rt, 'N64_SR32', inst.rs, false);
		}
		break;
		case "sub": {
			if (inst.rd){
				line = n64binOpr(inst.rd, inst.rs, 'N64_SUB32', inst.rt, false);
			}
			else {
				let acc = '';
				if (inst.fmt == "d") acc = ".d";
				if (inst.fmt == "l") acc = ".u64";
				if (inst.fmt == "s") acc = ".fl";
				if (inst.fmt == "w") acc = ".u32l";
				line = n64fpOpr(inst.fd + acc, inst.fs + acc, '-', inst.ft + acc);
			}
		}
		break;
		case "subu": {
			line = n64binOpr(inst.rd, inst.rs, 'N64_SUB32', inst.rt, false);
		}
		break;
		case "xor": {
			line = n64binOpr(inst.rd, inst.rs, 'N64_XOR', inst.rt, false);
		}
		break;
		case "xori": {
			line = n64binOpr(inst.rt, inst.rs, 'N64_XORI', inst.immediate, false);
		}
		break;
		case "beq": {
			line = n64branchTest(inst.rs, "==", inst.rt);
			instr_delay_copies = 2;
		}
		break;
		case "beql": {
			line = n64branchTest(inst.rs, "==", inst.rt);
			instr_delay_copies = 1;
		}
		break;
		case "bgez": {
			line = n64branchTest(inst.rs, ">=", 0);
			instr_delay_copies = 2;
		}
		break;
		case "bgezl": {
			line = n64branchTest(inst.rs, ">=", 0);
			instr_delay_copies = 1;
		}
		break;
		case "bgtz": {
			line = n64branchTest(inst.rs, ">", 0);
			instr_delay_copies = 2;
		}
		break;
		case "bgtzl": {
			line = n64branchTest(inst.rs, ">", 0);
			instr_delay_copies = 1;
		}
		break;
		case "blez": {
			line = n64branchTest(inst.rs, "<=", 0);
			instr_delay_copies = 2;
		}
		break;
		case "blezl": {
			line = n64branchTest(inst.rs, "<=", 0);
			instr_delay_copies = 1;
		}
		break;
		case "bltz": {
			line = n64branchTest(inst.rs, "<", 0);
			instr_delay_copies = 2;
		}
		break;
		case "bltzl": {
			line = n64branchTest(inst.rs, "<", 0);
			instr_delay_copies = 1;
		}
		break;
		case "bne": {
			line = n64branchTest(inst.rs, "!=", inst.rt);
			instr_delay_copies = 2;
		}
		break;
		case "bnel": {
			line = n64branchTest(inst.rs, "!=", inst.rt);
			instr_delay_copies = 1;
		}
		break;
		case "j": {
			line = "if (TRUE){";
			instr_delay_copies = 2;
			
			let lsym = n64FindSymById(ctx, inst.instr, N64_SYM_LABEL);
			if (lsym._func == ctx._cur_func) jump_line = "goto " + lsym.name + "; // "+instruction;
			else {
				let fsym = n64FindSymById(ctx, inst.instr, N64_SYM_FUNCTION);
				jump_line = (fsym.name + "(ctx); // "+instruction);
			}
		}
		break;
		case "jal": {
			line = "if (TRUE){ " + n64attrib("ra", ctx.position + 8);
			instr_delay_copies = 2;
			
			let sym = n64FindSymById(ctx, inst.instr, N64_SYM_FUNCTION);
			jump_line = (sym.name + "(ctx)");
		}
		break;
		case "jalr": {
			line = "if (TRUE){ " + n64attrib(inst.rd, ctx.position + 8);
			instr_delay_copies = 2;
			
			if (inst.rs == 'ra') jump_line = "return";
			else {
				let const_addr = n64jrConstReg(ctx, input, inst.rs);
				if (const_addr) {
					let sym = n64FindSymById(ctx, const_addr, N64_SYM_FUNCTION);
					jump_line = (sym.name + "(ctx)");
				}
				else {
					jump_line = "n64CallVirtualFunction(ctx->"+inst.rs+")";
				}
			}
		}
		break;
		case "jr": {
			line = "if (TRUE){";
			instr_delay_copies = 2;
			
			if (inst.rs == 'ra') jump_line = "return";
			else {
				let const_addr = n64jrConstReg(ctx, input, inst.rs);
				if (const_addr) {
					let sym = n64FindSymById(ctx, const_addr, N64_SYM_FUNCTION);
					jump_line = (sym.name + "(ctx)") + "; return";
				}
				else {
					jump_line = "n64CallVirtualFunction(ctx->"+inst.rs+"); return";
				}
			}
		}
		break;
		case "break": {
			line = "n64BreakCall(0x"+hex(inst.offset)+")";
		}
		break;
		case "mfc0": {
			line = n64attrib(inst.rt, inst.fs);
		}
		break;
		case "mtc0": {
			line = n64attrib(inst.fs, inst.rt);
		}
		break;
		case "bc1f": {
			line = n64branchTest("fcondcode", "==", 0, "_Bool");
			instr_delay_copies = 2;
		}
		break;
		case "bc1fl": {
			line = n64branchTest("fcondcode", "==", 0, "_Bool");
			instr_delay_copies = 1;
		}
		break;
		case "bc1t": {
			line = n64branchTest("fcondcode", "==", 1, "_Bool");
			instr_delay_copies = 2;
		}
		break;
		case "bc1tl": {
			line = n64branchTest("fcondcode", "==", 1, "_Bool");
			instr_delay_copies = 1;
		}
		break;
		case "c": {
			let fmt = '';
			if (inst.fmt == "d") fmt = ".d";
			if (inst.fmt == "l") fmt = ".u64";
			if (inst.fmt == "s") fmt = ".fl";
			if (inst.fmt == "w") fmt = ".u32l";
			let op1 = inst.fs + fmt; let op2 = "ctx->" + inst.ft + fmt;
			let test = "";
			switch (inst.cond){
				case "f": { test = "FALSE"; } break;
				case "un": { test = "FALSE"; } break;
				case "eq": { test = op1 + " == " + op2; } break;
				case "ueq": { test = op1 + " == " + op2; } break;
				case "olt": { test = op1 + " < " + op2; } break;
				case "ult": { test = op1 + " < " + op2; } break;
				case "ole": { test = op1 + " <= " + op2; } break;
				case "ule": { test = op1 + " <= " + op2; } break;
				case "sf": { test = "(" + op1 + " <= 0 && " + op2 + " >= 0) || (" + op1 + " >= 0 && " + op2 + " <= 0)"; } break;
				case "ngle": { test = op1 + " <= " + op2; } break;
				case "seq": { test = "(" + op1 + " <= 0 && " + op2 + " <= 0) || (" + op1 + " >= 0 && " + op2 + " >= 0)"; } break;
				case "ngl": { test = op1 + " < " + op2; } break;
				case "lt": { test = op1 + " < " + op2; } break;
				case "nge": { test = op1 + " == " + op2; } break;
				case "le": { test = op1 + " <= " + op2; } break;
				case "ngt": { test = op1 + " <= " + op2; } break;
			}
			line = n64attrib("fcondcode", test);
		}
		break;
		case "cfc1": {
			line = n64attrib(inst.rt, inst.fs+".u64");
		}
		break;
		case "ctc1": {
			line = n64attrib(inst.fs+".u64", inst.rt);
		}
		break;
		case "cvt.d":
		case "cvt.l":
		case "cvt.s":
		case "cvt.w": {
			let dest = inst.fd;
			if (inst.r.mnemonic == "cvt.d") dest = dest+".d";
			if (inst.r.mnemonic == "cvt.l") dest = dest+".u64";
			if (inst.r.mnemonic == "cvt.s") dest = dest+".fl";
			if (inst.r.mnemonic == "cvt.w") dest = dest+".u32l";
			let src = inst.fs;
			if (inst.fmt == "d") src = src+".d";
			if (inst.fmt == "l") src = src+".u64";
			if (inst.fmt == "s") src = src+".fl";
			if (inst.fmt == "w") src = src+".u32l";
			line = n64attrib(dest, src);
		}
		break;
		case "dmfc1": {
			line = n64attrib(inst.rt, inst.fs + ".u64");
		}
		break;
		case "dmtc1": {
			line = n64attrib(inst.fs + ".u64", inst.rt);
		}
		break;
		case "ldc1": {
			line = n64Memory(inst.ft, inst.base, inst.offset, "f64", false);
			//line = n64MemLoad(inst.ft+".d", inst.base, '*(double*)&N64_MEM_D', inst.offset, false);
		}
		break;
		case "lwc1": {
			line = n64Memory(inst.ft, inst.base, inst.offset, "f32", false);
			//line = n64MemLoad(inst.ft+".fl", inst.base, '*(float*)&N64_MEM_W', inst.offset, false);
		}
		break;
		case "mfc1": {
			line = n64attrib(inst.rt, inst.fs+".fl");
		}
		break;
		case "mov": {
			let fmt = inst.fs;
			if (inst.fmt == "d") fmt = ".d";
			if (inst.fmt == "l") fmt = ".u64";
			if (inst.fmt == "s") fmt = ".fl";
			if (inst.fmt == "w") fmt = ".u32l";
			line = n64attrib(inst.fd + fmt, inst.fs + fmt);
		}
		break;
		case "mtc1": {
			line = n64attrib(inst.fs+".fl", inst.rt);
		}
		break;
		case "mul": {
			let acc = '';
			if (inst.fmt == "d") acc = ".d";
			if (inst.fmt == "l") acc = ".u64";
			if (inst.fmt == "s") acc = ".fl";
			if (inst.fmt == "w") acc = ".u32l";
			line = n64fpOpr(inst.fd + acc, inst.fs + acc, '*', inst.ft + acc);
		}
		break;
		case "neg": {
			let acc = '';
			if (inst.fmt == "d") acc = ".d";
			if (inst.fmt == "l") acc = ".u64";
			if (inst.fmt == "s") acc = ".fl";
			if (inst.fmt == "w") acc = ".u32l";
			line = n64unOpr(inst.fd + acc, inst.fs + acc, '-');
		}
		break;
		case "round.l":
		case "round.w": {
			let src = "ctx->"+inst.fs;
			if (inst.fmt == "d") src = src+".d";
			if (inst.fmt == "l") src = src+".u64";
			if (inst.fmt == "s") src = src+".fl";
			if (inst.fmt == "w") src = src+".u32l";
			let dest = inst.fd;
			if (inst.r.mnemonic == "round.l") line = "ctx->" + dest + ".u64 = round(" + src + ")";
			if (inst.r.mnemonic == "round.w") line = "ctx->" + dest + ".u32l = round(" + src + ")";
		}
		break;
		case "sdc1": {
			line = n64Memory(inst.ft, inst.base, inst.offset, "f64", true);
			//line = n64MemLoad(inst.ft+".d", inst.base, '*(double*)&N64_MEM_D', inst.offset, true);
		}
		break;
		case "sqrt": {
			let dest = inst.fd;
			let src = inst.fs;
			if (inst.fmt == "d") { dest = dest + ".d"; src = src + ".d"; }
			if (inst.fmt == "s") { dest = dest + ".fl"; src = src + ".fl"; }
			if (inst.r.mnemonic == "round.l") line = "ctx->" + dest + " = sqrt(" + src + ")";
			if (inst.r.mnemonic == "round.w") line = "ctx->" + dest + " = sqrt(" + src + ")";
		}
		break;
		case "swc1": {
			line = n64Memory(inst.ft, inst.base, inst.offset, "f32", true);
			//line = n64MemLoad(inst.ft+".fl", inst.base, '*(float*)&N64_MEM_W', inst.offset, true);
		}
		break;
		case "trunc.l":
		case "trunc.w": {
			let dest = inst.fd;
			if (inst.r.mnemonic == "trunc.l") dest = dest+".u64";
			if (inst.r.mnemonic == "trunc.w") dest = dest+".u32l";
			let src = inst.fs;
			if (inst.fmt == "d") src = src+".d";
			if (inst.fmt == "l") src = src+".u64";
			if (inst.fmt == "s") src = src+".fl";
			if (inst.fmt == "w") src = src+".u32l";
			line = n64attrib(dest, src);
		}
		break;
		default: {
			if (inst.r.mnemonic != 'nop') console.log("Unparsed: ", inst.r.mnemonic);
			line = ("// " + instruction + "");
		}
	}
	
	if (instr_delay_copies){
		n64JumpCondProcess(ctx, inst, input, output, instr_delay_copies, line, jump_line);
		return null;
	}
	
	return line;
}

function n64JumpCondProcess(ctx, inst, input, output, delay_inst_copies, cond_line, jump_line=null) {
	let adr = inst.offset;
	n64CLine(ctx, inst, cond_line, output);
	ctx.position += 4;
	let opcode = input.read32();
	inst = n64DisasmSingle(ctx, opcode);
	let line = n64InstructionLineToC(ctx, inst, input, output, 0);
	n64CLine(ctx, inst, line, output, 2, delay_inst_copies == 2);
	
	output.writeString("                                                \t");
	if (jump_line) {
		output.writeString(jump_line);
	}
	else {
		let sym = n64FindSymById(ctx, adr, N64_SYM_LABEL);
		if (sym._func == ctx._cur_func) output.writeString("goto " + sym.name);
		else output.writeString("n64CallVirtualFunction(0x" + hex(sym.data) + "); // goto " + sym.name);
	}
	output.writeString(";\n");
	output.writeString("\t                                              }");
	if (delay_inst_copies == 2){
		output.writeString(" else {\n");
		n64CLine(ctx, inst, line, output, 2);
		output.writeString("\t                                              }\n");
	}
	else {
		output.writeString("\n");
	}
}

function n64CLine(ctx, instr, line, output, level = 1, skip_label = false) {
	if (line != null) {
		let lsym = null;
		let adr = ctx.position;
		if ((lsym = n64FindSymById(ctx, adr, N64_SYM_LABEL)) && !skip_label) output.writeString("                     " + (level == 2? '\t': '') + lsym.name + ":\n");
		n64LineInit(ctx, output, instr);
		output.writeString(" " + (level == 2? '\t': '') + line + ";\n");
	}
}

function n64LineInit(ctx, output, instr, tmp_rp=0) {
	ctx.position += tmp_rp;
	output.writeString("\tBRK( 0x" + hex(ctx.position, 8) + ", \"" + n64InstructionToString(ctx, instr).padEnd(24, " ").toUpperCase() + "\" )");
	//output.writeString("\t/* 0x" + hex(ctx.position, 8) + " */");
	ctx.position -= tmp_rp;
}

function n64DisasmAt(ctx, input, offset = 0) {
	let rel = input.tell();
	input.seekCur(offset);
	rel = input.tell() - rel;
	ctx.position += rel;
	let opcode = input.read32();
	let inst = n64DisasmSingle(ctx, opcode);
	ctx.position -= rel;
	input.seekCur(-rel-4);
	return inst;
}

/*
	Main procedure for a sequence of binary instructions conversion
*/

function n64ToC(ctx, functions, input, output) {
	if (input.size()&3) {
		printf("Stream length should be multiple of 4 bytes");
		return 0;
	}
	input.seekSet(0);
	ctx.position = ctx.ram_address;
	let c_func = 0;
	let cur_func = null;
	while (ctx.position > functions[c_func].offset) c_func++;
	
	while (!input.eof()){
		let opcode = input.read32();
		let inst = n64DisasmSingle(ctx, opcode);
		
		// Function opening
		if (cur_func != functions[c_func]) {
			output.writeString("\nvoid "+functions[c_func].name+"(n64ctx_t *ctx){\n");
			ctx._cur_func = cur_func = functions[c_func];
		}
		
		// Instruction to C line
		let line = n64InstructionLineToC(ctx, inst, input, output, 0);
		n64CLine(ctx, inst, line, output);
		ctx.position += 4;
		
		// Function closing
		if ((functions[c_func+1]? ctx.position >= functions[c_func+1].offset: false) || input.eof()) {
			output.writeString("}\n");
			c_func++;
		}
	}
}
