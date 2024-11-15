const cus = require("./customer.services");


module.exports = {
    services: (req, res) => {
        const  body = req.body;
        cus.getServices(body.vno, (err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {

                if(results.length  > 0){

                    var voice = 0 , bb= 0 , peo = 0;
                    for(var i=0;i<results.length;i++){
                        if (results[i][2].includes("VOICE")){
                            voice++;
                        }
                        if (results[i][2].includes("INTERNET")){
                            bb++;
                        }
                        if (results[i][2].includes("IPTV")){
                            peo++;
                        }
                    }

                    return res.status(200).json({
                        result: 0,
                        message:"success",
                        data:{
                            "voice":voice,
                            "bb":bb,
                            "peo":peo,
                            "records":results
                        }

                    });

                }else{

                    return res.status(200).json({
                        result: 1,
                        message:"No Result Found",
                    });
                }

            }


        });

    },
    details: (req, res) => {
        const  body = req.body;
        cus.getDetails(body.vno, (err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {
                if(results.length  > 0){
                    const dp = results[3].split("*");
                    const msan = results[4].split("*");
                    return res.status(200).json({
                        result: 0,
                        message:"success",
                        data:{
                            "name":results[0],
                            "type":results[1],
                            "address":results[2],
                            "dp":dp[0],
                            "dplat":dp[1],
                            "dplon":dp[2],
                            "msan":msan[0],
                            "msanlat":msan[1],
                            "msanlon":msan[2],
                        }
                    });

                }else{

                    return res.status(200).json({
                        result: 1,
                        message:"No Result Found",
                    });
                }
            }


        });

    },
    bills: (req, res) => {
        const  body = req.body;
        cus.getBills(body.ano, (err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {
                const pay = results[4].split("*");
                return res.status(200).json({
                    result: 0,
                    message:"success",
                    data:{
                        "invno":results[0],
                        "lastbill":results[1],
                        "charges":results[3],
                        "arreas":results[2],
                        "payon":pay[0],
                        "payamount":pay[1],
                    }
                });
            }


        });

    },
	
	pendingFaults: (req, res) => {
        const  body = req.body;
        cus.getPendingFaults(body.vno, (err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {

                if (results.length > 0) {
                    
                    return res.status(200).json({
                        result: 0,
                        message:"success",
                        data:  // results,
                        {
							'count':results.length,
							'datalist':results,
                            // 'faultno':results[0][0],
                            // 'cleareddate':results[0][1],
                            // 'reporteddate':results[0][2],
                            // 'faultin':results[0][3],
                            // 'causeoffault':results[0][4],
                            // 'natureoffault':results[0][5],
                            // 'outage':results[0][6],
                        }
    
                    });

                } else {
                    
                    return res.status(200).json({
                        result: 1,
                        message:"No Result Found",
                    });
                }
            }
        });

    },

    broadBandUsage: (req, res) => {
        const  body = req.body;
        cus.getBroadBandUsage(body.bbUsername, (err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {
                return res.status(200).json({
                    result: 0,
                    message:"success",
                    data:results
                });
            }
        });
    },
	
	broadBandPwReset: (req, res) => {
        const  body = req.body;
        cus.getBroadBandPwReset(body.circuit, body.action, body.BBpassword,(err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {
                return res.status(200).json({
                    result: 0,
                    message:"success",
                    data:results
                });
            }
        });
    },
	
	
	peoTvBind: (req, res) => {
        const  body = req.body;
        cus.getPeoTvBind(body.peotvUsername, (err, results) => {
            if (err) {
                return res.status(200).json({
                    result: 1,
                    message:err,
                });
            }
            if (results) {
                return res.status(200).json({
                    result: 0,
                    message:"success",
                    data:results
                });
            }
        });
    },

}