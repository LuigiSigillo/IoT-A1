const { Connection, Request, TYPES } = require("tedious");
const config = require("./config")
const fs = require("fs")
const connection = new Connection(config);

class DBHandler {
  constructor() { }

  read(querystring, socket, isCloud) {
    if (isCloud)
      var singleRecordStructure = { "Id": "", "x": "", "y": "", "z": "", "IsMoving": "", "DateOfArrival": "" }
    else 
      var singleRecordStructure = { "Id": "", "IsMoving": "", "DateOfArrival": "" }
    connection.on("connect", err => {
      if (err) {
        console.error(err.message);
      } else
      console.log("Reading rows from the Table...");

    })

    // Read all rows from table
    const request = new Request(
      querystring,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }
      }
    );
    var lst = []
    request.on("row", columns => {
      //var lst = [];
      columns.forEach(column => {
        if (column.metadata.colName == 'Id') {
          var tmp = singleRecordStructure;
          tmp.Id = column.value
          if (lst.length != 0)
            socket.broadcast.emit('database values cloud=' + isCloud, lst[lst.length - 1]);
          lst.push(tmp);
        }
        else lst[lst.length - 1][column.metadata.colName] = column.value
      });

    })
    connection.execSql(request);
  }



/* var table = { "lst": [] }


function writeData(single_record) {
  var table_parsed = table
  table_parsed['lst'].push(single_record)
  var json_string = JSON.stringify(table_parsed);
  fs.writeFileSync('temp.json', json_string);
}
 */
}


module.exports = DBHandler;