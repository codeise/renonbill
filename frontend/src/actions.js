const prefixUpdateAction = (prefix, payload) => {
    return {type: 'prefixUpdate', prefix: prefix, payload: payload};
}

const keyValueUpdateAction = (key, value) => {
    return {type: 'keyValueUpdate', key: key, value: value};
}
const arrayUpdateAction = (prefix, payload) => {
    return {type: 'arrayUpdate', prefix: prefix, payload: payload};
}
const arrayItemUpdateAction = (prefix, id, key, payload, lookupKey = 'id') => {
    return {type: 'arrayItemUpdate', prefix: prefix, id: id, key: key, payload: payload, lookupKey: lookupKey}
}

export {prefixUpdateAction, keyValueUpdateAction, arrayUpdateAction, arrayItemUpdateAction}