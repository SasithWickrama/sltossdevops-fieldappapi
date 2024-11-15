require ("dotenv").config();
const oracledb = require('oracledb');
oracledb.initOracleClient();
function getConnected(sql, params, callback) {
    oracledb.getConnection(
        {
            user:process.env.DB_USER,
            password:process.env.DB_PASSWD,
            connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST   = 172.25.1.172)(PORT = 1521))(CONNECT_DATA =(SID= clty)))"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                callback(1,err.message);
                return;
            }
            connection.execute(
                sql, params,
                function (err, result) {
                    if (err) {
                        doRelease(connection);
                        callback(1,err.message);
                        return;
                    }
                    //console.log(result.metaData); // [ { name: 'DEPARTMENT_ID' }, { name: 'DEPARTMENT_NAME' } ]
                    //console.log(result.rows);     // [ [ 180, 'Construction' ] ]
                    //module.exports.rows  = result.rows;
                    rows = result.rows;
                    doRelease(connection);
                    callback(0,rows);
                    return;
                });
        });
};

function doRelease(connection) {
    connection.release(function(err) {
            if (err) {
                console.error(err.message);
            }
        }
    );
}

module.exports = getConnected;




