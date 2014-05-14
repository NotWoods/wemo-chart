/*
 * WeMo CSV file to Google Line Chart
 *
 * BEFORE USING:
 * Add the following script tags to the <head> before wemoChart.js
 *     <script type="text/javascript" src="https://www.google.com/jsapi"></script>
 *     <script type="text/javascript">
 *           google.load("visualization", "1", {packages:["corechart", "table"]});
 *     </script>
 * 
 * Use request(fileName, chartTitle);
 *     fileName is the CSV file you want to parse
 *     chartTitle is the name of the chart, it will be displayed above the chart in the HTML page
 *
 * Example usage:
 *     request('data.csv', 'WeMo Power Data');
 *
 * Author: Tiger Oakes
 *     +TigerOakes, @Not_Woods, github.com/NotWoods
 */

/* 
 * Script settings
 * Use the defaults or change them as you like
 * More info in the git's README.md
 */

//ID of the div you want the line chart inside
var lineChartDivId = 'chart';
//Options for the line chart
//See: https://google-developers.appspot.com/chart/interactive/docs/gallery/linechart#Configuration_Options
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
    },
    viewWindow: {
      max: 0.2,
      min: 0
    }
  },
  series: {
    0: { 
      color: '#000000',
      lineWidth: 5,
      lineDashStyle: [4,1]
    }
  },
  legend: { position: 'bottom' }
};

//ID of the div you want the table chart inside
//If not set, no table will be created
  //var tableDivId = null;
//Table chart options.  If not set, no table will be created.
//See: https://google-developers.appspot.com/chart/interactive/docs/gallery/table#Configuration_Options
  //var tableOptions = null;

/* 
 * End of settings 
 */

//The hourDefs array specifies the 30 minute segments that the WeMo data is matched to
//If the time of the WeMo data is not in here (ie 2:24) it will not be included.
var hourDefs = [
  "23:59", "0:30",
  "1:00","1:30",
  "2:00","2:30",
  "3:00","3:30",
  "4:00","4:30",
  "5:00","5:30",
  "6:00","6:30",
  "7:00","7:30",
  "8:00","8:30",
  "9:00","9:30",
  "10:00","10:30",
  "11:00","11:30",
  "12:00","12:30",
  "13:00","13:30",
  "14:00","14:30",
  "15:00","15:30",
  "16:00","16:30",
  "17:00","17:30",
  "18:00","18:30",
  "19:00","19:30",
  "20:00","20:30",
  "21:00","21:30",
  "22:00","22:30",
  "23:00","23:30"
]

//The title variable is a global variable that will be set as the chart title.
var title;

/*
  The "request" function starts the program.  
  It uses XMLHttpRequest to load the data file, which is then parsed
  by the formatTable function later. The buttons in the website
  trigger this function, passing a filename (ie: microwave.csv) and
  a chart name (ie: White Microwave)
*/
function request(file, chartName) {
  //Set up a new XMLHttpRequest
  //A XHR is used to access files in JavaScript, like the csv data files
  var rq = new XMLHttpRequest();
  //Set the chart title based on whatever name was given to the funtion.
  title = chartName;
  //Open the XHR and request the variable 'file'
  rq.open('GET', file, true);
  //Once the request is done, activate the formatTable function
  rq.onload = formatTable;
  //Start the request
  rq.send();
}

