export interface Attr {
	id: string;
	type: string;
}

export interface Val {
	id: string;
	type: string;
}

export interface Property {
	attr: Attr;
	vals: Val;
}

export interface RootObject {
	id: string;
	type: string;
	properties: Property;
	required: string[];
}