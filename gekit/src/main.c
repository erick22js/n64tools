#include "decompress.h"



int main(int argc, char *argv[]){
	loadRom("D:/documentos/meus-projetos/misc/n64tools/gekit/_data/base.z64");

	ripSegments();

	printf("\nDone!\n");

	return 0;
}