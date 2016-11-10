(function () {

    // Main module
    var app = angular.module('odalic-app');

    // Create a controller for taskconfigs
    var currentFolder = $.getPathForRelativePath('');
    app.controller('odalic-taskconfigs-ctrl', function ($scope, $routeParams, rest, persist, report) {

        // Reporting service
        var reporting = report($scope);

        // Dealing with the table
        $.getScriptSync(currentFolder + 'table/table.js', function () {});
        var table = tableComponent($scope, rest, reporting);

        // Dealing with the state updates
        $.getScriptSync(currentFolder + 'table/statepoll.js', function () {});
        var statepoll = statepollComponent($scope, rest, persist);

        // Initialize
        $scope.taskconfigs = [];
        table.refreshList(statepoll.setPolling);

        // Table button functions
        $scope.frun = function (taskId) {
            rest.tasks.name(taskId).execute.exec(
                // Execution started successfully
                function (response) {
                    table.updateRecord(taskId);
                    statepoll.watch(taskId);
                },
                // Error while starting the execution
                function (response) {
                    reporting.error(response);
                }
            );
        };

        $scope.fstop = function (taskId) {
            rest.tasks.name(taskId).stop.exec(
                // Execution stopped successfully
                function (response) {
                    table.updateRecord(taskId);
                },
                // Error while stopping the execution
                function (response) {
                    reporting.error(response);
                }
            );
        };

        $scope.fresult = function (taskId) {
            window.location = '#/taskresult/' + taskId;
        };

        $scope.fconfigure = function (taskId) {
            window.location = '#/createnewtask/' + taskId;
        };

        $scope.fremove = function (taskId) {
            rest.tasks.name(taskId).remove.exec(
                // Task removal finished successfully
                function (response) {
                    table.removeRecord(taskId);
                },
                // Error while removing the task
                function (response) {
                    reporting.error(response);
                }
            );
        };

        // Miscellaneous
        $scope.misc = {
            gotocnt: function () {
                window.location.href = '#/createnewtask';
            },

            selected: $routeParams['taskid']
        };
    });

})();