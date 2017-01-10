/** Supporting methods for JavaScript object handling */
var objhelp = {
    /** Executes forEach designed for objects.
     *  Only iterates via own object properties.
     *
     * @param obj           object to iterate
     * @param callback      a callback function that should accept the following arguments: "key", "value"
     */
    objForEach: function (obj, callback) {
        for (var item in obj) {
            if (obj.hasOwnProperty(item)) {
                callback(item, obj[item]);
            }
        }
    },

    /** Accesses any item (fist one) in the given object.
     *
     * @param obj           object to access an item of
     * @param callback      a callback function that should accept the following arguments: "key", "value"
     */
    objGetAny: function (obj, callback) {
        var accessed = false;

        for (var item in obj) {
            if (obj.hasOwnProperty(item)) {
                callback(item, obj[item]);
                accessed = true;
                return;
            }
        }

        if (!accessed) {
            throw new Error('The object is empty.');
        }
    },

    /** Returns the first argument that is defined - either non-null or true.
     *  If none such are available, null is returned.
     *  The function is variadic.
     *
     * @returns {*}
     */
    getFirstArg: function () {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i]) {
                return arguments[i];
            }
        }
        return null;
    },

    /** Accesses safely an object recursively with defined keys. This function is variadic.
     *
     *  Example 1:
     *      var myObj = { key1: {}, nothing: null };
     *      objRecurAccess(myObj, 'key1', 'key2', 'key3');
     *  Resulting object:
     *      myObj = { key1: { key2: { key3: {} } }, nothing: null }
     *
     *  Example 2:
     *      var myObj = {};
     *      objRecurAccess(myObj, 'key1', 'key2', 'key3')['key4'] = 'Hello';
     *  Resulting object:
     *      myObj = { key1: { key2: { key3: { key4: 'Hello' } } } }
     *
     * @param obj       the object to access
     * @returns {*}     the requested item (may be created a new)
     */
    objRecurAccess: function (obj) {
        if (arguments.length < 2) {
            throw new Error('Illegal number of arguments. Must contain at least 1 key.');
        }

        var _obj = obj;
        if (typeof(_obj) !== 'object') {
            throw new Error('Passed argument is not an object; cannot proceed.');
        }

        var args = arguments;
        for (;;) {
            args = Array.prototype.slice.call(args, 1);
            if (args.length <= 0) {
                return _obj;
            }

            var key = args[0];
            if (!(key in _obj)) {
                _obj[key] = {};
            } else {
                if (typeof(_obj[key]) !== 'object') {
                    throw new Error('The passed object contains property ' + key + ', but it is not an object.');
                }
            }
            _obj = _obj[key];
        }
    },

    /** Copies contents of a one object into another.
     *  Omits the properties that are already defined in the second object.
     *  Beware, the copy is non-recursive.
     *
     * @param obj1 The object to copy.
     * @param obj2 The object to copy the first object to. Must not be null nor undefined.
     */
    objCopy: function (obj1, obj2) {
        if (!obj1) {
            return;
        }

        if (!obj2) {
            // JS does not support passing arguments by reference, so this has to be an error
            throw new Error('obj2 not an object.');
        }

        this.objForEach(obj1, function (key, value) {
            if (!obj2[key]) {
                obj2[key] = value;
            }
        });
    },

    /** Performs a test of a passed argument by passed tests.
     *  If the argument passes all of the passed tests, it is returned, otherwise the fallback is returned.
     *  Example:
     *      var i = objhelp.test(3, 'alternative', '> 0', '<= 3');  // i is equal to 3
     *      var j = objhelp.test(3, 'alternative', '> 0', '< 3');   // j is equal to 'alternative'
     *
     *  Note that if the argument is undefined or null, the fallback is returned.
     *
     * @param arg       The argument to test.
     * @param fallback  Fallback to use when the argument does not pass any of tests.
     * {params String}  Any amount of tests in the following format: '< 0', '=== true', etc.
     * @returns {*}     The argument or the fallback.
     */
    test: function (arg, fallback) {
        // If undefined or null, return fallback
        if (!arg) {
            return fallback;
        }

        // Remove first argument
        var args = Array.prototype.slice.call(arguments, 1);

        // Test
        for (;;) {
            args = Array.prototype.slice.call(args, 1);
            if (args.length <= 0) {
                return arg;
            }

            var tt = (new String()).concat(String(arg), ' ', args[0]);
            if (!eval(tt)) {
                return fallback;
            }
        }
    },

    /** Calls the first argument that is defined and is a function.
     *  This function is variadic.
     *
     */
    callFirstArg: function () {
        for (var i = 0; i < arguments.length; i++) {
            if (typeof(arguments[i]) === 'function') {
                arguments[i]();
                return;
            }
        }
    },

    /** Creates a two-sided mirror from an array.
     *  Example:
     *      var m = objhelp.tsmirros([['1', 'a'], ['2', 'b'], ['3', 'c']]);
     *      var i = m.second['2'];  // i is equal to 'b'
     *      var j = m.first['c'];   // j is equal to '3'
     *
     * @param arr                           Array to create a mirror from.
     * @returns {{first: {}, second: {}}}   The created mirror.
     */
    tsmirror: function (arr) {
        var mirror = {
            first: {},
            second: {}
        };
        arr.forEach(function (item) {
            mirror.first[item[1]] = item[0];
            mirror.second[item[0]] = item[1];
        });

        return mirror;
    }
};
