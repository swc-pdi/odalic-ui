(function () {

    // Main module
    var app = angular.module('odalic-app');

    // Settings
    var settings = {
        fileProvisionTypes: ['local', 'remote'],
        savedFiles: []
    };

    // Create a controller for task-creation screen
    app.controller('createnewtask-ctrl', function ($scope, $http, $window, sharedata, filedata, requests) {
        // Files
        $scope.fileProvision = settings.fileProvisionTypes[0];
        $scope.files = {};

        //Supported knowledge bases
        $scope.availableKBs = ["DBpedia"];

        //TODO smazat az bude na vyber
        $scope.chosenKBs = ["DBpedia"];
        $scope.primaryKB = "DBpedia";

        // List of uploaded files
        $scope.savedFiles = settings.savedFiles;

        /** Refreshes the list of uploaded files
         *
         * @param callback    A function to call once the reponse from server returns.
         *                    The function must consume 1 parameter.
         *                    It is assigned 'true' for a successful list retrieval; false for an unsuccessful list retrieval.
         *
         */

        // sets  file identifier by the chosen file name
        $scope.setFile = function (element) {
            $scope.$apply(function ($scope) {
                //TODO bez pripony ???
                //TODO kontrola jeli to csv tu???
                $scope.fileUpload.identifier = element.files[0].name;
                $scope.isUploadDisabled = false;
            });
        };

        function refreshUploadedFiles(callback) {
            $http({
                method: "GET",
                url: "http://localhost:8080/odalic/files/"
            }).then(
                // The list of uploaded files was retrieved successfully
                function success(response) {
                    $scope.savedFiles = response.data;
                    if (callback) {
                        callback(true);
                    }
                },
                // An error occured while retrieving the list of uploaded files
                function failure(response) {
                    if (callback) {
                        callback(false);
                    }
                }
            );
        }

        refreshUploadedFiles();

       


        // File uploading
        $scope.fileUpload = {
            uploadingFile: false,

            uploadFileError: {
                alert: false,
                close: function () {
                    $scope.fileUpload.uploadFileError.alert = false;
                },
                details: String()
            },

            uploadFileSuccess: {
                alert: false,
                close: function () {
                    $scope.fileUpload.uploadFileSuccess.alert = false;
                }
            },

            uploadFile: function () {
                // The file is now uploading. Hide the 'upload' button to prevent multiple uploads.
                $scope.fileUpload.uploadingFile = true;

                // Generic preparations
                var fileUrl = "http://localhost:8080/odalic/files/" + $scope.fileUpload.identifier;

                // Uploading the file asynchronously
                sendData = function (fileData) {
                    requests.reqMFD({
                        method: "PUT",
                        address: fileUrl,
                        formData: requests.prepareMFD()
                            .attachJSON("file", {
                                id: String($scope.fileUpload.identifier),
                                uploaded: "2000-01-01 00:00",
                                owner: "default",
                                location: fileUrl
                            })
                            // TODO: Formerly we used this way:
                            //.attachCSV("input", fileData)
                            .attachGeneric("input", document.getElementById("concreteFile").files[0])
                            .get(),
                        success: function (response) {
                            // The file has been uploaded successfully => refresh the list of available files
                            refreshUploadedFiles(function (succes) {
                                // Succes parameter ignored.

                                //button Upload is active 
                                $scope.isUploadDisabled = true;

                                // Display a success message
                                $scope.fileUpload.uploadFileSuccess.alert = true;

                                // Sets new uploaded file as chosen
                                var uploadedFileIndex = $scope.savedFiles.map(function(file) { return file.id; }).indexOf($scope.fileUpload.identifier);
                                $scope.files.selectedFile =$scope.savedFiles[uploadedFileIndex] ;

                                // Clear the fields
                                $scope.fileUpload.identifier = String();
                                filedata.clearInputFile("concreteFile");

                                // Another file may be uploaded again
                                $scope.fileUpload.uploadingFile = false;
                                
                            });
                        },
                        failure: function failure(response) {
                            // The file has not been uploaded => display an error message
                            $scope.fileUpload.uploadFileError.alert = true;
                            $scope.fileUpload.uploadFileError.details = response.substring(0, 50);

                            // A file may be uploaded again
                            $scope.fileUpload.uploadingFile = false;
                        }
                    });
                };

                // Read the file and send the data to server
                filedata.readBase64("concreteFile", function (fileData) {
                    sendData(fileData);
                });
            }
        };


        // Task creation
        $scope.createTask = function () {
            // Validate the form
            if (!$scope.taskCreationForm.$valid) {
                alert("Form validation failed.");
                return;
            }

            // Generic preparations
            var taskUrl = "http://localhost:8080/odalic/tasks/" + $scope.taskCreation.identifier;
            var taskExecUrl = taskUrl + "/execution";
            var taskResultUrl = taskUrl + "/result";
            var fileId = $scope.files.selectedFile.id;
            var fileLocation = $scope.files.selectedFile.location;

            // Immediately redirect to a loading screen
            $window.location.href = "#/loading";

            // For displaying error messages when a failure of one of the requests occurs
            var requestError = function (response) {
                sharedata.set("Failure", response.data);
                $window.location.href = "#/genericerror";
            }

            // A request for retrieval of an executed task's result
            var reqGetResult = function () {
                requests.reqJSON({
                    method: "GET",
                    address: taskResultUrl,
                    formData: undefined,
                    success: function (response) {
                        //TODO predelat pro vice tasku bezicich zaroven??
                        // Save the result and redirect
                        sharedata.set("Result", response.data);
                        // Save the task ID
                        sharedata.set("TaskID", $scope.taskCreation.identifier);
                        $window.location.href = "#/taskresult";
                    },
                    // TODO: Uncomment this
                    //failure : requestError
                    failure: function () {
                        // TODO: This is just a temporary solution until a problem with REST file upload is resolved
                        $.getJSONSync("src/templates/taskresult/sample_result.json", function (sample) {
                            sharedata.set("Result", sample);
                        });
                        $window.location.href = "#/taskresult";
                    }
                });
            };

            // A request for executing the prepared task
            var reqStartTask = function () {
                requests.reqJSON({
                    method: "PUT",
                    address: taskExecUrl,
                    formData: {
                        draft: false
                    },
                    success: function (response) {
                        reqGetResult();
                    },
                    failure: requestError
                });
            };

            // Start with a request for inserting a task
            requests.reqJSON({
                method: "PUT",
                address: taskUrl,
                formData: {
                    id: String($scope.taskCreation.identifier),
                    created: "2000-01-01 00:00",
                    configuration: {
                        input: fileId,
                        feedback: {
                            columnIgnores: [],
                            classifications: [],
                            columnAmbiguities: [],
                            ambiguities: [],
                            disambiguations: [],
                            cellRelations: [],
                            columnRelations: []
                        },
                        primary_base: { 
                            name: $scope.primaryKB
                        }
                    }
                },
                success: function (response) {
                    //TODO predelat pro vice tasku bezicich zaroven??
                    // Save the chosen input file identifier
                    sharedata.set("Input", fileLocation);
                    sharedata.set("PrimaryKB", $scope.primaryKB);
                    sharedata.set("ChosenKBs", $scope.chosenKBs);
                    reqStartTask();
                },
                failure: requestError
            });

        }
    });

})();