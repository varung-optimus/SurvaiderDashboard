(function(window){

  var appModule = angular.module('SurvaiderDashboard', ['ngRoute', 'chart.js', 'ngMaterial']);
  Chart.defaults.global['responsive'] = true;
  Chart.defaults.global['maintainAspectRatio'] = false;


  var application = null;

  var uri_dat = UriTemplate.extract('/survey/s:{s_id}/analysis?parent={parent}',
    window.location.pathname + window.location.search + window.location.hash);

  var SURVEY_ID = uri_dat.s_id;
  var PATHNAME = window.location.pathname;

  appModule.controller('MainController', ['$scope','$http', '$location', '$mdDialog', '$mdMedia', function($scope, $http, $location, $mdDialog, $mdMedia){

    application = new myapp();

    $scope.colors = application.colors;
    $scope.formatNumber = function(number){
      if (number < 10 && number > 0) {
        return "0" + number;
      }
      else{
        return number;
      }
    }

    $scope.formatDate = function(date){
      return new Date(date);
    }
    // Flag to show/hide the edit survey link
    var uri_dat = UriTemplate.extract('/survey/s:{s_id}/analysis?parent={parent}',
    window.location.pathname + window.location.search + window.location.hash);
    if (uri_dat.parent) {
      $scope.isEditSurveyEnabled = true;
    }
    else {
      $scope.isEditSurveyEnabled = false;
    }

    $scope.ParentId = uri_dat.s_id;
    $scope.makeANumberArray = function(size){
      var temp = new Array(size);
      for (var i = 0; i < temp.length; i++) {
        temp[i] = i+1;
      }
      return temp;
    }

    $scope.showModal = function(ev, modal) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: './dialogs/' + modal + '.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: useFullScreen
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });

      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });

      function DialogController($scope, $mdDialog, $location) {
        $scope.surveyUrl = $location.absUrl();
        $scope.surveyName = application.companyName + ' - ' + application.unitName;
        $scope.hide = function() {
          $mdDialog.hide();
        };
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
        $scope.saveSettings = function() {
          // console.log($scope.survey);
          var data = {};
          var config = {};

          data = {
              swag: $scope.survey.responseCap
          };

          $http
             .post('/api/survey/' + application.SURVEY_ID + '/response_cap', data, config)
             .then(successCallback, errorCallback);

         data = {
             swag: $scope.survey.expiryDate
         };

         $http
            .post('/api/survey/' + application.SURVEY_ID + '/expires', data, config)
            .then(successCallback, errorCallback);

            data = {
                swag: $scope.survey.isPaused
            };

            $http
               .post('/api/survey/' + application.SURVEY_ID + '/paused', data, config)
               .then(successCallback, errorCallback);

        };
        function successCallback(data) {
            // console.log('Saved' + data);
        }

        function errorCallback(data) {
            alert('Some error occurred, please contact Admin');
        }
      }
    };


  }]);

  appModule.controller('HomeController', [ '$scope', '$http', '$location',function($scope, $http, $location){
    // This is used for Overall tab
    $scope.overallTabLabel = 'all';

    // Active tab
    $scope.activeTab = $scope.overallTabLabel;

    $scope.isTicketModal = false;

    $scope.switchTab = function(item) {
         if (!item.label) {
             $scope.activeTab = $scope.overallTabLabel;
            return;
         }
         $scope.activeTab = item.label;
    }

    $scope.isTabSelected = function(item) {
         // console.log($scope.activeTab);
         return $scope.activeTab == item.label;
    }

    $scope.getTheMonthName = function(index){

      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

      return months[index % months.length];
    }

    //HTTP-MARK::- Dashboard API Call which returns top-most line graph data
    //and unit-graph data

    var uri = './/API1_parent.json';
    // var uri = '/api/dashboard/'+uri_dat.s_id+'/all/response/true';

    $http.get(uri).success(function(data){
      application.init(data);
      $scope.features = application.features;
      $scope.units = application.units;
      $scope.ratingPoints = application.ratingPoints;
      $scope.dates = application.dates;
      $scope.sentiments = application.sentiments;
      $scope.totalRespondents = application.totalRespondents;
      $scope.companyName = application.companyName;
      // $scope.unitName = application.unitName;
      // alert("Homecontroller, API1 call");

      var numberOfFeatures = $scope.features.length;

      $scope.theGraph = {
        totalMaxGraphHeight: 175,
        blockWidth: 225,
        barWidth: 25,
        barMargin: 5,
        barHeight: 150
      };

      $scope.theGraph['totalGraphWidth'] = ($scope.theGraph.barWidth)*(numberOfFeatures) + ($scope.theGraph.barMargin)*(numberOfFeatures-1);

      $scope.theGraph['groupToTranslate'] = (($scope.theGraph.blockWidth) - ($scope.theGraph.totalGraphWidth)) / 2;

      $scope.theGraph['sumOfScore'] = $scope.features.reduce(function(a,b){ return a.score + b.score });


      $scope.ratingGraph = {
        graphHeight: 200,
        pointRadius: 7,
        borderWidth: 20
      }

      $scope.ratingGraph['maxOrdinate'] = $scope.maxOrdinateFrom2DPointArray($scope.ratingPoints);

      $scope.ratingGraph['abscissaSpacer'] = 60;

      if ($scope.ratingPoints.length*65 < 695) {
            $scope.ratingGraph['graphWidth']=695;
      }else{
            $scope.ratingGraph['graphWidth'] = $scope.ratingPoints.length*65;
      }



      $scope.ticketDetails = {
        x: 9,
        y: 2
      };

      var tempArray = new Array(10);


      $scope.unitsGraph = {
        width: 600,
        height: 600,
        pointRadius: 10,
        outerWidth: 800,
        outerHeight: 800
      }

      $scope.unitsGraph['addUnitX'] = $scope.units.length;


    });


      var uri2 = './API2_parent.json'

      // var uri2 = '/api/irapi/'+uri_dat.s_id+'/0/0/response/true';
      /*
      ***********************************************
      ***********************************************
      */
    $http.get(uri2).success(function(data){

      // Setting the features name(from the key 'option_code')
      // and the average rating(from the key 'avg_rating')
      // in an object { 'label', 'rating' } and pushing it in an array
      // $scope.features

      // alert("Homecontroller, API2 call");
      $scope.questions = [];
      // console.log(data);
      for (var i = 0; i < data.length; i++) {
        switch (data[i].type) {
          case 'group_rating':
            var groupRating = data[i];
            setGroupRatingQuestion();
            break;
          case 'rating':
            var ratingQuestion = data[i];
            // console.log(ratingQuestion);
            setRatingQuestion();
            break;
          case 'short_text':
            var shortText = data[i];
            setShortTextQuestion();
            break;
          case 'long_text':
            var longText = data[i];
            setLongTextQuestion();
            break;
          case 'yes_no':
            var yesNo = data[i];
            setYesOrNoQuestion();
            break;
          case 'single_choice':
            var singleChoice = data[i];
            setSingleQuestion();
            break;
          case 'multiple_choice':
            var multipleChoice = data[i];
            setMultipleChoiceQuestion();
            break;
          case 'ranking':
            var rankingQuestion = data[i];
            setRankingQuestionQuestion();
            break;

        }
      }

      function setShortTextQuestion() {

        var countData = [];
        //console.log(shortText)

        for (var key in shortText['options_count']) {
          if (shortText['options_count'].hasOwnProperty(key)) {
            countData.push( key )
          }
        }

        var question = {

          label: shortText.label,
          type: shortText.type,
          data: countData

        };

        $scope.questions.push(question);

      }

      function setYesOrNoQuestion() {

        var countData = [],
            questionOptions = [];
        // console.log(yesNo['options_count']);
        for (var key in yesNo['options_count']) {
          // console.log(key);
          if (yesNo['options_count'].hasOwnProperty(key)) {
            countData.push( yesNo['options_count'][key] )
          }
        }
        // console.log(countData);

        for (var key in yesNo['options_code']) {
          if (yesNo['options_code'].hasOwnProperty(key)) {
            questionOptions.push( yesNo['options_code'][key] )
          }
        }

        var question = {

          label: yesNo.label,
          type: yesNo.type,
          options: questionOptions,
          data: countData

        };
        // console.log(question);
        $scope.questions.push(question);

      }

      function setSingleQuestion() {

        var countData = [],
            questionOptions = [];

        for (var key in singleChoice['options_count']) {
          if (singleChoice['options_count'].hasOwnProperty(key)) {
            countData.push( singleChoice['options_count'][key] )
          }
        }

        for (var key in singleChoice['options_code']) {
          if (singleChoice['options_code'].hasOwnProperty(key)) {
            questionOptions.push( singleChoice['options_code'][key] )
          }
        }

        var question = {

          label: singleChoice.label,
          type: singleChoice.type,
          options: questionOptions,
          data: countData

        };

        $scope.questions.push(question);
      }

      function setLongTextQuestion() {

        var countData = [],
            questionOptions = [];

        for (var key in longText['sentiment']) {
          if (longText['sentiment'].hasOwnProperty(key)) {
            countData.push( [ longText['sentiment'][key] ] );


            if (key == 'negative') {
              questionOptions.push("Negative :" + longText['sentiment'][key]);
            }

            else if (key == 'positive') {
              questionOptions.push("Positive :" + longText['sentiment'][key]);
            }

            else if (key == 'neutral') {
              questionOptions.push("Neutral :" + longText['sentiment'][key]);
            }

          }
        }

        var positiveKeyWords = [],
            negativeKeywords = [],
            neutralKeywords = [];

        for (var key in longText['sentiment_segg']) {
          if (longText['sentiment_segg'].hasOwnProperty(key)) {

            if (longText['sentiment_segg'][key] == 'negative') {
              negativeKeywords.push(key);
            }

            else if (longText['sentiment_segg'][key] == 'positive') {
              positiveKeyWords.push(key);
            }

            else if (longText['sentiment_segg'][key] == 'neutral') {
              neutralKeywords.push(key);
            }


          }
        }

        var barColorsForAllBars = {
          'negative': '#FB6577',
          'positive': '#A2EB52',
          'neutral': '#DDDDDD'
        };

        var question = {

          label: longText.label,
          type: longText.type,
          positiveKeyWords: positiveKeyWords,
          negativeKeywords: negativeKeywords,
          neutralKeywords: neutralKeywords,
          data: countData,
          options: [],
          series: ['Negative', 'Neutral', 'Positive'],
          graphOptions: {
            barShowStroke : false,
            showScale: false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': barColorsForAllBars['negative']
            },
            {
              'fillColor': barColorsForAllBars['neutral']
            },
            {
              'fillColor': barColorsForAllBars['positive']
            }
          ]

        };

        $scope.questions.push(question);
        // console.log(question)

      }

      function setMultipleChoiceQuestion() {

        var countData = Array.apply(null, {length: Object.keys(multipleChoice['options_code']).length}).map(function() {return 0;}),
            questionOptions = [];
        for (var key in multipleChoice['options_count_segg']) {
          if (multipleChoice['options_count_segg'].hasOwnProperty(key)) {
            var ind = -1;
            for (var i=0; i < Object.keys(multipleChoice['options_code']).length; i++){
              if (Object.keys(multipleChoice['options_code'])[i] == key){
                ind = i;
              }
            }
            countData[ind] = multipleChoice['options_count_segg'][key];
          }
        }

        for (var key in multipleChoice['options_code']) {
          if (multipleChoice['options_code'].hasOwnProperty(key)) {
            questionOptions.push( multipleChoice['options_code'][key] )
          }
        }
        // console.log(countData);
        var question = {

          label: multipleChoice.label,
          type: multipleChoice.type,
          data: [countData],
          options: questionOptions,
          series: [],
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': '#50E3D3'
            }
          ]

        };


        var secondGraphCountData = [],
            secondGrapghQuestionOptions = [];

        for (var key in multipleChoice['options_count']) {
          if (multipleChoice['options_count'].hasOwnProperty(key)) {
            secondGraphCountData.push( multipleChoice['options_count'][key] )
          }
        }

        for (var key in multipleChoice['options_count']) {
          if (multipleChoice['options_count'].hasOwnProperty(key)) {

            var delimeter = '###',
              splitArray = key.split(delimeter);

            var codeArray = [];
            for (var i = 0; i < splitArray.length; i++) {
              // There's a "-1" here because RANDOM HACK.
              codeArray.push( $scope.toCharCode( parseInt(splitArray[i].substr(2, splitArray[i].length)) - 1) );
            }

            secondGrapghQuestionOptions.push( codeArray.join() );
          }
        }

        var secondGraph = {

          data: [secondGraphCountData],
          options: secondGrapghQuestionOptions,
          series: [],
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': '#50E3D3'
            }
          ]

        };

        question.secondGraph = secondGraph;

        $scope.questions.push(question);

      }

      function setRatingQuestion() {

        var countData = new Array(10),
            questionOptions = new Array(10);

        for (var i = 0; i < countData.length; i++) {
          countData[i] = 0;
          questionOptions[i] = i+1;
        }

        for (var key in ratingQuestion['options_count']) {
          if (ratingQuestion['options_count'].hasOwnProperty(key)) {
            // console.log(key);
            var parsedKey = parseInt(key.slice(2));
            // console.log(parsedKey);
            countData[parsedKey - 1] = ratingQuestion['options_count'][key];
          }
        }

        var question = {

          label: ratingQuestion.label,
          type: ratingQuestion.type,
          data: [countData],
          options: questionOptions,
          series: [],
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': '#B8E986'
            }
          ]

        };

        $scope.questions.push(question);

      }

      function setGroupRatingQuestion() {

        var colors = ['#ED7357', '#F3AB73', '#FFF5C6'];

        var questionOptions = new Array(5),
            questionSeries = [];

        for (var i = 0; i < questionOptions.length; i++) {
          if ((i+1) == 1) {
            questionOptions[i] = (i+1) + " star";
          }
          else{
            questionOptions[i] = (i+1) + " stars";
          }
        }

        for (var key in groupRating['options_code']) {
          if (groupRating['options_code'].hasOwnProperty(key)) {
            questionSeries.push( groupRating['options_code'][key] )
          }
        }

        var countData = [];

        for (var i = 0; i < questionSeries.length; i++) {
          countData.push(new Array(questionOptions.length));
        }

        for (var i = 0; i < questionSeries.length; i++) {
          for (var j = 0; j < 5; j++) {
            countData[i][j] = 0;
          }
        }
        // console.log(countData);
        for (var key in groupRating['options_count']) {
          if (groupRating['options_count'].hasOwnProperty(key)) {

            var theChoice = parseInt(key.substr(2, key.length));

            for (var otherKey in groupRating['options_count'][key]) {
              if (groupRating['options_count'][key].hasOwnProperty(otherKey)) {

                var theRating = parseInt(otherKey);

                countData[theChoice-1][theRating-1] = groupRating['options_count'][key][otherKey];
              }
            }

          }
        }

        //FOR STAR RATING GRAPH

        var starRating = [];

        for (var key in groupRating['avg_rating']) {
          if (groupRating['avg_rating'].hasOwnProperty(key)) {

            var theChoice = parseInt(key.substr(2, key.length)),
                theValue = groupRating['avg_rating'][key],
                floatingPart = theValue - Math.floor(theValue),
                integerPart = theValue - floatingPart;


            var ratingArray = new Array(5);


            for (var i = 0; i < 5; i++) {
              if ((i+1) <= integerPart) {
                ratingArray[i] = 1;
              }
              else if((i+1) == (integerPart+1)){
                ratingArray[i] = floatingPart;
              }
              else {
                ratingArray[i] = 0;
              }
            }

            starRating.push( { choice: theChoice, starRatingsArray: ratingArray, ratingValue: theValue } );

          }
        }



        var question = {

          label: groupRating.label,
          type: groupRating.type,
          data: countData,
          options: questionOptions,
          series: questionSeries,
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 0,
            barValueSpacing : 15,
            scaleShowVerticalLines: false
          },

          colors: [
            {
              'fillColor': colors[0]
            },
            {
              'fillColor': colors[1]
            },
            {
              'fillColor': colors[2]
            }
          ],

          starRating: starRating

        };


        $scope.questions.push(question);

      }

      function setRankingQuestionQuestion() {

        var colors = ['#ED7357', '#F3AB73', '#FFF5C6'];

        var questionChoices = [],
            countData = [];

        for (var key in rankingQuestion['options_code']) {
          if (rankingQuestion['options_code'].hasOwnProperty(key)) {
            questionChoices.push( rankingQuestion['options_code'][key] )
          }
        }

        var numberOfRanks = questionChoices.length;

        for (var key in rankingQuestion['ranking_count']) {
          if (rankingQuestion['ranking_count'].hasOwnProperty(key)) {

            var theChoice = parseInt(key.substr(2, key.length));

            var tempData = { rank: theChoice, values: [], sumOfValues: 0 };

            for (var otherKey in rankingQuestion['ranking_count'][key]) {
              if (rankingQuestion['ranking_count'][key].hasOwnProperty(otherKey)) {

                var theRating = rankingQuestion['ranking_count'][key][otherKey];

                tempData.values.push( { mainValue: rankingQuestion['ranking_count'][key][otherKey]  });

                tempData.sumOfValues += theRating;
              }
            }
            countData.push(tempData);
          }
        }

        console.log(countData);

        var rectWidth = 300;

        for (var i = 0; i < countData.length; i++) {

          for (var j = 0; j < countData[i].values.length; j++) {

            countData[i].values[j]['normalizedValue'] = countData[i].values[j].mainValue / countData[i].sumOfValues;
            countData[i].values[j]['width'] = countData[i].values[j]['normalizedValue'] * rectWidth;

            if (j==0) {
              countData[i].values[j]['xOfRext'] = 0;
            }
            else{
              countData[i].values[j]['xOfRext'] = countData[i].values[j-1]['width'];
            }
          }

        }

        for (var i = 0; i < countData.length; i++) {
          var counter = 0;
          for (var j = 0; j < countData[i].values.length; j++) {

            counter += countData[i].values[j]['xOfRext'];

            if (j != 0) {
              countData[i].values[j]['xOfRext'] = counter;
            }


          }
        }

        var sortingOrder = [];

        // console.log(rankingQuestion['options_count']);
        var list = rankingQuestion['options_count'];
        keysSorted = Object.keys(list).sort(function(a,b){return list[b]-list[a]})
        for (var key in keysSorted) {
          var theChoice = parseInt(keysSorted[key].substr(2, keysSorted[key].length));
          sortingOrder.push( theChoice );

        }

        var question = {

          label: rankingQuestion.label,
          type: rankingQuestion.type,
          data: countData,
          options: questionChoices,
          colors: colors,
          board: sortingOrder
        };


        $scope.questions.push(question);

      }

    });

    $scope.toCharCode = function(number){
      return String.fromCharCode(97 + number);
    }

    $scope.maxElementFromArray = function(input){
      var max = -1;

      if (input.length > 0) {
        for (var i = 0; i < input.length; i++) {
          if (input[i].score > max) {
            max = input[i].score;
          }
        }
      }

      return max;
    }

    $scope.maxOrdinateFrom2DPointArray = function(input){
      var max = -1;

      if (input.length > 0) {
        for (var i = 0; i < input.length; i++) {
          if (input[i].y > max) {
            max = input[i].y;
          }
        }
      }

      return max;
    }

  }]);

  appModule.controller('UnitController', [ '$scope', '$routeParams', '$http', function($scope, $routeParams, $http){

    /**/

    /*
    ***********************************************
    HACK FOR READING CUSTOM JSON FILE
    ***********************************************
    */

    // var uri = './API1';

    var uri_dat = UriTemplate.extract('/survey/s:{unitid}/analysis',
    window.location.pathname + window.location.search + window.location.hash);

    var extracted_id = $routeParams.unitid.replace(/s:/g,'');
    // uri += ("_"+extracted_id);
    // uri += '.json';
    /*
    ***********************************************
    ***********************************************
    */

    // var uri = '/api/dashboard/'+extracted_id+'/all/response';
    var uri = './API1_'+ extracted_id +'.json';

    $http.get(uri).success(function(data){

      application.init(data);
      $scope.ratingPoints = application.ratingPoints;
      $scope.dates = application.dates;
      $scope.totalRespondents = application.totalRespondents;
      $scope.companyName = application.companyName;
      $scope.unitName = application.unitName;
      // alert("Unitcontroller, API1 call");

      $scope.ratingGraph = {
        graphHeight: 200,
        pointRadius: 7,
        borderWidth: 20
      }

      $scope.ratingGraph['maxOrdinate'] = $scope.maxOrdinateFrom2DPointArray($scope.ratingPoints);

      $scope.ratingGraph['abscissaSpacer'] = 60;

      if ($scope.ratingPoints.length*65 < 695) {
            $scope.ratingGraph['graphWidth']=695;
      }else{
            $scope.ratingGraph['graphWidth'] = $scope.ratingPoints.length*65;
      }

    });

    /* */

    //HTTP-MARK::- GET-THE-GRAPH-DATA-FOR-ALL-QUESTION-TYPES
    //previously:- dataUnit.json
    // $http.get('http://localhost:10000/api/irapi/' + SURVEY_ID + '/0/0/response/true').success(function(data){

      /*
      ***********************************************
      HACK FOR READING CUSTOM JSON FILE
      ***********************************************
      */

    // var uri2 = './API2';
    var uri_dat = UriTemplate.extract('/survey/s:{s_id}/analysis?parent={parent}',
    window.location.pathname + window.location.search + window.location.hash);
    // if (!uri_dat.parent) {
    //   uri2 += ("_"+uri_dat.s_id);
    // }
    // uri2 += '.json';

    // var uri2 = '/api/irapi/'+uri_dat.s_id+'/0/0/response';
    var uri = './API2_'+ extracted_id +'.json';
      /*
      ***********************************************
      ***********************************************
      */
    $http.get(uri).success(function(data){

      // Setting the features name(from the key 'option_code')
      // and the average rating(from the key 'avg_rating')
      // in an object { 'label', 'rating' } and pushing it in an array
      // $scope.features
      $scope.questions = [];
      // alert("Unitcontroller, API2 call");
      for (var i = 0; i < data.length; i++) {
        switch (data[i].type) {
          case 'group_rating':
            var groupRating = data[i];
            setGroupRatingQuestion();
            break;
          case 'rating':
            var ratingQuestion = data[i];
            setRatingQuestion();
            break;
          case 'short_text':
            var shortText = data[i];
            setShortTextQuestion();
            break;
          case 'long_text':
            var longText = data[i];
            setLongTextQuestion();
            break;
          case 'yes_no':
            var yesNo = data[i];
            setYesOrNoQuestion();
            break;
          case 'single_choice':
            var singleChoice = data[i];
            setSingleQuestion();
            break;
          case 'multiple_choice':
            var multipleChoice = data[i];
            setMultipleChoiceQuestion();
            break;
          case 'ranking':
            var rankingQuestion = data[i];
            setRankingQuestionQuestion();
            break;

        }
      }


      // Setting the features name(from the key 'option_code')
      // and the average rating(from the key 'avg_rating')
      // in an object { 'label', 'rating' } and pushing it in an array
      // $scope.features
      $scope.features = [];
      var theOptionCodeObject = groupRating['options_code'],
          theAvgRatingObject = groupRating['avg_rating'];

      for (var key in theOptionCodeObject) {
        if (theOptionCodeObject.hasOwnProperty(key)) {
          $scope.features.push( { label: theOptionCodeObject[key], rating: theAvgRatingObject[key]  } )
        }
      }

      function setShortTextQuestion() {

        var countData = [];
        //console.log(shortText)

        for (var key in shortText['options_count']) {
          if (shortText['options_count'].hasOwnProperty(key)) {
            countData.push( key )
          }
        }

        var question = {

          label: shortText.label,
          type: shortText.type,
          data: countData

        };

        $scope.questions.push(question);

      }

      function setYesOrNoQuestion() {

        var countData = [],
            questionOptions = [];

        for (var key in yesNo['options_count']) {
          if (yesNo['options_count'].hasOwnProperty(key)) {
            countData.push( yesNo['options_count'][key] )
          }
        }

        for (var key in yesNo['options_code']) {
          if (yesNo['options_code'].hasOwnProperty(key)) {
            questionOptions.push( yesNo['options_code'][key] )
          }
        }

        var question = {

          label: yesNo.label,
          type: yesNo.type,
          options: questionOptions,
          data: countData

        };

        $scope.questions.push(question);

      }

      function setSingleQuestion() {

        var countData = [],
            questionOptions = [];

        for (var key in singleChoice['options_count']) {
          if (singleChoice['options_count'].hasOwnProperty(key)) {
            countData.push( singleChoice['options_count'][key] )
          }
        }

        for (var key in singleChoice['options_code']) {
          if (singleChoice['options_code'].hasOwnProperty(key)) {
            questionOptions.push( singleChoice['options_code'][key] )
          }
        }

        var question = {

          label: singleChoice.label,
          type: singleChoice.type,
          options: questionOptions,
          data: countData

        };

        $scope.questions.push(question);
      }

      function setLongTextQuestion() {

        var countData = [],
            questionOptions = [];

        for (var key in longText['sentiment']) {
          if (longText['sentiment'].hasOwnProperty(key)) {
            countData.push( [ longText['sentiment'][key] ] );


            if (key == 'negative') {
              questionOptions.push("Negative :" + longText['sentiment'][key]);
            }

            else if (key == 'positive') {
              questionOptions.push("Positive :" + longText['sentiment'][key]);
            }

            else if (key == 'neutral') {
              questionOptions.push("Neutral :" + longText['sentiment'][key]);
            }

          }
        }

        var positiveKeyWords = [],
            negativeKeywords = [],
            neutralKeywords = [];

        for (var key in longText['sentiment_segg']) {
          if (longText['sentiment_segg'].hasOwnProperty(key)) {

            if (longText['sentiment_segg'][key] == 'negative') {
              negativeKeywords.push(key);
            }

            else if (longText['sentiment_segg'][key] == 'positive') {
              positiveKeyWords.push(key);
            }

            else if (longText['sentiment_segg'][key] == 'neutral') {
              neutralKeywords.push(key);
            }


          }
        }

        var barColorsForAllBars = {
          'negative': '#FB6577',
          'positive': '#A2EB52',
          'neutral': '#DDDDDD'
        };

        var question = {

          label: longText.label,
          type: longText.type,
          positiveKeyWords: positiveKeyWords,
          negativeKeywords: negativeKeywords,
          neutralKeywords: neutralKeywords,
          data: countData,
          options: [],
          series: ['Negative', 'Neutral', 'Positive'],
          graphOptions: {
            barShowStroke : false,
            showScale: false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': barColorsForAllBars['negative']
            },
            {
              'fillColor': barColorsForAllBars['neutral']
            },
            {
              'fillColor': barColorsForAllBars['positive']
            }
          ]

        };

        $scope.questions.push(question);
        // console.log(question)

      }

      function setMultipleChoiceQuestion() {

        var countData = [],
            questionOptions = [];

        for (var key in multipleChoice['options_count_segg']) {
          if (multipleChoice['options_count_segg'].hasOwnProperty(key)) {
            countData.push( multipleChoice['options_count_segg'][key] )
          }
        }

        for (var key in multipleChoice['options_code']) {
          if (multipleChoice['options_code'].hasOwnProperty(key)) {
            questionOptions.push( multipleChoice['options_code'][key] )
          }
        }

        var question = {

          label: multipleChoice.label,
          type: multipleChoice.type,
          data: [countData],
          options: questionOptions,
          series: [],
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': '#50E3D3'
            }
          ]

        };


        var secondGraphCountData = [],
            secondGrapghQuestionOptions = [];

        for (var key in multipleChoice['options_count']) {
          if (multipleChoice['options_count'].hasOwnProperty(key)) {
            secondGraphCountData.push( multipleChoice['options_count'][key] )
          }
        }

        for (var key in multipleChoice['options_count']) {
          if (multipleChoice['options_count'].hasOwnProperty(key)) {

            var delimeter = '###',
              splitArray = key.split(delimeter);

            var codeArray = [];

            for (var i = 0; i < splitArray.length; i++) {
              // There's a "-1" here because RANDOM HACK.
              codeArray.push( $scope.toCharCode( parseInt(splitArray[i].substr(2, splitArray[i].length)) -1 ) );
            }

            secondGrapghQuestionOptions.push( codeArray.join() );
          }
        }

        var secondGraph = {

          data: [secondGraphCountData],
          options: secondGrapghQuestionOptions,
          series: [],
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': '#50E3D3'
            }
          ]

        };

        question.secondGraph = secondGraph;

        $scope.questions.push(question);

      }

      function setRatingQuestion() {

        var countData = new Array(10),
            questionOptions = new Array(10);

        for (var i = 0; i < countData.length; i++) {
          countData[i] = 0;
          questionOptions[i] = i+1;
        }
        console.log(ratingQuestion['cid']);

        for (var key in ratingQuestion['options_count']) {
          if (ratingQuestion['options_count'].hasOwnProperty(key)) {

            var parsedKey = parseInt(key);

            countData[parsedKey - 1] = ratingQuestion['options_count'][key];
          }
        }
        console.log(countData);

        var question = {

          label: ratingQuestion.label,
          type: ratingQuestion.type,
          data: [countData],
          options: questionOptions,
          series: [],
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 10
          },
          colors: [
            {
              'fillColor': '#B8E986'
            }
          ]

        };

        $scope.questions.push(question);

      }


      function setGroupRatingQuestion() {

        var colors = ['#ED7357', '#F3AB73', '#FFF5C6'];

        var questionOptions = new Array(5),
            questionSeries = [];

        for (var i = 0; i < questionOptions.length; i++) {
          if ((i+1) == 1) {
            questionOptions[i] = (i+1) + " star";
          }
          else{
            questionOptions[i] = (i+1) + " stars";
          }
        }

        for (var key in groupRating['options_code']) {
          if (groupRating['options_code'].hasOwnProperty(key)) {
            questionSeries.push( groupRating['options_code'][key] )
          }
        }

        var countData = [];

        for (var i = 0; i < questionSeries.length; i++) {
          countData.push(new Array(questionOptions.length));
        }

        for (var i = 0; i < questionSeries.length; i++) {
          for (var j = 0; j < 5; j++) {
            countData[i][j] = 0;
          }
        }
        // console.log(countData);
        for (var key in groupRating['options_count']) {
          if (groupRating['options_count'].hasOwnProperty(key)) {

            var theChoice = parseInt(key.substr(2, key.length));

            for (var otherKey in groupRating['options_count'][key]) {
              if (groupRating['options_count'][key].hasOwnProperty(otherKey)) {

                var theRating = parseInt(otherKey);

                countData[theChoice-1][theRating-1] = groupRating['options_count'][key][otherKey];
              }
            }

          }
        }

        //FOR STAR RATING GRAPH

        var starRating = [];

        for (var key in groupRating['avg_rating']) {
          if (groupRating['avg_rating'].hasOwnProperty(key)) {

            var theChoice = parseInt(key.substr(2, key.length)),
                theValue = groupRating['avg_rating'][key],
                floatingPart = theValue - Math.floor(theValue),
                integerPart = theValue - floatingPart;


            var ratingArray = new Array(5);


            for (var i = 0; i < 5; i++) {
              if ((i+1) <= integerPart) {
                ratingArray[i] = 1;
              }
              else if((i+1) == (integerPart+1)){
                ratingArray[i] = floatingPart;
              }
              else {
                ratingArray[i] = 0;
              }
            }

            starRating.push( { choice: theChoice, starRatingsArray: ratingArray, ratingValue: theValue } );

          }
        }



        var question = {

          label: groupRating.label,
          type: groupRating.type,
          data: countData,
          options: questionOptions,
          series: questionSeries,
          graphOptions: {
            barShowStroke : false,
            barDatasetSpacing : 0,
            barValueSpacing : 15,
            scaleShowVerticalLines: false
          },

          colors: [
            {
              'fillColor': colors[0]
            },
            {
              'fillColor': colors[1]
            },
            {
              'fillColor': colors[2]
            }
          ],

          starRating: starRating

        };


        $scope.questions.push(question);

      }


      function setRankingQuestionQuestion() {

        var colors = ['#ED7357', '#F3AB73', '#FFF5C6'];

        var questionChoices = [],
            countData = [];

        for (var key in rankingQuestion['options_code']) {
          if (rankingQuestion['options_code'].hasOwnProperty(key)) {
            questionChoices.push( rankingQuestion['options_code'][key] )
          }
        }

        var numberOfRanks = questionChoices.length;

        for (var key in rankingQuestion['ranking_count']) {
          if (rankingQuestion['ranking_count'].hasOwnProperty(key)) {

            var theChoice = parseInt(key.substr(2, key.length));

            var tempData = { rank: theChoice, values: [], sumOfValues: 0 };

            for (var otherKey in rankingQuestion['ranking_count'][key]) {
              if (rankingQuestion['ranking_count'][key].hasOwnProperty(otherKey)) {

                var theRating = rankingQuestion['ranking_count'][key][otherKey];

                tempData.values.push( { mainValue: rankingQuestion['ranking_count'][key][otherKey]  });

                tempData.sumOfValues += theRating;
              }
            }
            countData.push(tempData);
          }
        }

        var rectWidth = 300;

        for (var i = 0; i < countData.length; i++) {

          for (var j = 0; j < countData[i].values.length; j++) {

            countData[i].values[j]['normalizedValue'] = countData[i].values[j].mainValue / countData[i].sumOfValues;
            countData[i].values[j]['width'] = countData[i].values[j]['normalizedValue'] * rectWidth;

            if (j==0) {
              countData[i].values[j]['xOfRext'] = 0;
            }
            else{
              countData[i].values[j]['xOfRext'] = countData[i].values[j-1]['width'];
            }
          }

        }

        for (var i = 0; i < countData.length; i++) {
          var counter = 0;
          for (var j = 0; j < countData[i].values.length; j++) {

            counter += countData[i].values[j]['xOfRext'];

            if (j != 0) {
              countData[i].values[j]['xOfRext'] = counter;
            }


          }
        }

        var sortingOrder = [];

        for (var key in rankingQuestion['options_count']) {
          if (rankingQuestion['options_count'].hasOwnProperty(key)) {

            var theChoice = parseInt(key.substr(2, key.length));

            sortingOrder.push( theChoice );

          }
        }



        var question = {

          label: rankingQuestion.label,
          type: rankingQuestion.type,
          data: countData,
          options: questionChoices,
          colors: colors,
          board: sortingOrder
        };


        $scope.questions.push(question);

      }


    });



    // a => 0
    $scope.toCharCode = function(number){
      return String.fromCharCode(97 + number);
    }

    $scope.maxOrdinateFrom2DPointArray = function(input){
      var max = -1;

      if (input.length > 0) {
        for (var i = 0; i < input.length; i++) {
          if (input[i].y > max) {
            max = input[i].y;
          }
        }
      }

      return max;
    }

  }]);

  appModule.controller('OverallAnalyticsController', [ '$scope', function($scope){

    $scope.surveyQuestions = application.surveyQuestions;

  }]);

  var STATIC_URL = '/'

  appModule.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider){
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
    // $routeProvider
    // .when('/survey/:unitid/analysis', {
    //   controller: 'UnitController',
    //   templateUrl: './unit.html'

    // })
    // .when('/survey/:unitid/analysis?parent=true',{
    //   controller: 'HomeController',
    //   templateUrl: './home.html'

    // })

    $routeProvider
    .when('/survey/:unitid/analysis', {
      // controller: function(params){
      //      if(params.parent) {
      //          return 'HomeController';
      //      }
      //      return 'UnitController';
      // },
      templateUrl: function(params){
           if(params.parent) {
               return './home.html';
           }
           return './unit.html';
       }
     })

    .otherwise({
      controller: 'HomeController',
      templateUrl: './home.html'
    })
  }]);

  appModule.filter('getTheMonthName', function(){
    return function(input){
      return application.getTheMonthName(input);
    }
  });

})(window);
