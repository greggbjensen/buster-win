var collection = {
    first: function(list) {
        return list[0];
    },
    max: function(list) {
        var max = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i] > max) {
                max = list[i];
            }
        }

        return max;
    }
};