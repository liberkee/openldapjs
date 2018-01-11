export interface OldVal {
	id: string;
	type: string;
}

export interface Attr {
	id: string;
	type: string;
}

export interface Property {
	oldVal: OldVal;
	attr: Attr;
}

export interface RootObject {
	id: string;
	type: string;
	properties: Property;
	required: string[];
}