/** Converts data in the form of a Blob to a file and downloads it to the user's filesystem.
 * @param {Blob} blob An instance of Blob containing the data to store in the file.
 * @param {string} filename The name of the file.
 */
export const downloadAsFile = (blob, filename) => {
  let anchor = document.createElement('a');
  anchor.href = window.URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
}

/** Creates an SVG node of type 'type' and sets the attributes defined by the 'attr' object.
 * @param {string} type A type of SVG node (eg. 'svg', 'line')
 * @param {object} attr 
 */
export const svgNode = (type, attr) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', type);
  for (const [key, val] of Object.entries(attr)) {
    el.setAttribute(key, val);
  }
  return el;
};

/** Given a series of accessors ```path```, finds the corresponding object in ```target``` and applies the changes specified in ```delta``` to a copy of ```target```.
 * @param {object} target An object to change.
 * @param {Array<string>} path An array of strings representing a series of accessors on an object.
 * @param {object} delta An object containing values which should overwrite values on ```target```.
 * @return {object} A cloned and altered version of ```target```.
 */
export const merge = (target, path, delta) => {
  const key = path.shift();

  let result;
  if (Array.isArray(target)) {
    result = [ ...target ];
    if (key !== undefined) {
      result[key] = merge(target[key], path, delta);
    } else {
      for (let i in delta) {
        result[i] = delta[i];
      }
    }
  } else if (typeof target === 'object') {
    if (key !== undefined) {
      result = { ...target, [key]: merge(target[key], path, delta) };
    } else {
      result = { ...target, ...delta };
    }
  } else {
    if (key !== undefined) {
      throw new Error("Undefined path.");
    } else {
      result = delta;
    }
  }
  return result;
};

/** Returns a deep clone of 'target';
 * @param {*} target 
 */
export const clone = (target) => {
  if (target === null) {
    return null;
  } if (typeof target === "object") {
    const result = Array.isArray(target) ? [] : {};
    for (let key in target) {
      result[key] = clone(target[key]);
    }
    return result;
  } else {
    return target;
  }
};

/** Wraps a function ```callback```. Repeated invocations of the resulting function will be condensed to a single call, executed only after ```time``` miliseconds have elapsed without any other invocations.
 * @param {number} time Period of inactivity in miliseconds required before callback will be executed.
 * @param {Function} callback The function to be executed
 * @return {Function} A function.
 */
export const debounce = (time, callback) => {
  let interval;
  return (...args) => {
    clearTimeout(interval);
    interval = setTimeout(() => {
      interval = null;
      callback(...args);
    }, time);
  };
};

/** Converts an object containing schema data to a series of SQL CREATE TABLE statements. See Table.defaults and Field.defaults for the expected data structure. 
 * @param {object} tables 
 */
export const toSql = (tables) => {

  //Needs to be heavily expanded to not allow illegal queries!!!

  let primary = '';
  let foreignTable = '';
  let foreignField = '';
  let unique = [];
  let output = ''
  for (const t in tables) {
      let table = t.toString();
      output += 'CREATE TABLE '
      output += tables[table]['name'] + '(\n'
      for (const f in tables[table]['fields']) {
          let field = f.toString();
          output += tables[table]['fields'][field]['name'] + ' ';
          output += tables[table]['fields'][field]['type'];
          if(tables[table]['fields'][field]['primaryKey']) primary = tables[table]['fields'][field]['name'];
          if(tables[table]['fields'][field]['unique']) unique.push(tables[table]['fields'][field]['name']);
          if(tables[table]['fields'][field]['notNUll']) output += ' NOT NULL';
          if(tables[table]['fields'][field]['defaultValue']) {
              output += ' DEFAULT ' + tables[table]['fields'][field]['defaultValue'];
          }
          output += ',\n';
          if(tables[table]['fields'][field]['checkCondition']) output += 'CHECK (' + tables[table]['fields'][field]['name'] + tables[table]['fields'][field]['checkCondition'] +'),\n';
          if(tables[table]['fields'][field]['foreignKey']) {
            foreignField = tables[table]['fields'][field]['foreignKey']['fieldName'];
            foreignTable = tables[table]['fields'][field]['foreignKey']['tableName'];
          }
      }
      if(primary) output += 'PRIMARY KEY (' + primary + '),\n';
      primary = '';
      if(foreignTable) output += 'FOREIGN KEY (' + foreignField + ') REFERENCES ' + foreignTable + '(' + foreignField + '),\n';
      if(unique.length) {
              output += 'UNIQUE (';
              unique.forEach(x => output += x + ', ');
              output = output.slice(0, -2)
              output += '),\n'
      }
      output = output.slice(0, -2);
      output +='\n);\n'
      foreignTable = '';
      foreignField = '';
  }
  return output;
}