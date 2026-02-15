
// N64 Instruction Formats
const N64_FMT__ = 0;
const N64_FMT_RT_OFFSET_BASE = 1;
const N64_FMT_RD_RS_RT = 2;
const N64_FMT_RT_RS_IMMEDIATE = 3;
const N64_FMT_RS_RT = 4;
const N64_FMT_RD_RT_SA = 5;
const N64_FMT_RD_RT_RS = 6;
const N64_FMT_RT_IMMEDIATE = 7;
const N64_FMT_RD = 8;
const N64_FMT_RS = 9;
const N64_FMT_RS_RT_OFFSET = 10;
const N64_FMT_RS_OFFSET = 11;
const N64_FMT_TARGET = 12;
const N64_FMT_RD_RS = 13;
const N64_FMT_OFFSET = 14;
const N64_FMT_RS_IMMEDIATE = 15;
const N64_FMT_OP_OFFSET_BASE = 16;
const N64_FMT_RT_RD = 17;
const N64_FMT_FMT_FD_FS = 18;
const N64_FMT_COND_FMT_FS_FT = 19;
const N64_FMT_RT_FS = 20;
const N64_FMT_FMT_FD_FS_FT = 21;
const N64_FMT_FT_OFFSET_BASE = 22;

// N64 Encode Operands
const ENC64_CO = 0;
const ENC64_BASE = 1;
const ENC64_RS_21 = 2;
const ENC64_RS_6 = 3;
const ENC64_RT = 4;
const ENC64_OP = 5;
const ENC64_RD = 6;
const ENC64_SBFUNC_0 = 7;
const ENC64_SBFUNC_16 = 8;
const ENC64_SBFUNC_21 = 9;
const ENC64_STYPE = 10;
const ENC64_SA = 11;
const ENC64_CODE_20 = 12;
const ENC64_CODE_10 = 13;
const ENC64_OFFSET = 14;
const ENC64_IMMEDIATE = 15;
const ENC64_INSTR = 16;
const ENC64_FMT = 17;
const ENC64_FNDTF = 18;
const ENC64_FT = 19;
const ENC64_FS = 20;
const ENC64_FD = 21;
const ENC64_CCOND_SBFUNC = 22;
const ENC64_COND = 23;
const ENC64___ = 24;
const ENC64__END__ = 25;

const N64_NO_SUBFUNC = 0;
const N64_MAX_REG = 32;
const N64_ALL_INST = 152;

const N64_NO_IFLAG = 0;
const N64_IFLAG_JUMP_INSTRUCTION = 1;
const N64_IFLAG_CO0 = 2;
const N64_IFLAG_ISIGNED = 4;
const N64_IFLAG_ITRIM = 8;

const n64_cpu_regs = [
	"r0",
	"at",
	"v0",
	"v1",
	"a0",
	"a1",
	"a2",
	"a3",
	"t0",
	"t1",
	"t2",
	"t3",
	"t4",
	"t5",
	"t6",
	"t7",
	"s0",
	"s1",
	"s2",
	"s3",
	"s4",
	"s5",
	"s6",
	"s7",
	"t8",
	"t9",
	"k0",
	"k1",
	"gp",
	"sp",
	"fp",
	"ra",
];

const n64_cp0_regs = [
	"Index",
	"Random",
	"EntryLo0",
	"EntryLo1",
	"Context",
	"PageMask",
	"Wired",
	"Reg7",
	"BadVAddr",
	"Count",
	"EntryHi",
	"Compare",
	"Status",
	"Cause",
	"EPC",
	"PRevID",
	"Config",
	"LLAddr",
	"WatchLo",
	"WatchHI",
	"XContext",
	"Reg21",
	"Reg22",
	"Reg23",
	"Reg24",
	"Reg25",
	"PErr",
	"CacheErr",
	"TagLo",
	"TagHi",
	"ErrorEPC",
	"Reg31",
];

