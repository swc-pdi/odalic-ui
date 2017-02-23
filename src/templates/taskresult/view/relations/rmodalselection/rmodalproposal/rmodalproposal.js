(function () {

    // Main module
    var app = angular.module('odalic-app');

    app.controller('rProposeController', function ($scope, $uibModalInstance, rest, data) {
        $scope.selectedRelation = data.selectedRelation;
        $scope.result = data.result;
        $scope.range = data.range;
        $scope.domain = data.domain;
        $scope.currentLock = data.locked;
        $scope.primaryKB = data.primaryKB;
        $scope.gvdata = data.gvdata;
        $scope.currentRelation =  data.currentRelation;
        $scope.close = $uibModalInstance.close;


        //sets parameters for the alert directive
        $scope.serverResponse = {
            visible: false
        };

        //region proposal settings
        $scope.setProposal = function (proposal) {

            // Is proposal defined?
            if (proposal && $scope.rProposeForm.$valid) {

                var url = proposal.suffixUrl;

                //joins alternative labels
                var alternativeLabels = [];

                if (proposal.alternativeLabel != null) {
                    alternativeLabels.push(proposal.alternativeLabel);
                }

                //object in rest api format for classes
                var obj = {
                    "label": proposal.label,
                    "alternativeLabels": alternativeLabels,
                    "suffix": url,
                    "superProperty": null,
                    "domain":  $scope.domain,
                    "range":  $scope.range
                };


                properties(obj);
            }
        };
        //endregion

        //saves new propose properties
        var properties = function (obj) {
            rest.base($scope.primaryKB).entities.properties.update(obj).exec(
                // Success, inject into the scope
                function (response) {

                    var newObj = {
                        "entity": response,
                        "score": {
                            "value": null
                        }
                    };
                    
                    //adds classification into result
                    $scope.currentRelation.candidates[$scope.primaryKB].push(newObj);
                    $scope.currentRelation.chosen[$scope.primaryKB] = [newObj];
                    $scope.gvdata.mc();

                    //locks
                    $scope.currentLock();
                    $scope.gvdata.update();

                    //success message
                    success();

                },
                // Error
                function (response) {
                    //because of a delayed response server
                    var info = JSON.parse(response.data);
                    fail(info);
                }
            );
        };

        //sets parameters for the alert directive
        var success = function () {
            $scope.serverResponse.type = 'success';
            $scope.serverResponse.visible = true;
            $scope.messege = "Propose was saved";
        }
        //sets parameters for the alert directive
        var fail = function (info) {
            $scope.serverResponse.type = 'error';
            $scope.serverResponse.visible = true;
            $scope.messege = info.payload.text;
        }

    });


})();
