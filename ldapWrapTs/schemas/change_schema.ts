export interface Val {
	oldVal: string;
	newVal: string;
}

export interface IchangeSchema {
	op: string;
	attr: string;
	vals: Array<Val>;
}


