export interface Val {
	oldVal: string;
	newVal: string;
}

export interface changeProperty {
	op: string;
	attr: string;
	vals: Array<Val>;
}


