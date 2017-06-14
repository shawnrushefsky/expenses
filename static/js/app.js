var all_expenses = document.getElementById("all_expenses")
var start_date = document.getElementById("start_date")
var end_date = document.getElementById("end_date")
var fileDate = document.getElementById("date")
var reportButton = document.getElementById("reportbutton")
var reportCancel = document.getElementById("reportcancel")
var fileButton = document.getElementById("filebutton")
var fileCancel = document.getElementById("filecancel")
var fileInstructions = document.getElementById("fileinstructions")
var amount = document.getElementById("amount")
var description = document.getElementById("description")

all_expenses.checked = true;
start_date.disabled = true;
end_date.disabled = true;

var currentReport;
var currentData = {}
var editID;
var weekfactor = (1000*60*60*24*7)

function formatDate(date){
  var yr = date.getFullYear()
  var mnth = date.getMonth()+1
  if(mnth < 10){
    mnth = `0${mnth}`
  }
  var day = date.getDate()
  if(day < 10){
    day = `0${day}`
  }
  return yr+"-"+mnth+"-"+day
}

function setDefaultDates(){
  var currentDate = new Date()
  var oneWeekAgo = new Date();
  oneWeekAgo.setDate(currentDate.getDate() - 7)
  var ds = []
  for(var date of [oneWeekAgo, currentDate]){
    ds.push(formatDate(date))
  }

  start_date.value = ds[0]
  end_date.value = ds[1]
  fileDate.value = ds[1]
}

setDefaultDates()

function urlFormat(base, query){
  var q = "?"
  for(var key in query){
    if(query.hasOwnProperty(key)){
      q += key+"="+query[key]+"&"
    }
  }
  return base+q
}

function EditClick(id){
  var d = currentData[id]
  fileInstructions.innerText = "Edit an Expense"
  fileDate.value = d.Datetime
  amount.value = d.Amount
  description.value = d.Description
  fileButton.onclick = editExpense
  editID = id
}

function DeleteClick(id){
  $.ajax({
    url: "/expenses",
    method: "DELETE",
    data: {id: id},
    success: function(r){
      getExpenses()
    }
  })
}

function weekToDate(weekNum){
  return formatDate(new Date(weekNum*weekfactor))
}

function genReport(data){
  var byweek = {}
  function groupweek(value, index, array){
    if(value.Owner === window.myName){
      var d = new Date(value['Datetime']);
      d = Math.floor(d.getTime()/weekfactor);
      byweek[d] = byweek[d] || [];
      byweek[d].push(value);
    }

  }
  data.map(groupweek)
  return byweek;
}

function displayReport(report){
  var data = []
  for(var key in report){
    data.push([Number(key), report[key]])
  }
  data.sort(function(d){return d[0]})
  var report = d3.select("#report")
  report.selectAll('*').remove()
  var title = report.append("h3")
  var total = 0
  report.selectAll('p')
    .data(data)
    .enter()
    .append('p')
    .text(function(d){
      // console.log(d[1])
      var weekSum = 0;
      for(var item of d[1]){
        weekSum += item.Amount
      }
      total += weekSum
      return `Week Starting ${weekToDate(d[0])}: $${weekSum}`
    })
    var titleTxt
    if(!currentReport.all){
      titleTxt = `${window.myName}'s Total (${currentReport.start} to ${currentReport.end}): $${total}`
    }
    else{
      titleTxt = `${window.myName}'s Total Expenses: $${total}`
    }
    title.text(titleTxt)
}

function displayTable(data, columns) {
	var report = d3.select('#allexpenses')
  report.selectAll('*').remove()
  columns = ["Owner"].concat(columns).concat(["Edit", "Delete"])
  var sum = 0
  for(var item of data){

    if(item.Owner === window.myName){
      sum += item.Amount
      item.Edit = {id: item._id}
      item.Delete = {id: item._id}
    }
    currentData[item._id] = item
  }

  // var total = report.append("h3").text(titleTxt)
  var table = report.append('table').attr("class", "report")
	var thead = table.append('thead')
	var	tbody = table.append('tbody');

	// append the header row
	thead.append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
      .attr("width", "130px")
	    .text(function (column) {return column;});

	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
	  .append('tr');

	// create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(function (row) {
	    return columns.map(function (column) {
        return {column: column, value: row[column]}
	    });
	  })
	  .enter()
	  .append('td')
      .style("overflow", "visible")
      .html(function(d){
        if(typeof d.value === "object"){
          return `<button id="${d.value.id}" type="button" class="edit" onclick="${d.column}Click('${d.value.id}')">${d.column}</button>`
        }
        return d.value
      })


  return table;
}

function getExpenses(){
  var formData = {}
  formData[start_date.name] = start_date.value
  formData[end_date.name] = end_date.value
  formData[all_expenses.name] = all_expenses.checked
  currentReport = formData
  var url = urlFormat("/expenses", formData)
  d3.json(url, function(json){
    displayReport(genReport(json))
    displayTable(json, ['Datetime', "Amount", "Description"])
  })
  return false;
}

function getExpenseForm(){
  var formData = {}
  formData[amount.name] = amount.value
  formData[fileDate.name] = fileDate.value
  formData[description.name] = description.value
  return formData
}

function clearExpense(){
  fileInstructions.innerText = "Submit an Expense"
  amount.value = null;
  description.value = null;
}

function submitExpense(){
  formData = getExpenseForm()
  $.post('/expenses', formData, function(r){
    if(r.hasOwnProperty('Owner')){
      clearExpense()
      getExpenses()
    }
  })
}

function editExpense(){
  formData = getExpenseForm()
  formData.id = editID
  $.ajax({
    url: '/expenses',
    method: "PUT",
    data: formData,
    success: function(d){
      getExpenses()
    }
  })

}

all_expenses.onchange = function(){
  start_date.disabled = all_expenses.checked
  end_date.disabled = all_expenses.checked
}
start_date.onchange = function(){
  if(start_date.value > end_date.value){
    end_date.value = start_date.value
  }
}
end_date.onchange = function(){
  if(end_date.value < start_date.value){
    start_date.value = end_date.value
  }
}
reportButton.onclick = getExpenses
reportCancel.onclick = function(){
  var report = d3.select('#allexpenses')
  report.selectAll('*').remove()
}
fileButton.onclick = submitExpense
fileCancel.onclick = clearExpense
