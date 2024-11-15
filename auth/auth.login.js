const ldap = require('ldapjs');

const client = ldap.createClient({ url: process.env.LDAP_HOST});

module.exports = {

    ldapAuth : (sid, paaswd , callBack) => {
        client.bind(sid, paaswd, (err) => {
            if (err) {
                return callBack(err['lde_message']);
            } else {
                return callBack(null, "Authentication Successs");
            }
        });
    }

};