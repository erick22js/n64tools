#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "util/goldutils.h"
#include "zip/librarezip.h"
#include "zip/puff.h"


// ROM DATA
static struct {
	u8 data[1024*1024*64];
	u8 mod_data[1024*1024*64];
	u32 size;
} rom;

// SEGMENTS
#define SEG_CORE1 0
#define SEG_CORE1_TEXT 1
#define SEG_CORE2 2
#define SEG_CORE2_TEXT 3
typedef struct {
	const char name[16];
	u32 in_rom_offset;
	u32 in_rom_length;
	u8 raw_data[1024*1024*8];
	u32 raw_length;
	u8 zip_data[1024*1024*8];
	u32 zip_length;
} Segment;
Segment segs[4] = {
	[SEG_CORE1] = { .name = "core1\0", .in_rom_offset = 0x1E2FE70, .in_rom_length = 0x15706, 0 },
	[SEG_CORE1_TEXT] = { .name = "core1text\0", .in_rom_offset = 0x1E45576, .in_rom_length = 0x2E3A, 0 },
	[SEG_CORE2] = { .name = "core2\0", .in_rom_offset = 0x1E483B0, .in_rom_length = 0x429D1, 0 },
	[SEG_CORE2_TEXT] = { .name = "core2text\0", .in_rom_offset = 0x1E8AD81, .in_rom_length = 0x2CEF, 0 },
};

// Utilities functions
void setupByRegion(char region_code) {
	if (region_code == 'E') {
		segs[SEG_CORE1].in_rom_offset = 0x1E2FE70;
		segs[SEG_CORE1].in_rom_length = 0x15706;
		segs[SEG_CORE1_TEXT].in_rom_offset = 0x1E45576;
		segs[SEG_CORE1_TEXT].in_rom_length = 0x2E3A;
		segs[SEG_CORE2].in_rom_offset = 0x1E483B0;
		segs[SEG_CORE2].in_rom_length = 0x429D1;
		segs[SEG_CORE2_TEXT].in_rom_offset = 0x1E8AD81;
		segs[SEG_CORE2_TEXT].in_rom_length = 0x2CEF;
	}
	if (region_code == 'U') {
		segs[SEG_CORE1].in_rom_offset = 0x1E29B60;
		segs[SEG_CORE1].in_rom_length = 0x15BB8;
		segs[SEG_CORE1_TEXT].in_rom_offset = 0x1E3F718;
		segs[SEG_CORE1_TEXT].in_rom_length = 0x2E37;
		segs[SEG_CORE2].in_rom_offset = 0x1E42550;
		segs[SEG_CORE2].in_rom_length = 0x44726;
		segs[SEG_CORE2_TEXT].in_rom_offset = 0x1E86C76;
		segs[SEG_CORE2_TEXT].in_rom_length = 0x2D3a;
	}
}
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
int buildModRom(char* path) {
	for (int i = 0; i < rom.size; i++){
		rom.mod_data[i] = rom.data[i];
	}
	for (int s = 0; s < 2; s++){
		Segment *seg = &segs[s*2];
		Segment *seg_text = &segs[s*2 + 1];
		for (int i = 0; i < (seg->in_rom_length + seg_text->in_rom_length); i++){
			rom.mod_data[seg->in_rom_offset + i] = 0;
		}
		for (int i = 0; i < seg->zip_length; i++){
			rom.mod_data[seg->in_rom_offset + i] = seg->zip_data[i];
		}
		for (int i = 0; i < seg_text->zip_length; i++){
			rom.mod_data[seg->in_rom_offset + seg->zip_length + i] = seg_text->zip_data[i];
		}
	}

	FILE *romm = fopen(path, "wb");
	if (!romm){
		printf("Could not write the ROM to '%s' properly.\n", path);
		return 1;
	}
	fwrite(rom.mod_data, 1, rom.size, romm);
	fclose(romm);
	return 0;
}
u32 extractSeg(int seg) {
	int len = 0;
	puff(segs[seg].raw_data, 1024*1024, rom.data + segs[seg].in_rom_offset + 2, segs[seg].in_rom_length - 2, &len);
	segs[seg].raw_length = len;
	return len;
}
u32 compactSeg(int seg) {
	segs[seg].zip_length = bt_zip(segs[seg].raw_data, segs[seg].raw_length, segs[seg].zip_data, 1024*1024);
	if (segs[seg].zip_length > segs[seg].in_rom_length) {
		printf("WARNING: The final segment '%s' length is greater than the original in rom!", segs[seg].name);
	}
}
int saveSeg(int seg, char* base_path, bool zipped) {
	char out[256]; sprintf(out, "%s/%s.bin\0", base_path, segs[seg].name);
	FILE *fseg = fopen(out, "wb");
	if (!fseg) {
		printf("Could not extract the segment %s to file '%s' properly.\n", segs[seg].name, out);
		return 1;
	}
	if (zipped) fwrite(segs[seg].zip_data, 1, segs[seg].zip_length, fseg);
	else fwrite(segs[seg].raw_data, 1, segs[seg].raw_length, fseg);
	fclose(fseg);
	return 0;
}
int loadSeg(int seg, char* base_path) {
	char in[256]; sprintf(in, "%s/%s.bin\0", base_path, segs[seg].name);
	FILE *fseg = fopen(in, "rb");
	if (!fseg) {
		printf("Could not load the segment %s from file '%s' properly.\n", segs[seg].name, in);
		return 1;
	}
	fseek(fseg, 0, SEEK_END);
	u32 len = ftell(fseg);
	fseek(fseg, 0, SEEK_SET);
	fread(segs[seg].raw_data, 1, len, fseg);
	segs[seg].raw_length = len;
	fclose(fseg);
	return 0;
}

