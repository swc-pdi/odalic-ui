(function () {

    // Get the mappings declaration synchronously and configure the core angular settings
    $.getJSONSync('js/templates/mapping.json', function (mapping) {
        // Main module
        var app = angular.module('odalic-app');

        // Create the root controller
        app.controller('odalic-root-ctrl', function ($scope) { /* ... */ });

        // Configure the route
        app.config(function ($routeProvider) {
            mapping.forEach(function (item) {
                // Set a template for a given route
                $routeProvider.when(item[0], {
                    templateUrl: item[1],
                    controller: item[2]
                });
            });
        });

        // Create controllers for each page
        mapping.forEach(function (item) {
            app.controller(item[2], function ($scope) { /* ... */ });
        });
    });

})();