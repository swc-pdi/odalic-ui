(function () {


    // Main module
    var app = angular.module('odalic-app');

    // suggestions directive
    var currentFolder = $.getPathForRelativePath('');
    app.directive('cDSuggestions', ['rest', 'reporth', function (rest, reporth) {
        return {
            restrict: 'E',
            scope: {
                selectedPosition: '=',
                locked: '=',
                knowledgeBase: '@',
                result: '=',
            },
            templateUrl: currentFolder + 'cdsuggestions.html',
            link: function ($scope, iElement, iAttrs) {

                //for server data waiting
                $scope.waitForSuggestions = false;


                //region suggestion from primaryKB
                // Initialization
                $scope.suggestions = [];
                $scope.reporting = {};

                //adds new suggestion into ruesult
                $scope.addSuggestions = function (suggestion) {
                    $scope.reporting.clear();

                    if ($scope.selectedPosition.row == -1) {
                        //adds classification  into result
                        var currentCell = $scope.result.headerAnnotations[$scope.selectedPosition.column];
                        var candidates = currentCell.candidates[$scope.knowledgeBase];

                        addToResult(suggestion,currentCell, candidates,'classification');


                    }
                    else {
                        var currentCell = $scope.result.cellAnnotations[$scope.selectedPosition.row][$scope.selectedPosition.column];
                        var candidates = currentCell.candidates[$scope.knowledgeBase];

                        addToResult(suggestion,currentCell, candidates,'disambiguation');
                    }
                };

                var  addToResult = function(suggestion,currentCell, candidates,textMessege)
                {
                    //object in result format
                    var newObj = {
                        "entity": suggestion,
                        "score": {"value": null}
                    };
                    //finds already existing resource
                    var alreadyExist = candidates.find(function (candidate) {
                            return candidate.entity.resource == suggestion.resource
                    });

                    //tests duplicity
                    if (alreadyExist == null) {
                        //adds new disambiguation among the candidates in a current cell and sets it as the selected candidate
                        candidates.push(newObj);
                        currentCell.chosen[$scope.knowledgeBase] = [newObj];

                    }
                    else {
                        //sets it as the selected candidate
                        currentCell.chosen[$scope.knowledgeBase]=[alreadyExist];
                    }
                    //locks current cell
                    $scope.locked.tableCells[$scope.selectedPosition.row][$scope.selectedPosition.column] = 1;

                    //deletes form
                    $scope.suggestions ={};
                    $scope.string="";

                    $scope.reporting.push('success','The '+textMessege+' is used.');
                }
                ;


                //gets suggestions from server based on user string input
                $scope.getSuggestions = function (string, limit) {
                    $scope.suggestions = [];
                    $scope.waitForSuggestions = true;
                    $scope.reporting.clear();

                    if ($scope.selectedPosition.row == -1) {
                        //GET http://example.com/{base}/entities/classes?query=Pra&limit=20
                        rest.base($scope.knowledgeBase).entities.classes.query(string).limit(limit).retrieve.exec(
                            // Success, inject into the scope
                            successFunction(),
                            // Error
                            errorFunction()
                        );
                    } else {
                        //GET http://example.com/{base}/entities/resources?query=Pra&limit=20
                        rest.base($scope.knowledgeBase).entities.resources.query(string).limit(limit).retrieve.exec(
                            // Success, inject into the scope
                            successFunction(),
                            // Error
                            errorFunction()
                        );

                    }
                }

                //rest api success function
                var successFunction = function () {
                    return function (response) {
                        //shuts loading icon
                        //TODO may be use loadico directive
                        $scope.waitForSuggestions = false;

                        $scope.suggestions = response;

                        //shows first entity in the select box if some suggestions are found
                        if ($scope.suggestions.length > 0) {
                            $scope.suggestion = $scope.suggestions[0];
                        }

                        $scope.reporting.push('success','Search results arrived. Search found '+ $scope.suggestions.length+' suggestions.' );
                    };
                };

                //rest api fail function
                var errorFunction = function () {
                    return function (response) {
                        $scope.waitForSuggestions = false;
                        $scope.reporting.push('error', reporth.constrErrorMsg($scope['rtxt.finderror'], response.data));
                    }
                };



            }
        }
    }
    ]);

})();
