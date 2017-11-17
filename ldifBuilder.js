'use strict';

const fs = require('fs');
const os = require('os');

const rdn = 'dn: cn=testUser';

const dn = process.env.npm_package_config_entryDn;

const entryAttributes = `objectClass: person
cn: Test
sn: bla
description: TestData`;

const dataEntryPoint = dn + os.EOL + entryAttributes + os.EOL + os.EOL;

fs.appendFileSync('./bigDb.ldif', `dn: ${dataEntryPoint}`);
for (let i = 0; i < 10000; i++) {
  const data = `${rdn + i},${dataEntryPoint}`;

  fs.appendFileSync('./bigDb.ldif', data);
}
