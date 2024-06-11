let chunk = ""

self.onmessage = function(e) {
  if(e.data.type === 'CHUNK') {
    chunk = chunk.concat(e.data.data)
    return;
  }

  if(e.data.type === 'END') {
    const parse = JSON.parse(chunk);
    const flattened = flatten(parse);
    self.postMessage(flattened)
  }
}

function flatten(obj, normalized = [], level = 0) {
  for(const key in obj) {
    if(typeof obj[key] !== 'object') {
      normalized.push({
        type: "PRIMITIVE",
        key,
        value: obj[key],
        level
      })
    } else {

      if(obj[key] === null) {
        normalized.push({type: "PRIMITIVE", key, value: "null", level})
      } else {
        if(Array.isArray(obj[key])) {
          normalized.push({type: "ARRAY_START", key, value: "[", level})
        } else {
          normalized.push({type: "OBJECT_START", key, value: "{", level})
        }

        flatten(obj[key], normalized, level + 1)

        if(Array.isArray(obj[key])) {
          normalized.push({type: "OBJECT_START", key, value: "{", level})
        } else {
          normalized.push({type: "OBJECT_END", key, value: "}", level})
        }
      }
    }
  }

  return normalized
}