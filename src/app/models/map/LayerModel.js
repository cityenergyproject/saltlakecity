define([
  'underscore',
  'backbone',
  'd3',
], function(_, Backbone) {

  var LayerModel = Backbone.Model.extend({

    defaults : {
        
        baseCSS : [
            '{marker-fill: #CCC;',
            'marker-fill-opacity: 0.9;',
            'marker-line-color: #FFF;',
            'marker-line-width: 0.5;',
            'marker-line-opacity: 1;',
            'marker-placement: point;',
            'marker-multi-policy: largest;',
            'marker-type: ellipse;',
            'marker-allow-overlap: true;',
            'marker-clip: false;}'
        ]
    },

    cartoCSS: function(){
      var table_name = this.get('table_name');
      var field_name = this.get('field_name');
      var baseCSS = this.get('baseCSS');
      var dataCSS = [];
      var self = this;

      // may want to put a linear option in LayerModel, will need to rework this if so
      if (this.get('data')){
        var colorRampValues = this.colorRampValues();
        dataCSS = colorRampValues.map(function(color){
          return "#" + table_name + "[" + field_name + ">=" + self.colorMap().invertExtent(color)[1] + "]{marker-fill:" + color + ";}";
        });
      }
      return '#' + table_name + baseCSS.join(['\n']) +'\n' + dataCSS.join(['\n']);

    },

    colorRamp: function(value){ 
      var color = d3.scale.linear()
        .range(this.get('color_range')) //figure out how to do scales with more than 2 colors
        .domain([0, this.get('range_slice_count')]);
      return color(value);
    },

    colorRampValues: function(){
      var self = this;
      var range = Array.apply(null, {length: this.get('range_slice_count')}).map(Number.call, Number)
      return range
        .map(function(value){
          return self.colorRamp(value);
        });
    },

    colorMap: function(){
      return d3.scale.quantile()
        .domain(d3.values(this.get('data')))
        .range(this.colorRampValues());
    },

    distributionData: function(slices){
      if (this.get('data') === undefined) {return undefined;}
      var self = this;

      var data = this.get('data');
      var binMap = d3.scale.linear()
          .domain(d3.extent(data))
          .rangeRound([0, slices-1]);

      var counts = Array.apply(null, Array(slices))
        .map(function(){
          return {count: 0, color: '#CCCCCC'};

        });

      _.each(data, function(value){
        if (value === null) {return;}
        var bin = binMap(value);
        var color = self.colorMap()(value);
        counts[bin].count += 1;
        counts[bin].color = color;
      });
      return counts;
    },

  });

  return LayerModel;

});