/*
  The formatTable function takes the csv file and turns
  it into an array that Google Charts will use later.
*/
function formatTable() {
  //formattedChart will store the chart and some extra data
  var formattedChart = new Object();

  //The function csvParse will turn the csv file into an array
  var table = csvParse(this.responseText);
  
  //The energyDataRow variable looks for whichever row contains the words 'Energy Data'
  //it will be used later to strip out some unneeded data
  var energyDataRow;

  //Loops through the array until it finds the text 'Energy Data'
  for (var i = 0; i < table.length; i++) {
    if (table[i][0].indexOf("Energy Data") > -1) {
      energyDataRow = i;
      break;
    }
  }
  
  //Remove all rows, up to and including "Energy Data" and "Date & Time,Power Consumed for past 30 mins (kWh)""
  table.splice(0, energyDataRow + 2);
  for (var i = 0; i < table.length; i++) {
    var date = new Date(table[i][0]);
    table[i][0] = date;
  }
  //With the unwanted data stripped away, set the sourceCode property to contain the original file
  formattedChart.sourceCode = table;

  //Prep 2D array
  formattedChart.averageSource = [];
  for (var i = 0; i < hourDefs.length; i++) {
    formattedChart.averageSource[i] = [];
  }

  for (var i = 0; i < formattedChart.sourceCode.length; i++) {
    //Turn the time in the original table into a hour:minute format to match with hourDefs
    var time = formattedChart.sourceCode[i][0].getHours() + ':' + formattedChart.sourceCode[i][0].getMinutes();
    if (formattedChart.sourceCode[i][0].getMinutes() == 0) {
      time = formattedChart.sourceCode[i][0].getHours() + ':0' + formattedChart.sourceCode[i][0].getMinutes();
    }

    var index = hourDefs.indexOf(time);
    if (index != -1) {
      formattedChart.averageSource[index].push(formattedChart.sourceCode[i][1]);
    }
  }

  formattedChart.average = [];
  for (var i = 0; i < formattedChart.averageSource.length; i++) {
    var total = 0;
    for (var j = 0; j < formattedChart.averageSource[i].length; j++) {
      total += parseFloat(formattedChart.averageSource[i][j]);
    }

    formattedChart.average[i] = [hourDefs[i], total/formattedChart.averageSource[i].length];
  }

  formattedChart.full = [];
  formattedChart.full[0] = ["Time"];
  for (var i = 0; i < hourDefs.length; i++) {
    formattedChart.full[i + 1] = [hourDefs[i]];
  }

  for (var i = formattedChart.sourceCode.length - 2; i >= 0; i--) {
    var noTime = new Date(formattedChart.sourceCode[i][0].getFullYear(), 
        formattedChart.sourceCode[i][0].getMonth(), 
        formattedChart.sourceCode[i][0].getDate());
    var column = -1;
    for (var j = 1; j < formattedChart.full[0].length; j++) {
      if (noTime.toDateString() == formattedChart.full[0][j].toDateString()) {
        column = j;
        break;
      }
    }
    if (column == -1) {
      column = formattedChart.full[0].push(noTime);
      column -= 1;
    }
    var time = formattedChart.sourceCode[i][0].getHours() + ':' + formattedChart.sourceCode[i][0].getMinutes();
    if (formattedChart.sourceCode[i][0].getMinutes() == 0) {
      time = formattedChart.sourceCode[i][0].getHours() + ':0' + formattedChart.sourceCode[i][0].getMinutes();
    }
    for (var j = 0; j < formattedChart.full.length; j++) {
      if (formattedChart.full[j][0] == time) {
        formattedChart.full[j][column] = parseFloat(formattedChart.sourceCode[i][1]);
        break;
      }
    }
  }

  var reCheckColumn = formattedChart.full[0].length;
  for (var j = 1; j < formattedChart.full.length; j++) {
    if (formattedChart.full[j].length < reCheckColumn) {
      var blankSpaceAmount = reCheckColumn - formattedChart.full[j].length;
      for (var k = 0; k < blankSpaceAmount; k++) {
        formattedChart.full[j].push(null);
      }
    }
  }

  //Insert the average line
  formattedChart.full[0].splice(1, 0, "Average");
  for (var k = 0; k < formattedChart.average.length; k++) {
    formattedChart.full[k+1].splice(1, 0, formattedChart.average[k][1]);
  }

  loadChart(formattedChart.full, title); 
}

function csvParse(string) {
  if (string == null) {return;}

  var array = string.split("\n");
  for (var i = 0; i < array.length; i++) {
    var array2d = array[i].split(",");
    array[i] = array2d;
  }
  return array;
}

function loadChart(chartArray, title) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Time');
  data.addColumn('number', 'Average');
  for (var i = 2; i < chartArray[0].length; i++) {
    var dateString;
    dateString = chartArray[0][i].getMonth()+1 + '/' + chartArray[0][i].getDate() + '/' + chartArray[0][i].getFullYear() + ' Power';
    data.addColumn('number', dateString);
  }
  for (var i = 2; i < chartArray.length; i++) {
    data.addRow(chartArray[i]);
  }

  lineChartOptions.title = title;

  var chart = new google.visualization.LineChart(document.getElementById(lineChartDivId));
  chart.draw(data, lineChartOptions);

  if (tableDivId != null && tableOptions != null) {
    var table = new google.visualization.Table(document.getElementById(tableDivId));
    table.draw(data, tableOptions);
  }

  /* Uncomment this code if you have three checkboxes on your website to set.
     This code will filter the chart to only show weekdays, only show work hours,
     or only show the average line.

  var weekBox = document.getElementById("week");
  var hourBox = document.getElementById("hour");
  var averageBox = document.getElementById("average");
  weekBox.addEventListener('change', changeView, false);
  hourBox.addEventListener('change', changeView, false);
  averageBox.addEventListener('change', changeView, false);

  var allColumnIndexs = [0,1];
  var weekday = [0, 1];
  for (var i = 2; i < chartArray[0].length; i++) {
    if (chartArray[0][i].getDay() != 0 && chartArray[0][i].getDay() != 6) {
      weekday.push(i);
    }
    allColumnIndexs.push(i);
  }
  function changeView()
  {
    var view = new google.visualization.DataView(data);

    if (averageBox.checked) {
      view.setColumns([0, 1]);
    } else if (weekBox.checked) {
      view.setColumns(weekday);
    } else {
      view.setColumns(allColumnIndexs);
    }

    if (hourBox.checked) {
      view.setRows(17, 31);
    } else {
      view.setRows(0, 46);
    }
    chart.draw(view, options);
  }

  changeView();
  */
}

request('microwave.csv', 'White Microwave');