int main(int argc, char *argv[]){
	bool extract_mode = TRUE;
	bool zip_mode = FALSE;
	char region_code = 'E';
	char rom_path[256] = { 0 };
	char data_path[256] = { 0 };
	char save_path[256] = { 0 };

	for (int a = 1; a < argc; a++){
		if (strcmp(argv[a], "-e") == 0) { // Extract
			extract_mode = TRUE;
		}
		else if (strcmp(argv[a], "-i") == 0) { // Insert
			extract_mode = FALSE;
		}
		else if (strcmp(argv[a], "-europe") == 0) { // Europe ROM
			region_code = 'E';
		}
		else if (strcmp(argv[a], "-usa") == 0) { // USA ROM
			region_code = 'U';
		}
		else if (strcmp(argv[a], "-z") == 0) { // Enable zip mode (output zipped data instead)
			zip_mode = TRUE;
			a++;
			if (a < argc) {
				strcpy(save_path, argv[a]);
			}
			else break;
		}
		else if (strcmp(argv[a], "-s") == 0) { // Save ROM path
			zip_mode = FALSE;
			a++;
			if (a < argc) {
				strcpy(save_path, argv[a]);
			}
			else break;
		}
		else {
			if (rom_path[0]){
				strcpy(data_path, argv[a]);
			}
			else {
				strcpy(rom_path, argv[a]);
			}
		}
	}

	// ROM Loading
	if (loadRom(rom_path)){
		return 1;
	}
	setupByRegion(region_code);

	if (extract_mode) {
		extractSeg(SEG_CORE1);
		extractSeg(SEG_CORE1_TEXT);
		extractSeg(SEG_CORE2);
		extractSeg(SEG_CORE2_TEXT);
		
		if (saveSeg(SEG_CORE1, data_path, FALSE)) return 1;
		if (saveSeg(SEG_CORE1_TEXT, data_path, FALSE)) return 1;
		if (saveSeg(SEG_CORE2, data_path, FALSE)) return 1;
		if (saveSeg(SEG_CORE2_TEXT, data_path, FALSE)) return 1;
	}

	else {
		if (loadSeg(SEG_CORE1, data_path)) return 1;
		if (loadSeg(SEG_CORE1_TEXT, data_path)) return 1;
		if (loadSeg(SEG_CORE2, data_path)) return 1;
		if (loadSeg(SEG_CORE2_TEXT, data_path)) return 1;

		compactSeg(SEG_CORE1);
		compactSeg(SEG_CORE1_TEXT);
		compactSeg(SEG_CORE2);
		compactSeg(SEG_CORE2_TEXT);

		if (zip_mode) {
			if (saveSeg(SEG_CORE1, save_path, TRUE)) return 1;
			if (saveSeg(SEG_CORE1_TEXT, save_path, TRUE)) return 1;
			if (saveSeg(SEG_CORE2, save_path, TRUE)) return 1;
			if (saveSeg(SEG_CORE2_TEXT, save_path, TRUE)) return 1;
		}
		else {
			if (buildModRom(save_path)) {
				return 1;
			}
		}
	}

	printf("\nDone!\n");
	return 0;
}
