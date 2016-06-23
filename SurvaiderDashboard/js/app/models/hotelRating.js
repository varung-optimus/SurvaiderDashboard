(function(window){
  function hotelRating(id, name, data){
    this.id = id;
    this.name = name;
    this.data = data;

    this.labels = ['Hotels Rating'];
    // Defaults for graph options
    this.graphOptions = {
        barShowStroke : false,
        showScale: true,
        barDatasetSpacing : 10
    },
    this.colors = ['#B8E986', '#92C4FF', '#B86DF9', '#F4596C', '#F7CC85'];
    this.series = ['Room Service', 'Cleanliness', 'Value For Money', 'Ambience', 'Amenities'];
  }

  window.hotelRating = hotelRating;

})(window);
