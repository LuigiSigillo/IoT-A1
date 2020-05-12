const { Connection, Request, TYPES } = require("tedious");
const config = require("./config")
const fs = require("fs")
class DBHandler
{
  constructor(){
    this.lista = []
  }
  
  get getLista() {
    return this.lista;
  }
  queryDatabase(querystring) {
    const connection = new Connection(config);

    var singleRecordStructure = {"Id": "", "x": "", "y": "", "z": "", "IsMoving": "", "DateOfArrival": ""}
    connection.on("connect", err => {
        if (err) {
          console.error(err.message);
        } else {

          console.log("Reading rows from the Table...");

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

          request.on("row", columns => {
            var lst = [];
            columns.forEach(column => {
              if (column.metadata.colName =='Id') {
                var tmp = singleRecordStructure;
                tmp.Id = column.value
                lst.push(tmp);
                //console.log("elemento:%j",lst[lst.length-1]);
              }
              else lst[lst.length-1][column.metadata.colName] = column.value
            });
            console.log(lst)
        })
          
          connection.execSql(request);
        }
    });
    
  }

  //To be edited according to the table
  
  


   writeData(data) {
    var table = {"lst": data}
    var json_string = JSON.stringify(table);
    fs.writeFileSync('temp.json', json_string);
    
  }
}

module.exports = DBHandler;