(function () {

    // Main module
    var app = angular.module('odalic-app');

    // Controller
    var currentFolder = $.getPathForRelativePath('');
    app.controller('odalic-signup-ctrl', function ($scope, formsval, $auth, reporth) {

        // Initialization
        formsval.toScope($scope);
        $scope.status = 'default';

        // Sign up panel
        $scope.signup = {
            alerts: {},
            username: new String(),
            password: new String(),
            password2: new String(),
            buttondis: false,
            signup: function (f) {
                // Validate
                if (!formsval.validate($scope.signupForm)) {
                    f();
                    return;
                }

                // Create a new user
                var ref = $scope.signup;
                $auth.signup({
                    email: ref.username,
                    password: ref.password
                }).then(function(response) {
                    $scope.status = 'emsent';
                }).catch(function(response) {
                    ref.alerts.push('error', reporth.constrErrorMsg($scope['msgtxt.failure'], response.data));
                    f();
                });
            }
        };

        // E-mail sent
        $scope.emsent = {
            alert: {
                type: 'success',
                visible: true
            }
        };

        // Redirect to login screen, if already logged
        if ($auth.isAuthenticated()) {
            window.location = '#/login';
        }

    });

})();