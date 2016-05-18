(function(window){

  //Constructor
  function app(){
    this.features = [];
    //this.questions = [];
    this.units = [];
    this.ratingPoints = [];
    this.surveyQuestions = [];
    this.meta = {};
    this.colors = ['#B8E986', '#92C4FF', '#B86DF9', '#F4596C', '#F7CC85'];
    this.sentiments = [];
    this.totalRespondents = [];
    this.companyName = [];
    this.unitName = [];
  }

  //Initializer
  app.prototype.init = function(data){

    var self = this;
    // console.log("init called ....");

    /* Uses Class :: feature
    * Constructor(Number id, String label)
    */

    self.features = [];
    self.setFeaturesData(data['parent_survey']['responses'][0]['options_code']);
    self.setFeaturesScore(data['parent_survey']['responses'][0]['avg_rating']);
    self.setRatingData(data['parent_survey']['responses'][1]['timed_agg']);
    self.setSentimentsData(data['parent_survey']['sentiment']);
    self.setTotalRespondents(data['parent_survey']['responses'][0]['total_resp']);
    self.setCompanyName(data['parent_survey']['meta']['company']);
    self.setUnitName(data['parent_survey']['meta']['unit_name']);
    // self.unitName = data['parent_survey']['meta'].unit_name;
    // alert(self.unitName);

    self.TIMEDAGGR = data['parent_survey']['responses'][1]['timed_agg'];
    self.TIMEDAGGR = Object.keys(self.TIMEDAGGR);

    var l = self.TIMEDAGGR[0],
        h = self.TIMEDAGGR[self.TIMEDAGGR.length - 1];


    var secondsL = new Date(l).getTime(),
        secondsH = new Date(h).getTime();

    self.dates = [];
    self.dates.push(new Date(l).getTime());
    while (secondsL < secondsH) {
      secondsL += 60*60*24*1000;
      self.dates.push( new Date(secondsL).getTime() );
    }

    /* Uses Class :: unit
    * Constructor(Number id, String name, Number overallScore)
    */
    self.units = [];

    if (data['parent_survey']['meta']['unit_name'] == "Parent Survey"){
      data.units.forEach(function(u, idx){
        var tempUnit = new unit(idx+1, u['meta'].unit_name, u['responses'][1].avg_rating);

        tempUnit.setFeaturesData(u['responses'][0].avg_rating);

        self.units.push(tempUnit);
      });
    }
  }

  app.prototype.getTheMonthName = function(index){

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

    return months[index % months.length];
  }

  app.prototype.setSentimentsData = function(sentiments){
    var self = this;
    self.sentiments=[];
    function ucfirst(name) {
    //return field.value.substr(0, 1).toUpperCase() + field.value.substr(1);
    name = name.toUpperCase().charAt(0) + name.substring(1)
    return name;
    }
    //this.sentiments = sentiments;
    var countData = [],
        questionOptions = [],
        barColorsForAllBars = {
          'negative': '#FB6577',
          'positive': '#A2EB52',
          'neutral': '#DDDDDD'
        },
        graphData={};

        for (var vendor in sentiments) {
            countData = [];
            questionOptions = [];
            for(var sentiment in sentiments[vendor]){
                if (sentiments[vendor].hasOwnProperty(sentiment)) {
                    countData.push([sentiments[vendor][sentiment]] );
                    if (sentiment == 'negative') {
                      questionOptions.push("Negative :" + sentiments[vendor][sentiment]);
                    }
                    else if (sentiment == 'positive') {
                      questionOptions.push("Positive :" + sentiments[vendor][sentiment]);
                    }
                    else if (sentiment == 'neutral') {
                      questionOptions.push("Neutral :" + sentiments[vendor][sentiment]);
                    }
                }
            }
            graphData={
                label: vendor,
                data: countData,
                options: [],
                series: ['Negative', 'Neutral', 'Positive'],
                graphOptions: {
                    barShowStroke : false,
                    showScale: false,
                    barDatasetSpacing : 10
                },
                colors: [
                         {'fillColor': barColorsForAllBars['negative']},
                         {'fillColor': barColorsForAllBars['neutral']},
                         {'fillColor': barColorsForAllBars['positive']}
                        ]
            };
            
        this.sentiments.push(graphData);
        // console.log(graphData);
    }
  }
  
  app.prototype.setFeaturesData = function(featuresData){
    var self = this;
    var index = 0;

    for (var prop in featuresData) {
      if( featuresData.hasOwnProperty( prop ) ) {
        self.features.push({ id: (index+1), label: featuresData[prop] });
      }
      index++;
    }
  }

  app.prototype.setFeaturesScore = function(featuresData){
    var self = this;
    var index = 0;

    for (var prop in featuresData) {
      if( featuresData.hasOwnProperty( prop ) ) {
        self.features[index]['score'] = featuresData[prop];
      }
      index++;
    }
  }

  app.prototype.setTotalRespondents = function(totalresp){
    var self = this;
    self.totalRespondents = totalresp;
  }

  app.prototype.setUnitName = function(unit_Name){
    var self = this;
    self.unitName = unit_Name;
  }

  app.prototype.setCompanyName = function(company_Name){
    var self = this;
    self.companyName = company_Name;
  }

  app.prototype.setRatingData = function(featuresData){
    var self = this;
    var index = 0;

    self.ratingPoints = [];

    for (var prop in featuresData) {
      if( featuresData.hasOwnProperty( prop ) ) {
        self.ratingPoints.push({ label: prop, x: index, y: featuresData[prop]});
      }
      index++;
    }

  }

  //Testing Functions
  app.RandomizeTheData = function(array, keyName){
    array.forEach(function(point){

      point[keyName] = parseInt(point[keyName] * Math.random());

    });
  }

  window.myapp = app;


})(window);
