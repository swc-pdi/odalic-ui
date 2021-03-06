/** Functions for easing work with text */
var text = {
    /** Uses heuristics to find key points for a given URI (domain, language, ...).
     *  Note that this is just an estimate, it may not be accurate.
     *  Please ensure the given address is in a correct form otherwise a non-sensible exception may be thrown.
     *
     * @param address       The address to split to key points
     * @returns {{protocol: string, domain: string, language: string, page: string}}
     */
    uri: function (address) {
        var arr = address.split(/[\:/.]+/);

        // Using heuristics here; everything is just an estimate
        var protocols = ['http', 'https'];
        var wwws = ['www', 'ww2'];

        var _protocol = protocols[0];
        var foundProtocol = false;
        protocols.forEach(function (item) {
            if (item == arr[0]) {
                _protocol = item;
                arr.shift();
            }
        });
        wwws.forEach(function (item) {
            if (item == arr[0]) {
                arr.shift();
            }
        });

        var _domain = arr[0];
        arr.shift();

        while (arr[0].length > 3) {
            arr.shift();
        }
        var _lang = arr[0];
        arr.shift();

        var _page = '';
        if (arr.length >= 1) {
            _page = arr[arr.length - 1];
            if (_page.includes('?')) {
                _page = _page.split('?')[0];

                var endings = ['htm', 'html', 'asp', 'jsp', 'php'];
                var foundend = false;
                endings.forEach(function (item) {
                    if (_page == item) {
                        foundend = true;
                    }
                });

                if (foundend) {
                    if (arr.length >= 2) {
                        _page = arr[arr.length - 2];
                    }
                }
            }
        }

        return {
            protocol: _protocol,
            domain: _domain,
            language: _lang,
            page: _page
        };
    },

    /** A rather safe-ish concatenation of different url parts.
     *  e.g. urlAppend('http://www.google.com/', '/translate/'); gives http://www.google.com/translate/
     *
     *  This function is variadic and supports any amount of arguments.
     *
     * @param address1      First url part
     * @param address2      Second url part (may not be the last)
     * @returns {*}         Concatenated url string
     */
    urlConcat: function (address1, address2) {
        if (arguments.length <= 1) {
            return arguments[0];
        }

        // Recursive call
        address2 = this.urlConcat.apply(this, Array.prototype.slice.call(arguments, 1));

        // Now we deal with the case for exactly 2 arguments
        if (address1.length === 0) {
            return address2;
        }

        var r = address1;
        if (r.charAt(r.length - 1) !== '/') {
            if (address2.charAt(0) !== '/') {
                r += '/';
            }
        }
        return r + address2;
    },

    /** When a string is too long, use this function to trim it and put '...' in the middle.
     *
     * @param value     The string to trim
     * @param length    Length to trim the string to
     * @returns {*}     'Dotted' string
     */
    dotted: function (value, length) {
        var l = value.length;
        if (l <= length) {
            return value;
        }

        if (length < 5) {
            throw new Error('Conditional length too small; cannot proceed.');
        }

        // '..' vs. '...'
        var dotl = 3;
        var overlap = l - length;
        if ((length <= 6) || (overlap <= 2)) {
            dotl = 2;
        }

        // trim
        overlap += dotl;
        var _fhalf = value.slice(0, Math.floor(l/2) - Math.floor(overlap/2));
        var _shalf = value.slice(Math.floor(l/2) + 1 + Math.floor(overlap/2)
            + ((overlap % 2 == 0) ? 0 : 1));

        // concatenate
        return _fhalf + this.repeat('.', dotl) + _shalf;
    },

    /** When a string is too long, use this function to trim it and put '...' at the end.
     *
     * @param value     The string to trim
     * @param length    Length to trim the string to
     * @returns {*}     'Shortened' string
     */
    shortened: function (value, length) {
        var l = value.length;
        if (l <= length) {
            return value;
        }

        if (length < 5) {
            throw new Error('Conditional length too small; cannot proceed.');
        }

        return (new String()).concat(value.slice(0, length - 3), this.repeat('.', 3));
    },

    /** Make a string by repeating it.
     *  e.g. repeat('hi', 3) gives 'hihihi'
     *
     * @param value     A string
     * @param count     How many times to repeat the string
     * @returns {*}     New string
     */
    repeat: function (value, count) {
        if (count <= 0) {
            throw new Error('Count must be greater than 0.');
        }

        var r = value;
        for (var i = 1; i < count; i++) {
            r += value;
        }
        return r;
    },

    /** Generates a simple, relatively short, number-based identifier.
     *  Beware of the pseudorandom numbers.
     *
     * @returns {*}     Randomly generated identifier
     */
    randomId: function () {
        var gen = function () {
            return Math.floor(Math.random() * 1000 + 1)
        };
        return gen() + '-' + gen();
    },

    /** Converts a variable to string if defined.
     *  If undefined, returns an empty string.
     *
     * @param variable      A variable to convert to string.
     * @returns {string}    A string created from the passed variable.
     */
    safe: function (variable) {
        if (variable) {
            return String(variable);
        } else {
            return String();
        }
    },

    /** Converts a variable to string if defined.
     *  If undefined, returns the given placeholder string.
     *
     * @param variable      A variable to convert to string.
     * @param placeholder   A fallback string if the variable is undefined.
     * @returns {string}    A string created from the passed variable.
     */
    safe2: function (variable, placeholder) {
        if (variable) {
            return String(variable);
        } else {
            return String(placeholder);
        }
    },

    /** Safely parses an input string and returns the containing number.
     *  If the string does not contain any number, a specified fallback is returned.
     *  In case the string is undefined or null, fallback is returned again.
     *
     * @param string    A string to parse.
     * @param fallback  A fallback value when a string does not contain any value.
     * @returns {*}     Number in the string or a fallback value.
     */
    safeInt: function (string, fallback) {
        if (string) {
            var i = parseInt(string);
            if (!isNaN(i)) {
                return i;
            }
        }

        return fallback;
    },

    /** Safely parses an input string and returns the containing boolean value.
     *  If the string does not contain any boolean value, a specified boolean fallback is returned.
     *  In case the string is undefined or null, fallback is returned again.
     *
     * @param string        A string to parse.
     * @param fallback      A boolean fallback value when a string does not contain any value.
     * @returns {boolean}   Boolean value of the string or a boolean fallback value.
     */
    safeBool: function (string, fallback) {
        if (string) {
            switch (text.safe(string).toUpperCase()) {
                case 'TRUE':
                    return true;
                case 'FALSE':
                    return false;
            }
        }

        return !!fallback;
    },

    /** Performs case insensitive and substring form of 'includes' while finding the item that is 'responsible'.
     *  Example:
     *      var it = text.findInclude(['hello', 'yay'], 'El');  // 'it' is equal to 'hello'
     *
     * @param arr           An array of strings.
     * @param arg           A string to find.
     * @returns {string}    The string that matches, or null, if there are no matches.
     */
    findInclude: function (arr, arg) {
        var result = null;
        arr.forEach(function (item) {
            if (item.toUpperCase().includes(arg.toUpperCase())) {
                result = item;
            }
        });
        return result;
    },

    /** Returns an empty string.
     *
     * @returns {string}
     */
    empty: function () {
        return '';
    }
};