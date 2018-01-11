export interface Oid {
	id: string;
	type: string;
}

export interface Value {
	id: string;
	type: string;
}

export interface IsCritical {
	id: string;
	type: string;
}

export interface Property {
	oid: Oid;
	value: Value;
	isCritical: IsCritical;
}

export interface RootObject {
	id: string;
	type: string;
	properties: Property;
	required: string[];
}