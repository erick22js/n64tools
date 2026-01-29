#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "util/goldutils.h"


// ROM DATA
static struct {
	u8 data[1024*1024*64];
	u8 mod_data[1024*1024*64];
	u32 size;
} rom;

int loadRom(char* path) {
	FILE *romf = fopen(path, "rb");
	if (!romf){
		printf("Could not load the ROM '%s' properly.\n", path);
		return 1;
	}
	fseek(romf, 0, SEEK_END);
	rom.size = ftell(romf);
	fseek(romf, 0, SEEK_SET);
	fread(rom.data, 1, rom.size, romf);
	fclose(romf);
	return 0;
}


// SEGMENTS
typedef enum {
	SEG_HEADER,
	//SEG_BOOT_CODE,
	SEG_CODE1,
	SEG_CODE2,
	SEG_CODE3,
	SEG__TYPES_COUNT__
} SegmentType;
typedef struct {
	const char name[32];
	SegmentType type;
	u32 in_rom_offset;
	u32 in_rom_length;
	u8 raw_data[1024*1024*8];
	u32 raw_length;
	u8 zip_data[1024*1024*8];
	u32 zip_length;
} Segment;
Segment segs[SEG__TYPES_COUNT__] = {
	{ "header", SEG_HEADER, 0x0, 0x40 },
	//{ "boot_code", SEG_BOOT_CODE, 0x40, 0xFC0 },
	{ "code1", SEG_CODE1, 0x1000, 0x20990 }, // mapped to 0x70000400
	{ "code2", SEG_CODE2, 0x33590, 0x15A0 }, // RareZip, mapped to 0x70200000...0x70201474
	{ "code3", SEG_CODE3, 0x34B30, 0xE2D50 }, // mapped to 0x7F000000
};

int ripSegments(){
	for (int s = 0; s < SEG__TYPES_COUNT__; s++){
		char out_path[256]; sprintf(out_path, "D:/documentos/meus-projetos/misc/n64tools/gekit/_data/out/%s.bin", segs[s].name);
		FILE *out = fopen(out_path, "wb");
		fwrite(rom.data + segs[s].in_rom_offset, 1, segs[s].in_rom_length, out);
		fclose(out);
	}
}
