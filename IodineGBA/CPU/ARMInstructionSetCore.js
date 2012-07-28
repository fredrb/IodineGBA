function ARMInstructionSet(CPUCore) {
	this.CPUCore = CPUCore;
	this.IOCore = this.CPUCore.IOCore;
	this.wait = this.IOCore.wait;
	this.resetPipeline();
	this.compileInstructionMap();
}
ARMInstructionSet.prototype.resetPipeline = function () {
	this.fetch = 0;
	this.decode = 0;
	this.execute = 0;
	this.pipelineInvalid = 0x3;
}
ARMInstructionSet.prototype.executeIteration = function () {
	//Push the new fetch access:
	this.fetch = this.wait.CPUGetOpcode32(this.programCounter);
	//Execute Conditional Instruction:
	this.executeARM(this.instructionMap[(this.execute >> 20) & 0xFF][(this.execute >> 4) & 0xF]);
	//Update the pipelining state:
	this.execute = this.decode;
	this.decode = this.fetch;
}
ARMInstructionSet.prototype.executeARM = function (instruction) {
	if (this.pipelineInvalid == 0) {
		//Check the condition code:
		if (this.conditionCodeTest()) {
			instruction[0](this, instruction[1]);
		}
	}
	else {
		//Tick the pipeline invalidation:
		this.pipelineInvalid >>= 1;
	}
}
ARMInstructionSet.prototype.conditionCodeTest = function () {
	switch (this.execute >> 28) {
		case 0xE:		//AL (always)
						//Put this case first, since it's the most common!
			return true;
		case 0x0:		//EQ (equal)
			if (!this.CPUCore.CPSRZero) {
				return false;
			}
			break;
		case 0x1:		//NE (not equal)
			if (this.CPUCore.CPSRZero) {
				return false;
			}
			break;
		case 0x2:		//CS (unsigned higher or same)
			if (!this.CPUCore.CPSRCarry) {
				return false;
			}
			break;
		case 0x3:		//CC (unsigned lower)
			if (this.CPUCore.CPSRCarry) {
				return false;
			}
			break;
		case 0x4:		//MI (negative)
			if (!this.CPUCore.CPSRNegative) {
				return false;
			}
			break;
		case 0x5:		//PL (positive or zero)
			if (this.CPUCore.CPSRNegative) {
				return false;
			}
			break;
		case 0x6:		//VS (overflow)
			if (!this.CPUCore.CPSROverflow) {
				return false;
			}
			break;
		case 0x7:		//VC (no overflow)
			if (this.CPUCore.CPSROverflow) {
				return false;
			}
			break;
		case 0x8:		//HI (unsigned higher)
			if (!this.CPUCore.CPSRCarry || this.CPUCore.CPSRZero) {
				return false;
			}
			break;
		case 0x9:		//LS (unsigned lower or same)
			if (this.CPUCore.CPSRCarry && !this.CPUCore.CPSRZero) {
				return false;
			}
			break;
		case 0xA:		//GE (greater or equal)
			if (this.CPUCore.CPSRNegative != this.CPUCore.CPSROverflow) {
				return false;
			}
			break;
		case 0xB:		//LT (less than)
			if (this.CPUCore.CPSRNegative == this.CPUCore.CPSROverflow) {
				return false;
			}
			break;
		case 0xC:		//GT (greater than)
			if (this.CPUCore.CPSRZero || this.CPUCore.CPSRNegative != this.CPUCore.CPSROverflow) {
				return false;
			}
			break;
		case 0xD:		//LE (less than or equal)
			if (!this.CPUCore.CPSRZero && this.CPUCore.CPSRNegative == this.CPUCore.CPSROverflow) {
				return false;
			}
			break;
		//case 0xF:		//Reserved (Never Execute)
		default:
			return false;
	}
}
ARMInstructionSet.prototype.compileInstructionMap = function () {
	this.instructionMap = [
		//0
		[
			[
				this.AND,
				this.lli
			],
			[
				this.AND,
				this.llr
			],
			[
				this.AND,
				this.lri
			],
			[
				this.AND,
				this.lrr
			],
			[
				this.AND,
				this.ari
			],
			[
				this.AND,
				this.arr
			],
			[
				this.AND,
				this.rri
			],
			[
				this.AND,
				this.rrr
			],
			[
				this.AND,
				this.lli
			],
			[
				this.MUL,
				this.NOP
			],
			[
				this.AND,
				this.lri
			],
			[
				this.STRH,
				this.ptrm
			],
			[
				this.AND,
				this.ari
			],
			[
				this.LDRD,
				this.ptrm
			],
			[
				this.AND,
				this.rri
			],
			[
				this.STRD,
				this.ptrm
			]
		],
		//1
		[
			[
				this.ANDS,
				this.lli
			],
			[
				this.ANDS,
				this.llr
			],
			[
				this.ANDS,
				this.lri
			],
			[
				this.ANDS,
				this.lrr
			],
			[
				this.ANDS,
				this.ari
			],
			[
				this.ANDS,
				this.arr
			],
			[
				this.ANDS,
				this.rri
			],
			[
				this.ANDS,
				this.rrr
			],
			[
				this.ANDS,
				this.lli
			],
			[
				this.MULS,
				this.NOP
			],
			[
				this.ANDS,
				this.lri
			],
			[
				this.LDRH,
				this.ptrm
			],
			[
				this.ANDS,
				this.ari
			],
			[
				this.LDRSB,
				this.ptrm
			],
			[
				this.ANDS,
				this.rri
			],
			[
				this.LDRSH,
				this.ptrm
			]
		],
		//2
		[
			[
				this.EOR,
				this.lli
			],
			[
				this.EOR,
				this.llr
			],
			[
				this.EOR,
				this.lri
			],
			[
				this.EOR,
				this.lrr
			],
			[
				this.EOR,
				this.ari
			],
			[
				this.EOR,
				this.arr
			],
			[
				this.EOR,
				this.rri
			],
			[
				this.EOR,
				this.rrr
			],
			[
				this.EOR,
				this.lli
			],
			[
				this.MLA,
				this.NOP
			],
			[
				this.EOR,
				this.lri
			],
			[
				this.STRH,
				this.ptrm
			],
			[
				this.EOR,
				this.ari
			],
			[
				this.LDRD,
				this.ptrm
			],
			[
				this.EOR,
				this.rri
			],
			[
				this.STRD,
				this.ptrm
			]
		],
		//3
		[
			[
				this.EORS,
				this.lli
			],
			[
				this.EORS,
				this.llr
			],
			[
				this.EORS,
				this.lri
			],
			[
				this.EORS,
				this.lrr
			],
			[
				this.EORS,
				this.ari
			],
			[
				this.EORS,
				this.arr
			],
			[
				this.EORS,
				this.rri
			],
			[
				this.EORS,
				this.rrr
			],
			[
				this.EORS,
				this.lli
			],
			[
				this.MLAS,
				this.NOP
			],
			[
				this.EORS,
				this.lri
			],
			[
				this.LDRH,
				this.ptrm
			],
			[
				this.EORS,
				this.ari
			],
			[
				this.LDRSB,
				this.ptrm
			],
			[
				this.EORS,
				this.rri
			],
			[
				this.LDRSH,
				this.ptrm
			]
		],
		//4
		[
			[
				this.SUB,
				this.lli
			],
			[
				this.SUB,
				this.llr
			],
			[
				this.SUB,
				this.lri
			],
			[
				this.SUB,
				this.lrr
			],
			[
				this.SUB,
				this.ari
			],
			[
				this.SUB,
				this.arr
			],
			[
				this.SUB,
				this.rri
			],
			[
				this.SUB,
				this.rrr
			],
			[
				this.SUB,
				this.lli
			],
			[
				this.UNDEFINED,
				this.NOP
			],
			[
				this.SUB,
				this.lri
			],
			[
				this.STRH,
				this.ptim
			],
			[
				this.SUB,
				this.ari
			],
			[
				this.LDRD,
				this.ptim
			],
			[
				this.SUB,
				this.rri
			],
			[
				this.STRD,
				this.ptim
			]
		],
		//5
		[
			[
				this.SUBS,
				this.lli
			],
			[
				this.SUBS,
				this.llr
			],
			[
				this.SUBS,
				this.lri
			],
			[
				this.SUBS,
				this.lrr
			],
			[
				this.SUBS,
				this.ari
			],
			[
				this.SUBS,
				this.arr
			],
			[
				this.SUBS,
				this.rri
			],
			[
				this.SUBS,
				this.rrr
			],
			[
				this.SUBS,
				this.lli
			],
			[
				this.UNDEFINED,
				this.NOP
			],
			[
				this.SUBS,
				this.lri
			],
			[
				this.LDRH,
				this.ptim
			],
			[
				this.SUBS,
				this.ari
			],
			[
				this.LDRSB,
				this.ptim
			],
			[
				this.SUBS,
				this.rri
			],
			[
				this.LDRSH,
				this.ptim
			]
		],
		//6
		[
			[
				this.RSB,
				this.lli
			],
			[
				this.RSB,
				this.llr
			],
			[
				this.RSB,
				this.lri
			],
			[
				this.RSB,
				this.lrr
			],
			[
				this.RSB,
				this.ari
			],
			[
				this.RSB,
				this.arr
			],
			[
				this.RSB,
				this.rri
			],
			[
				this.RSB,
				this.rrr
			],
			[
				this.RSB,
				this.lli
			],
			[
				this.UNDEFINED,
				this.NOP
			],
			[
				this.RSB,
				this.lri
			],
			[
				this.STRH,
				this.ptim
			],
			[
				this.RSB,
				this.ari
			],
			[
				this.LDRD,
				this.ptim
			],
			[
				this.RSB,
				this.rri
			],
			[
				this.STRD,
				this.ptim
			]
		],
		//7
		[
			[
				this.RSBS,
				this.lli
			],
			[
				this.RSBS,
				this.llr
			],
			[
				this.RSBS,
				this.lri
			],
			[
				this.RSBS,
				this.lrr
			],
			[
				this.RSBS,
				this.ari
			],
			[
				this.RSBS,
				this.arr
			],
			[
				this.RSBS,
				this.rri
			],
			[
				this.RSBS,
				this.rrr
			],
			[
				this.RSBS,
				this.lli
			],
			[
				this.UNDEFINED,
				this.NOP
			],
			[
				this.RSBS,
				this.lri
			],
			[
				this.LDRH,
				this.ptim
			],
			[
				this.RSBS,
				this.ari
			],
			[
				this.LDRSB,
				this.ptim
			],
			[
				this.RSBS,
				this.rri
			],
			[
				this.LDRSH,
				this.ptim
			]
		],
	];
}