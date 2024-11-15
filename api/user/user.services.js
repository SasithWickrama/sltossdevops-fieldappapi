const ldap = require('ldapjs');
const conn = require('../../config/config.db');
const {ldapAuth} = require("../../auth/auth.login");

const client = ldap.createClient({ url: "ldap://intranet.slt.com.lk"});

module.exports = {
    
    checkUser : (sid, paaswd , callBack)=>{
         conn("select * \n" +
             "from FIELD_MOBILE_USER aa,FIELD_ROLEMODULE_MAP bb\n" +
             "where aa.UROLE_ID = bb.RID\n" +
             "and aa.USID = :USID \n" +
             "order by MID",
             [sid], function(err,data){ //ca

            if (data){
                if (err == 1){
                    return callBack(data,null);
                }
                if (err == 0){
                    if (data ==''){
                        return callBack("Not Authorized", null);
                    }else{
                        console.log("d "+data)
						return callBack(null, data);
                        /*client.bind(sid+"@intranet.slt.com.lk", paaswd, (err) => {
                            if (err) {
                                return callBack(err['lde_message'], null);
                            } else {
                               // return callBack(null, data[0]);
                                return callBack(null, data);
                            }
                        });*/

                    }


                }
            }
        });
    },

};
