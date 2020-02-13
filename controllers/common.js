const R = require('ramda');
const _ = require('lodash');


const alt = (fnc1,fnc2)=>{
    return function(val){
        return fnc1(val) || fnc2(val)
    }
}

