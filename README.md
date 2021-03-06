wemo-chart
==========
Loads a [Google Line Chart](https://google-developers.appspot.com/chart/) from a CSV file generated by a [WeMo Insight Switch](http://www.belkin.com/us/Products/home-automation/c/wemo-home-automation/).  View a live example at http://tigeroakes.com/elec

How to Use
==========
```
request(fileName, chartTitle);
```
**fileName** is a *string* that represents the path to the csv file.  The CSV must use line breaks to seperate rows and commas to seperate columns, like the default file from a WeMo Insight Switch.  

**chartTitle** is a *string* that is used as the title of the line chart.  It will be displayed above the chart and is the eqivalent to changing the "title" property of the chart options.

Set Up
======
Add the following to your `<head>` tag in a website
```
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
<script type="text/javascript">
  google.load("visualization", "1", {packages:["corechart", "table"]});
</script>
```
Either in the head after the previous script, or after the body tag, add `<script src="wemoChart.js"></script>`

Make sure to have a div with the id `chart`.  This ID can be changed in the script configuration.

Configuration
=============

The script offers variables that can be set to change the way the code functions.

lineChartDivId
----------------
**Default configuration:** `var lineChartDivId = 'chart';`

**Purpose:** The ID of the div to place the line chart inside.
lineChartOptions
----------------
**Default configuration:**
```
var lineChartOptions = {
  animation: {
    duration: 300,
    easing: 'linear'
  },
  explorer: { 
    maxZoomIn: 0.1
  },
  hAxis: { 
    title: 'Time',
    titleTextStyle: {
      italic: false
    } 
  },
  vAxis: { 
    title: 'Power Consumed for past 30 mins (kWh)',
    titleTextStyle: {
      italic: false
    }
  },
  legend: { position: 'bottom' }
};
```
**Purpose:** Options for the line chart

**Documentation:** https://google-developers.appspot.com/chart/interactive/docs/gallery/linechart#Configuration_Options

tableDivId
----------
**Default configuration:** `//var tableDivId = null;`

**Purpose:** The ID of the div to place the table chart inside.  If the variable is not declared or is set to null, no table will be created.

tableOptions
----------
**Default configuration:** `//var tableOptions = null;`

**Purpose:** The options of the table chart.  If the variable is not declared or is set to null, no table will be created.

**Documentation:** https://google-developers.appspot.com/chart/interactive/docs/gallery/table#Configuration_Options
