const auth = require('./user.services')

module.exports = {
    login: (req, res) => {
        const  body = req.body;
        console.log(body)
        auth.checkUser(body.sid,body.passwd, (err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {
                console.log(results)
                var arr =[];
                console.log(results.length)
                for(var i=0;i<results.length;i++){
                    arr.push(results[i][7]+"-"+results[i][8] )
                }
                return res.status(200).json({
                    result: 0,
                    message:"success",
                    data:[{
                        "sid":results[0][0],
                        "name":results[0][1],
                        "contact":results[0][2],
                        "module":arr
                    }],
                });
            }


        });

    },

}