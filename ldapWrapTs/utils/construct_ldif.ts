
export interface Iattribute {
  type: string,
  options: never[],
  attribute: string,
}

export interface Ivalue {
  type: string,
  value: string,
}

export interface IattributeObject {
  attribute: Iattribute,
  value: Ivalue,
}

export interface IentryObject {
  type: string,
  dn: string,
  attributes: IattributeObject[],
}

export interface IldifObject {
  type: string,
  version: null,
  entries: IentryObject[],
}

export default function constructLdif(ldifString: string) {
  const ldifObject: IldifObject = {
    type: 'content',
    version: null,
    entries: [],
  };
  const resultArr: string[] = ldifString.split('\n');
  const entryObject: IentryObject = {
    type: 'record',
    dn: '',
    attributes: [],
  };

  resultArr.forEach((element, index, array) => {
    if (element.trim()) {
      const elementArr = element.split(':');
      const objectKey = elementArr[0];
      const objectVal = elementArr[1];
      if (objectKey !== 'dn') {
        const constructAttrObj = {
          attribute: {
            type: 'attribute',
            options: [],
            attribute: objectKey,
          },
          value:
          {
            type: 'value',
            value: objectVal,
          },
        };
        entryObject.attributes.push(constructAttrObj);
      } else {
        entryObject.dn = objectVal;
      }
    } else if (index === array.length - 1) {
      ldifObject.entries.push(entryObject);
    }
  });
  return ldifObject;
}
