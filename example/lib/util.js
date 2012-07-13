var util = {
    trim: function(value) {
        return value.replace(/^\s+/, '').replace(/\s+$/, '')
    },
    isArray: function(value) {
        return value.constructor == Array;
    }
};