const n64_fpr_regs = [
	"f0",
	"f1",
	"f2",
	"f3",
	"f4",
	"f5",
	"f6",
	"f7",
	"f8",
	"f9",
	"f10",
	"f11",
	"f12",
	"f13",
	"f14",
	"f15",
	"f16",
	"f17",
	"f18",
	"f19",
	"f20",
	"f21",
	"f22",
	"f23",
	"f24",
	"f25",
	"f26",
	"f27",
	"f28",
	"f29",
	"f30",
	"f31",
];

const n64_fcmp_cond = [
	"f",
	"un",
	"eq",
	"ueq",
	"olt",
	"ult",
	"ole",
	"ule",
	"sf",
	"ngle",
	"seq",
	"ngl",
	"lt",
	"nge",
	"le",
	"ngt",
];

const n64_enc_off = [
	25, // ENC64_CO,
	21, // ENC64_BASE,
	21, // ENC64_RS_21,
	6, // ENC64_RS_6,
	16, // ENC64_RT,
	16, // ENC64_OP,
	11, // ENC64_RD,
	0, // ENC64_SBFUNC_0,
	16, // ENC64_SBFUNC_16,
	21, // ENC64_SBFUNC_21,
	6, // ENC64_STYPE,
	6, // ENC64_SA,
	6, // ENC64_CODE_20,
	6, // ENC64_CODE_10,
	0, // ENC64_OFFSET,
	0, // ENC64_IMMEDIATE,
	0, // ENC64_INSTR,
	21, // ENC64_FMT,
	16, // ENC64_FNDTF,
	16, // ENC64_FT,
	11, // ENC64_FS,
	6, // ENC64_FD,
	4, // ENC64_CCOND_SBFUNC,
	0, // ENC64_COND,
	0, // ENC64___,
	// ENC64__END__,
];

const n64_enc_mask = [
	1, // ENC64_CO,
	0x1F, // ENC64_BASE,
	0x1F, // ENC64_RS_21,
	0x1F, // ENC64_RS_6,
	0x1F, // ENC64_RT,
	0x1F, // ENC64_OP,
	0x1F, // ENC64_RD,
	0x3F, // ENC64_SBFUNC_0,
	0x1F, // ENC64_SBFUNC_16,
	0x1F, // ENC64_SBFUNC_21,
	0x1F, // ENC64_STYPE,
	0x1F, // ENC64_SA,
	0xFFFFF, // ENC64_CODE_20,
	0x3FF, // ENC64_CODE_10,
	0xFFFF, // ENC64_OFFSET,
	0xFFFF, // ENC64_IMMEDIATE,
	0x3FFFFFF, // ENC64_INSTR,
	0x1F, // ENC64_FMT,
	0x3FF, // ENC64_FNDTF,
	0x1F, // ENC64_FT,
	0x1F, // ENC64_FS,
	0x1F, // ENC64_FD,
	0x3, // ENC64_CCOND_SBFUNC,
	0xF, // ENC64_COND,
	0x3FFFFFF, // ENC64___,
	// ENC64__END__,
];

