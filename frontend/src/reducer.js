import {defaultState} from "./defaultState";

function init(a) {
    return defaultState;
}

function reducer(state, action) {
    if (typeof (action) === 'function') {
        return action(state);
    }

    switch (action.type) {
        case 'prefixUpdate':
            return {...state, [action.prefix]: {...state[action.prefix], ...action.payload}};
        case 'keyValueUpdate':
            return {...state, [action.key]: action.value};
        case 'arrayUpdate':
            return {...state, [action.prefix]: state[action.prefix].concat([action.payload])}
        case 'arrayItemUpdate':
            let newArray = JSON.parse(JSON.stringify(state[action.prefix]))
            let item = newArray.find(item => item[action.lookupKey] === action.id)
            if (item) {
                item[action.key] = action.payload
            }
            return {...state, [action.prefix]: newArray}
        default:
            throw new Error();
    }
}

export {init, reducer}