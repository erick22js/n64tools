#ifndef N64_SYMBOLS_H
#define N64_SYMBOLS_H

#include "util.h"


typedef struct {
	const char* mne_name;
} N64Reg;

typedef enum {
	N64_FMT__,
	N64_FMT_RT_OFFSET_BASE,
	N64_FMT_RD_RS_RT,
	N64_FMT_RT_RS_IMMEDIATE,
	N64_FMT_RS_RT,
	N64_FMT_RD_RT_SA,
	N64_FMT_RD_RT_RS,
	N64_FMT_RT_IMMEDIATE,
	N64_FMT_RD,
	N64_FMT_RS,
	N64_FMT_RS_RT_OFFSET,
	N64_FMT_RS_OFFSET,
	N64_FMT_TARGET,
	N64_FMT_RD_RS,
	N64_FMT_OFFSET,
	N64_FMT_RS_IMMEDIATE,
	N64_FMT_OP_OFFSET_BASE,
	N64_FMT_RT_RD,
	N64_FMT_FMT_FD_FS,
	N64_FMT_COND_FMT_FS_FT,
	N64_FMT_RT_FS,
	N64_FMT_FMT_FD_FS_FT,
	N64_FMT_FT_OFFSET_BASE,
} N64InstFormat;

typedef enum {
	ENC64_CO,
	ENC64_BASE,
	ENC64_RS_21,
	ENC64_RS_6,
	ENC64_RT,
	ENC64_OP,
	ENC64_RD,
	ENC64_SBFUNC_0,
	ENC64_SBFUNC_16,
	ENC64_SBFUNC_21,
	ENC64_STYPE,
	ENC64_SA,
	ENC64_CODE_20,
	ENC64_CODE_10,
	ENC64_OFFSET,
	ENC64_IMMEDIATE,
	ENC64_INSTR,
	ENC64_FMT,
	ENC64_FNDTF,
	ENC64_FT,
	ENC64_FS,
	ENC64_FD,
	ENC64_CCOND_SBFUNC,
	ENC64_COND,
	ENC64__END__,
} N64EncOprs;

typedef struct {
	const char* mnemonic;
	u8 opcode;
	u32 subfunc;
	N64InstFormat format;
	bool flag;
	N64EncOprs enc[8];
} N64Inst;

#define N64_MAX_REG 32
#define N64_ALL_INST 152

#define N64_NO_IFLAG 0
#define N64_IFLAG_JUMP_INSTRUCTION 1
#define N64_IFLAG_CO0 2
#define N64_IFLAG_ISIGNED 4
#define N64_IFLAG_ITRIM 8

extern N64Reg n64_cpu_regs[];
extern N64Reg n64_cp0_regs[];
extern N64Reg n64_fpr_regs[];
extern const char* (n64_fcmp_cond[]);
extern u32 n64_enc_off[];
extern u32 n64_enc_mask[];
extern N64Inst n64_instrs[];


#endif