const n64_instrs = [
	{ "mnemonic": "nop", "opcode": 0, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT__, "flag": N64_NO_IFLAG, "enc": [ ENC64___, ENC64__END__ ] },
	
	// General cases
	{ "mnemonic": "lb", "opcode": 32, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lbu", "opcode": 36, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "ld", "opcode": 55, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "ldl", "opcode": 26, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "ldr", "opcode": 27, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lh", "opcode": 33, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lhu", "opcode": 37, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "ll", "opcode": 48, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lld", "opcode": 52, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lw", "opcode": 35, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lwl", "opcode": 34, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lwr", "opcode": 38, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lwu", "opcode": 39, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sb", "opcode": 40, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sc", "opcode": 56, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "scd", "opcode": 60, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sd", "opcode": 63, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sdl", "opcode": 44, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sdr", "opcode": 45, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sh", "opcode": 41, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sw", "opcode": 43, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "swl", "opcode": 42, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "swr", "opcode": 46, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sync", "opcode": 0, "subfunc": 15, "format": N64_FMT__, "flag": N64_NO_IFLAG, "enc": [ ENC64_STYPE, ENC64_SBFUNC_0, ENC64__END__ ] },
	
	{ "mnemonic": "add", "opcode": 0, "subfunc": 32, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "addi", "opcode": 8, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_IFLAG_ISIGNED|N64_IFLAG_ITRIM, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "addiu", "opcode": 9, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_IFLAG_ISIGNED|N64_IFLAG_ITRIM, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "addu", "opcode": 0, "subfunc": 33, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "and", "opcode": 0, "subfunc": 36, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "andi", "opcode": 12, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "dadd", "opcode": 0, "subfunc": 44, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "daddi", "opcode": 24, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "daddiu", "opcode": 25, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "daddu", "opcode": 0, "subfunc": 45, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "ddiv", "opcode": 0, "subfunc": 30, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "ddivu", "opcode": 0, "subfunc": 31, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "div", "opcode": 0, "subfunc": 26, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "divu", "opcode": 0, "subfunc": 27, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dmult", "opcode": 0, "subfunc": 28, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dmultu", "opcode": 0, "subfunc": 29, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsll", "opcode": 0, "subfunc": 56, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsll32", "opcode": 0, "subfunc": 60, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsllv", "opcode": 0, "subfunc": 20, "format": N64_FMT_RD_RT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsra", "opcode": 0, "subfunc": 59, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsra32", "opcode": 0, "subfunc": 63, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsrav", "opcode": 0, "subfunc": 23, "format": N64_FMT_RD_RT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_RS_21, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsrl", "opcode": 0, "subfunc": 58, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsrl32", "opcode": 0, "subfunc": 62, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsrlv", "opcode": 0, "subfunc": 22, "format": N64_FMT_RD_RT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsub", "opcode": 0, "subfunc": 46, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dsubu", "opcode": 0, "subfunc": 47, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "lui", "opcode": 15, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "mfhi", "opcode": 0, "subfunc": 16, "format": N64_FMT_RD, "flag": N64_NO_IFLAG, "enc": [ ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "mflo", "opcode": 0, "subfunc": 18, "format": N64_FMT_RD, "flag": N64_NO_IFLAG, "enc": [ ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "mthi", "opcode": 0, "subfunc": 17, "format": N64_FMT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "mtlo", "opcode": 0, "subfunc": 19, "format": N64_FMT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "mult", "opcode": 0, "subfunc": 24, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "multu", "opcode": 0, "subfunc": 25, "format": N64_FMT_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "nor", "opcode": 0, "subfunc": 39, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "or", "opcode": 0, "subfunc": 37, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "ori", "opcode": 13, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "sll", "opcode": 0, "subfunc": 0, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "sllv", "opcode": 0, "subfunc": 4, "format": N64_FMT_RD_RT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "slt", "opcode": 0, "subfunc": 42, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "slti", "opcode": 10, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "sltiu", "opcode": 11, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "sltu", "opcode": 0, "subfunc": 43, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "sra", "opcode": 0, "subfunc": 3, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "srav", "opcode": 0, "subfunc": 7, "format": N64_FMT_RD_RT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "srl", "opcode": 0, "subfunc": 2, "format": N64_FMT_RD_RT_SA, "flag": N64_NO_IFLAG, "enc": [ ENC64_RT, ENC64_RD, ENC64_SA, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "srlv", "opcode": 0, "subfunc": 6, "format": N64_FMT_RD_RT_RS, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "sub", "opcode": 0, "subfunc": 34, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "subu", "opcode": 0, "subfunc": 35, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "xor", "opcode": 0, "subfunc": 38, "format": N64_FMT_RD_RS_RT, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "xori", "opcode": 14, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RT_RS_IMMEDIATE, "flag": N64_NO_IFLAG, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_IMMEDIATE, ENC64__END__ ] },
	
	{ "mnemonic": "beq", "opcode": 4, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RS_RT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "beql", "opcode": 20, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RS_RT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bgez", "opcode": 1, "subfunc": 1, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bgezal", "opcode": 1, "subfunc": 17, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bgezall", "opcode": 1, "subfunc": 19, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bgezl", "opcode": 1, "subfunc": 3, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bgtz", "opcode": 7, "subfunc": 0, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bgtzl", "opcode": 23, "subfunc": 0, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "blez", "opcode": 6, "subfunc": 0, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "blezl", "opcode": 22, "subfunc": 0, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bltz", "opcode": 1, "subfunc": 0, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bltzal", "opcode": 1, "subfunc": 16, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bltzall", "opcode": 1, "subfunc": 18, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bltzl", "opcode": 1, "subfunc": 2, "format": N64_FMT_RS_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_16, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bne", "opcode": 5, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RS_RT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bnel", "opcode": 21, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_RS_RT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "j", "opcode": 2, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_TARGET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_INSTR, ENC64__END__ ] },
	{ "mnemonic": "jal", "opcode": 3, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_TARGET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_INSTR, ENC64__END__ ] },
	{ "mnemonic": "jalr", "opcode": 0, "subfunc": 9, "format": N64_FMT_RD_RS, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "jr", "opcode": 0, "subfunc": 8, "format": N64_FMT_RS, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_SBFUNC_0, ENC64__END__ ] },
	
	{ "mnemonic": "break", "opcode": 0, "subfunc": 13, "format": N64_FMT_OFFSET, "flag": N64_IFLAG_ITRIM, "enc": [ ENC64_CODE_20, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "syscall", "opcode": 0, "subfunc": 12, "format": N64_FMT_OFFSET, "flag": N64_IFLAG_ITRIM, "enc": [ ENC64_CODE_20, ENC64_SBFUNC_0, ENC64__END__ ] },
	
	{ "mnemonic": "teq", "opcode": 0, "subfunc": 52, "format": N64_FMT_RS_RT, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_CODE_10, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "teqi", "opcode": 1, "subfunc": 12, "format": N64_FMT_RS_IMMEDIATE, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "tge", "opcode": 0, "subfunc": 48, "format": N64_FMT_RS_RT, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_CODE_10, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tgei", "opcode": 1, "subfunc": 8, "format": N64_FMT_RS_IMMEDIATE, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "tgeiu", "opcode": 1, "subfunc": 9, "format": N64_FMT_RS_IMMEDIATE, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "tgeu", "opcode": 0, "subfunc": 49, "format": N64_FMT_RS_RT, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_CODE_10, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tlt", "opcode": 0, "subfunc": 50, "format": N64_FMT_RS_RT, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_CODE_10, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tlti", "opcode": 1, "subfunc": 10, "format": N64_FMT_RS_IMMEDIATE, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "tltiu", "opcode": 1, "subfunc": 11, "format": N64_FMT_RS_IMMEDIATE, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_IMMEDIATE, ENC64__END__ ] },
	{ "mnemonic": "tltu", "opcode": 0, "subfunc": 51, "format": N64_FMT_RS_RT, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_CODE_10, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tne", "opcode": 0, "subfunc": 54, "format": N64_FMT_RS_RT, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_RT, ENC64_CODE_10, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tnei", "opcode": 1, "subfunc": 14, "format": N64_FMT_RS_IMMEDIATE, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_RS_21, ENC64_IMMEDIATE, ENC64__END__ ] },
	
	{ "mnemonic": "cache", "opcode": 47, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_OP_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_OP, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "eret", "opcode": 16, "subfunc": 24, "format": N64_FMT__, "flag": N64_NO_IFLAG, "enc": [ ENC64_CO, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "mfc0", "opcode": 16, "subfunc": 0, "format": N64_FMT_RT_FS, "flag": N64_IFLAG_CO0, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "mtc0", "opcode": 16, "subfunc": 4, "format": N64_FMT_RT_FS, "flag": N64_IFLAG_CO0, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "tlbp", "opcode": 16, "subfunc": 8, "format": N64_FMT__, "flag": N64_NO_IFLAG, "enc": [ ENC64_CO, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tlbr", "opcode": 16, "subfunc": 1, "format": N64_FMT__, "flag": N64_NO_IFLAG, "enc": [ ENC64_CO, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tlbwi", "opcode": 16, "subfunc": 2, "format": N64_FMT__, "flag": N64_NO_IFLAG, "enc": [ ENC64_CO, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "tlbwr", "opcode": 16, "subfunc": 6, "format": N64_FMT__, "flag": N64_NO_IFLAG, "enc": [ ENC64_CO, ENC64_SBFUNC_0, ENC64__END__ ] },
	
	{ "mnemonic": "abs", "opcode": 17, "subfunc": 5, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "add", "opcode": 17, "subfunc": 0, "format": N64_FMT_FMT_FD_FS_FT, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "bc1f", "opcode": 17, "subfunc": 256, "format": N64_FMT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_FNDTF, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bc1fl", "opcode": 17, "subfunc": 258, "format": N64_FMT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_FNDTF, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bc1t", "opcode": 17, "subfunc": 257, "format": N64_FMT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_FNDTF, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "bc1tl", "opcode": 17, "subfunc": 259, "format": N64_FMT_OFFSET, "flag": N64_IFLAG_JUMP_INSTRUCTION, "enc": [ ENC64_FNDTF, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "c", "opcode": 17, "subfunc": 3, "format": N64_FMT_COND_FMT_FS_FT, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FT, ENC64_FS, ENC64_CCOND_SBFUNC, ENC64_COND, ENC64__END__ ] },
	{ "mnemonic": "ceil.l", "opcode": 17, "subfunc": 10, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "ceil.w", "opcode": 17, "subfunc": 14, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "cfc1", "opcode": 17, "subfunc": 2, "format": N64_FMT_RT_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "ctc1", "opcode": 17, "subfunc": 6, "format": N64_FMT_RT_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "cvt.d", "opcode": 17, "subfunc": 33, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "cvt.l", "opcode": 17, "subfunc": 37, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "cvt.s", "opcode": 17, "subfunc": 32, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "cvt.w", "opcode": 17, "subfunc": 36, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "div", "opcode": 17, "subfunc": 3, "format": N64_FMT_FMT_FD_FS_FT, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "dmfc1", "opcode": 17, "subfunc": 1, "format": N64_FMT_RT_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "dmtc1", "opcode": 17, "subfunc": 5, "format": N64_FMT_RT_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "floor.l", "opcode": 17, "subfunc": 11, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "floor.w", "opcode": 17, "subfunc": 15, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "ldc1", "opcode": 53, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_FT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_FT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "lwc1", "opcode": 49, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_FT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_FT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "mfc1", "opcode": 17, "subfunc": 0, "format": N64_FMT_RT_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "mov", "opcode": 17, "subfunc": 6, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "mtc1", "opcode": 17, "subfunc": 4, "format": N64_FMT_RT_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_SBFUNC_21, ENC64_RT, ENC64_FS, ENC64__END__ ] },
	{ "mnemonic": "mul", "opcode": 17, "subfunc": 2, "format": N64_FMT_FMT_FD_FS_FT, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "neg", "opcode": 17, "subfunc": 7, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "round.l", "opcode": 17, "subfunc": 8, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "round.w", "opcode": 17, "subfunc": 12, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "sdc1", "opcode": 61, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_FT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_FT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "sqrt", "opcode": 17, "subfunc": 4, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "sub", "opcode": 17, "subfunc": 1, "format": N64_FMT_FMT_FD_FS_FT, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "swc1", "opcode": 57, "subfunc": N64_NO_SUBFUNC, "format": N64_FMT_FT_OFFSET_BASE, "flag": N64_NO_IFLAG, "enc": [ ENC64_BASE, ENC64_FT, ENC64_OFFSET, ENC64__END__ ] },
	{ "mnemonic": "trunc.l", "opcode": 17, "subfunc": 9, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
	{ "mnemonic": "trunc.w", "opcode": 17, "subfunc": 13, "format": N64_FMT_FMT_FD_FS, "flag": N64_NO_IFLAG, "enc": [ ENC64_FMT, ENC64_FS, ENC64_FD, ENC64_SBFUNC_0, ENC64__END__ ] },
];