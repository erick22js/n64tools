const vm = require('vm');
const fs = require('fs');
vm.runInThisContext(fs.readFileSync(__dirname+'/file.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/n64symbols.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/n64disasm.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/n64toc.js'));
vm.runInThisContext(fs.readFileSync(__dirname+'/gesyms.js'));

const DUMP_MODE_FULL = 0;
const DUMP_MODE_MEM = 1;
const DUMP_MODE_AUTO = 2;

var types = [ "u8", "u16",  "u32", "s8", "s16", "s32", "f32", "f64", "u64" ];
var masks = [ 0xFFn, 0xFFFFn, 0xFFFFFFFFn, 0xFFn, 0xFFFFn, 0xFFFFFFFFn, 0xFFFFFFFFn, 0xFFFFFFFFFFFFFFFFn, 0xFFFFFFFFFFFFFFFFn ];

const og_exec = process.argv[2];
const recomp_exec = process.argv[3];
const out = process.argv[4];

function readState(file){
	var state = {};
	state.pc = n64ImmHex(file.read64());
	state.fcondcode = n64ImmHex(file.read64());
	for (var r = 0; r < 32; r++){
		state[n64_cpu_regs[r]] = n64ImmHex(file.read64());
	}
	for (var r = 0; r < 32; r++){
		state[n64_fpr_regs[r]] = n64ImmHex(file.read64());
	}
	state.index = n64ImmHex(file.readbiu32());
	state.random = n64ImmHex(file.readbiu32());
	state.entrylo0 = n64ImmHex(file.readbiu32());
	state.entrylo1 = n64ImmHex(file.readbiu32());
	state.context = n64ImmHex(file.readbiu32());
	state.pagemask = n64ImmHex(file.readbiu32());
	state.wired = n64ImmHex(file.readbiu32());
	state.badvaddr = n64ImmHex(file.readbiu32());
	state.count = n64ImmHex(file.readbiu32());
	state.entryhi = n64ImmHex(file.readbiu32());
	state.compare = n64ImmHex(file.readbiu32());
	state.status = n64ImmHex(file.readbiu32());
	state.cause = n64ImmHex(file.readbiu32());
	state.epc = n64ImmHex(file.readbiu32());
	state.config = n64ImmHex(file.readbiu32());
	state.taglo = n64ImmHex(file.readbiu32());
	state.taghi = n64ImmHex(file.readbiu32());
	state.errorepc = n64ImmHex(file.readbiu32());
	state.hi = n64ImmHex(file.read64());
	state.lo = n64ImmHex(file.read64());
	for (var i = 0; i < 5; i++){
		if (file.read64() != (0xF0E0D0C0B0A09080n + 0x0101010101010101n*BigInt(i)*2n)){
			throw "Invalid format at 0x" + hex(file.tell()) + "!";
		}
	}
	return state;
}

function readAuto(file){
	var state = {};
	state.pc = n64ImmHex(file.readbiu32());
	var reg_id = Number(file.readbiu32());
	var value = n64ImmHex(file.read64());
	var name = "?";
	if (reg_id >= 32 && reg_id < 64){
		name = n64_cpu_regs[reg_id - 32];
	}
	if (reg_id >= 64 && reg_id < 96){
		name = n64_fpr_regs[reg_id - 64];
	}
	if (reg_id >= 96 && reg_id < (96+18)){
		name = (["index", "random", "entrylo0", "entrylo1", "context", "pagemask", "wired", "badvaddr", "count", "entryhi", "compare", "status", "cause", "epc", "config", "taglo", "taghi", "errorepc"])[reg_id - 96];
	}
	if (reg_id == (96+18)) name = 'hi';
	if (reg_id == (96+19)) name = 'lo';
	if (name!="?" || value!="0x0") state[name] = value;
	return state;
}

function readMemAccess(file) {
	var state = {};
	state.write = n64ImmHex(file.readbiu32());
	state.fpu = n64ImmHex(file.readbiu32());
	state.reg = n64ImmHex(file.readbiu32());
	state.type = file.readbiu32();
	state.address = n64ImmHex(file.readbiu32());
	state.pc = n64ImmHex(file.readbiu32());
	state.value = file.read64();
	if (state.write) state.value = BigInt(state.value) & masks[state.type];
	state.type = n64ImmHex(state.type);
	state.value = n64ImmHex(state.value);
	return state;
}

var og = File.loadAtPath(fs, og_exec, true);
var rec = null;
let dumpmode = 0;
let readFunc = null;

if (out){
	rec = File.loadAtPath(fs, recomp_exec, true);
	File.loadAtPath(fs, recomp_exec, true);
	
	if ((dumpmode = og.readbiu32()) != rec.readbiu32()){
		console.log("Cannot compare two different dump modes!");
	}
	else {
		og.read32(); og.read64(); rec.read32(); rec.read64();
		readFunc = dumpmode==DUMP_MODE_MEM? readMemAccess: dumpmode==DUMP_MODE_FULL? readState: readAuto;
		var diffs = "";
		var id = 0;
		while (!og.eof() && !rec.eof()){
			let has_mod = false;
			let mod = '';
			let o = readFunc(og);
			let r = readFunc(rec);
			for (var k in o){
				if (o[k] != r[k]){
					if (k!="random" && k!="count"){
						has_mod = true;
					}
					mod += k+" = og:"+o[k]+" | re:"+r[k]+"\n";
				}
			}
			if (has_mod) diffs += "================= PC "+o.pc+(dumpmode==DUMP_MODE_MEM? "  " + (o.write=="0x0"? "READ": "WRITE") + " " + types[Number(o.type)]: "") + ("          PP#0x" + hex(id)) +"\n"+mod+"\n";
			id++;
		}
		if (!og.eof()) console.log("Original file length is bigger!\n");
		if (!rec.eof()) console.log("Recompiled file length is bigger!\n");
		fs.writeFileSync(out, diffs);
	}
}
else {
	var fo = fs.openSync(recomp_exec, 'w');
	
	dumpmode = og.readbiu32();
	og.read32(); og.read64();
	readFunc = dumpmode==DUMP_MODE_MEM? readMemAccess: dumpmode==DUMP_MODE_FULL? readState: readAuto;
	var id = 0;
	while (!og.eof()){
		let data = '';
		let o = readFunc(og);
		for (var k in o){
			data += k+" = "+o[k]+"\n";
		}
		fs.writeSync(fo, "================= PC "+o.pc+(dumpmode==DUMP_MODE_MEM? "  " + (o.write=="0x0"? "READ": "WRITE") + " " + types[Number(o.type)]: "") + ("          PP#0x" + hex(id)) +"\n"+data+"\n");
		id++;
	}
	fs.closeSync(fo);
}

