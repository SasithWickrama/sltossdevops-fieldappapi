const conn = require("../../config/config.db");
const axios = require('axios');


module.exports = {

    getServices : (vno , callBack)=>{
        conn("select CIRT_NAME, CIRT_DISPLAYNAME,CIRT_SERT_ABBREVIATION,CIRT_STATUS,CIRT_SERV_ID,CIRT_CUSR_ABBREVIATION,CIRT_ACCT_NUMBER,SERV_AREA_CODE,\n" +
            "CASE WHEN CIRT_SERT_ABBREVIATION LIKE 'E-IPTV%'\n" +
            "THEN (SELECT DISTINCT SATT_DEFAULTVALUE  FROM SERVICES_ATTRIBUTES WHERE SATT_SERV_ID = CIRT_SERV_ID AND  SATT_ATTRIBUTE_NAME = 'IPTV_PACKAGE')\n" +
            "WHEN CIRT_SERT_ABBREVIATION LIKE 'BB-INTERNET%'\n" +
            "THEN (SELECT DISTINCT SATT_DEFAULTVALUE  FROM SERVICES_ATTRIBUTES WHERE SATT_SERV_ID = CIRT_SERV_ID AND  SATT_ATTRIBUTE_NAME in ('SA_PACKAGE_NAME', 'BB_PACKAGE_NAME'))\n" +
            "ELSE ''\n" +
            "END AS PKG\n" +
            "FROM \n" +
            "(SELECT C2.CIRT_NAME,C2.CIRT_DISPLAYNAME,C2.CIRT_SERV_ID,C2.CIRT_CUSR_ABBREVIATION,C2.CIRT_ACCT_NUMBER,C2.CIRT_SERT_ABBREVIATION,C2.CIRT_STATUS,S.SERV_AREA_CODE\n" +
            "FROM CIRCUITS C,CIRCUITS C2, CIRCUIT_HIERARCHY CH,CIRCUIT_HIERARCHY CH2, SERVICES S\n" +
            "WHERE C.CIRT_NAME = CH.CIRH_CHILD\n" +
            "AND CH.CIRH_PARENT = CH2.CIRH_PARENT\n" +
            "AND CH2.CIRH_CHILD = C2.CIRT_NAME\n" +
            "AND C2.CIRT_SERV_ID = S.SERV_ID\n" +
            "AND C.CIRT_DISPLAYNAME = :CIRT_DISPLAYNAME \n" +
            "AND CH.CIRH_PARENTORDER = '1'\n" +
            "AND C2.CIRT_STATUS IN ('INSERVICE', 'SUSPENDED')\n" +
            ") ORDER BY CASE WHEN CIRT_SERT_ABBREVIATION LIKE 'V-VOICE%' THEN 1 WHEN CIRT_SERT_ABBREVIATION LIKE 'BB%' THEN 2\n" +
            "WHEN CIRT_SERT_ABBREVIATION LIKE 'E-IPTV%' THEN 3 END",
            [vno], function(err,data){ //callback
                if (data){
                    if (err == 1){
                        return callBack(data,null);
                    }
                    if (err == 0){
                        console.log(data)
                        return callBack(null, data);
                    }
                }
            });
    },

    getDetails : (vno , callBack)=>{
        conn("SELECT  \n" +
            "(SELECT CUSR_NAME  FROM CUSTOMER WHERE CUSR_ABBREVIATION = CIRT_CUSR_ABBREVIATION) ,\n" +
            "(SELECT CUSR_CUTP_TYPE  FROM CUSTOMER WHERE CUSR_ABBREVIATION = CIRT_CUSR_ABBREVIATION ),\n" +
            "(SELECT MAX(ADDE_STREETNUMBER||' '||ADDE_STRN_NAMEANDTYPE||' '||ADDE_SUBURB||' '||ADDE_CITY||' '||ADDE_COUNTRY)\n" +
            "FROM  SERVICES_ADDRESS, ADDRESSES\n" +
            "WHERE CIRT_SERV_ID = SADD_SERV_ID\n" +
            "AND SADD_TYPE = 'BEND'\n" +
            "AND ADDE_ID = SADD_ADDE_ID) ADDRESS,\n" +
            "NVL((SELECT FRAU_NAME||' - '||FRAA_POSITION||'*'||LOCN_X||'*'||LOCN_Y\n" +
            "FROM PORT_LINKS, PORT_LINK_PORTS, FRAME_APPEARANCES, FRAME_UNITS, FRAME_CONTAINERS , LOCATIONS\n" +
            "WHERE PORL_ID = POLP_PORL_ID\n" +
            "AND POLP_COMMONPORT = 'F'\n" +
            "AND POLP_FRAA_ID IS NOT NULL\n" +
            "AND FRAA_ID = POLP_FRAA_ID\n" +
            "AND FRAA_FRAU_ID = FRAU_ID\n" +
            "AND FRAU_FRAC_ID = FRAC_ID\n" +
            "AND LOCN_TTNAME = FRAC_LOCN_TTNAME\n" +
            "AND FRAC_FRAN_NAME IN ('FDP','DP')\n" +
            "AND PORL_CIRT_NAME IN\n" +
            "(SELECT CIRH_PARENT\n" +
            "FROM CIRCUIT_HIERARCHY\n" +
            "WHERE CIRH_CHILD =   CIRT_NAME)),'N/A')  DP,\n" +
            "NVL((SELECT REPLACE(EQUP_LOCN_TTNAME,'-NODE','')||'_'||REPLACE(EQUP_EQUM_MODEL,'-ISL','')||'_'||SUBSTR(EQUP_INDEX,2)\n" +
            "||' - '||PORT_CARD_SLOT||'-'||REPLACE(PORT_NAME,'POTS-IN-','')\n" +
            "||'*'||(select LOCN_X||'*'||LOCN_Y  from LOCATIONS  where LOCN_TTNAME = EQUP_LOCN_TTNAME)\n" +
            "FROM PORTS, EQUIPMENT\n" +
            "WHERE PORT_CIRT_NAME = CIRT_NAME\n" +
            "AND EQUP_EQUT_ABBREVIATION LIKE '%MSAN%'\n" +
            "AND PORT_EQUP_ID = EQUP_ID),'N/A') MSAN\n" +
            "FROM CIRCUITS C \n" +
            "WHERE C.CIRT_DISPLAYNAME = :CIRT_DISPLAYNAME \n" +
            "AND C.CIRT_STATUS IN ('INSERVICE','SUSPENDED')",
            [vno], function(err,data){ //callback
                if (data){
                    if (err == 1){
                        return callBack(data,null);
                    }
                    if (err == 0){
                        console.log(data)
                        return callBack(null, data[0]);
                    }
                }
            });
    },

    getBills : (ano , callBack)=>{
        conn("SELECT *  FROM (SELECT INVOICE_NUM , BILL_DTM -1 , (BALANCE_FWD_MNY - PAYMENTS_MNY )/ 1000 ARREARS ,\n" +
            "(INVOICE_NET_MNY + INVOICE_TAX_MNY )/1000 CHARGES,\n" +
            "(SELECT * FROM (SELECT ACCOUNT_PAYMENT_DAT||'*'|| ACCOUNT_PAYMENT_MNY /1000\n" +
            "FROM GENEVA_ADMIN.ACCOUNTPAYMENT@DBLINK_GENEVA WHERE ACCOUNT_NUM  IN (:ACCOUNT_NUM)\n" +
            "ORDER BY ACCOUNT_PAYMENT_DAT DESC) WHERE  ROWNUM < 2) LST_PAY\n" +
            "FROM GENEVA_ADMIN.BILLSUMMARY@DBLINK_GENEVA WHERE ACCOUNT_NUM  = :ACCOUNT_NUM \n" +
            "ORDER BY  BILL_DTM DESC) WHERE  ROWNUM < 2",
            [ano], function(err,data){ //callback
                if (data){
                    if (err == 1){
                        return callBack(data,null);
                    }
                    if (err == 0){
                        console.log(data)
                        return callBack(null, data[0]);
                    }
                }
            });
    },
	
	getPendingFaults : (vno, callBack)=>{
        conn("SELECT TO_CHAR(PROM_NUMBER)PROM_NUMBER ,to_char(PROM_CLEARED, 'mm/dd/yyyy hh:mi:ss AM') PROM_CLEARED, \n" +
            "to_char(PROM_REPORTED, 'mm/dd/yyyy hh:mi:ss AM')  PROM_REPORTED ,  FAULT_IN, CAUSE_OF_FAULT, NATURE_OF_FAULT, \n" +
            "case when PROM_CLEARED is not null then \n" +
                "trunc((PROM_CLEARED-PROM_REPORTED)) || ' D- ' || \n" +
                "lpad(trunc(mod((PROM_CLEARED-PROM_REPORTED),1)*24), 2,0) || ':' || \n" +
                "lpad(trunc(mod(mod((PROM_CLEARED-PROM_REPORTED),1)*24,1)*60),2,0) ||':' || \n" +
                "lpad(trunc(mod(mod(mod((PROM_CLEARED-PROM_REPORTED),1)*24,1)*60,1)*60),2,0) \n" +
            "else \n" +
                "trunc((sysdate-PROM_REPORTED)) || ' D- ' || \n" +
                "lpad(trunc(mod((sysdate-PROM_REPORTED),1)*24), 2,0) || ':' || \n" +
                "lpad(trunc(mod(mod((sysdate-PROM_REPORTED),1)*24,1)*60),2,0) ||':' || \n" +
                "lpad(trunc(mod(mod(mod((sysdate-PROM_REPORTED),1)*24,1)*60,1)*60),2,0) \n" +
            "end AS OUTAGE, \n" +
            "(PROM_CLEARED-PROM_REPORTED)*24 \n" +
            "FROM OSS_FAULTS.REALTIME_FAULTS@HADWD_DBLINK \n" +
            "WHERE  PROM_CLEARED is null AND CIRT_DISPLAYNAME in (SELECT distinct V.CIRT_DISPLAYNAME \n" +
            "FROM CIRCUITS V , CIRCUITS B , services a ,services d \n" +
            "WHERE V.CIRT_CUSR_ABBREVIATION = B.CIRT_CUSR_ABBREVIATION \n" +
            "AND V.CIRT_ACCT_NUMBER = B.CIRT_ACCT_NUMBER \n" +
            "AND B.CIRT_DISPLAYNAME = :vno \n" +
            "and b.CIRT_SERV_ID = a.SERV_ID \n" +
            "and v.CIRT_SERV_ID = d.SERV_ID \n" +
            "and a.SERV_AREA_CODE = d.SERV_AREA_CODE \n" +
            "AND V.CIRT_DISPLAYNAME LIKE '%'||SUBSTR(B.CIRT_DISPLAYNAME, -6, 6) \n" +
            "AND V.CIRT_STATUS IN ('INSERVICE','SUSPENDED') \n" +
            "UNION \n" +
            "SELECT distinct A.CIRT_SERV_ID \n" +
            "FROM CIRCUITS A ,CIRCUITS F, SERVICES_ATTRIBUTES g , services X ,services Y \n" +
            "WHERE A.CIRT_CUSR_ABBREVIATION = f.CIRT_CUSR_ABBREVIATION \n" +
            "AND A.CIRT_ACCT_NUMBER = F.CIRT_ACCT_NUMBER \n" +
            "AND F.CIRT_DISPLAYNAME = ( \n" +
                "SELECT \n" +
                "CASE WHEN SUBSTR(:vno,0,1) = '0' THEN :vno \n" +
                "ELSE \n" +
                "(SELECT  distinct V.CIRT_DISPLAYNAME \n" +
                        "FROM CIRCUITS  V , CIRCUITS B , SERVICES A ,SERVICES D \n" +
                        "WHERE V.CIRT_CUSR_ABBREVIATION = B.CIRT_CUSR_ABBREVIATION \n" +
                        "AND V.CIRT_ACCT_NUMBER = B.CIRT_ACCT_NUMBER \n" +
                        "AND B.CIRT_DISPLAYNAME = :vno \n" +
                        "AND B.CIRT_SERV_ID = A.SERV_ID \n" +
                        "AND V.CIRT_SERV_ID = D.SERV_ID \n" +
                        "AND A.SERV_AREA_CODE = D.SERV_AREA_CODE \n" +
                        "AND V.CIRT_SERT_ABBREVIATION  IN ( 'V-VOICE COPPER' ,'PSTN') \n" +
                        "AND V.CIRT_DISPLAYNAME LIKE '%'||SUBSTR(B.CIRT_DISPLAYNAME, -6, 6)) \n" +
                        "END FROM DUAL) \n" +
                "AND A.CIRT_SERT_ABBREVIATION = 'AB-CAB' \n" +
                "and A.CIRT_SERV_ID = g.SATT_SERV_ID \n" +
                "and G.SATT_ATTRIBUTE_NAME = 'REGISTRATION ID' \n" +
                "and G.SATT_DEFAULTVALUE LIKE '%'||SUBSTR(F.CIRT_DISPLAYNAME, -6, 6) \n" +
                "and A.CIRT_SERV_ID = X.SERV_ID \n" +
                "and F.CIRT_SERV_ID = Y.SERV_ID \n" +
                "and X.SERV_AREA_CODE = Y.SERV_AREA_CODE \n" +
                "AND A.CIRT_STATUS IN ('INSERVICE','SUSPENDED') \n" +
                "union \n" +
                "SELECT distinct D.CIRT_SERV_ID \n" +
                "FROM CIRCUITS  C, CIRCUIT_HIERARCHY  H, CIRCUITS  D \n" +
                "WHERE H.CIRH_CHILD = C.CIRT_NAME \n" +
                "AND H.CIRH_PARENT = D.CIRT_NAME \n" +
                "AND C.CIRT_DISPLAYNAME = :vno \n" +
                "AND D.CIRT_CUSR_ABBREVIATION = C.CIRT_CUSR_ABBREVIATION \n" +
                "AND D.CIRT_ACCT_NUMBER = C.CIRT_ACCT_NUMBER  \n" +
                "AND D.CIRT_STATUS IN ('INSERVICE','SUSPENDED') ) \n" +
            "UNION \n" +
            "SELECT TO_CHAR(PROM_NUMBER)PROM_NUMBER ,to_char(PROM_CLEARED, 'mm/dd/yyyy hh:mi:ss AM') PROM_CLEARED, \n" +
            "to_char(PROM_REPORTED, 'mm/dd/yyyy hh:mi:ss AM')  PROM_REPORTED , \n" +
            "FAULT_IN, \n" +
            "CAUSE_OF_FAULT, \n" +
            "NATURE_OF_FAULT, \n" +
            "case when PROM_CLEARED is not null then \n" +
                "trunc((PROM_CLEARED-PROM_REPORTED)) || ' D- ' || \n" +
                "lpad(trunc(mod((PROM_CLEARED-PROM_REPORTED),1)*24), 2,0) || ':' || \n" +
                "lpad(trunc(mod(mod((PROM_CLEARED-PROM_REPORTED),1)*24,1)*60),2,0) ||':' || \n" +
                "lpad(trunc(mod(mod(mod((PROM_CLEARED-PROM_REPORTED),1)*24,1)*60,1)*60),2,0) \n" +
            "else \n" +
                "trunc((sysdate-PROM_REPORTED)) || ' D- ' || \n" +
                "lpad(trunc(mod((sysdate-PROM_REPORTED),1)*24), 2,0) || ':' || \n" +
                "lpad(trunc(mod(mod((sysdate-PROM_REPORTED),1)*24,1)*60),2,0) ||':' || \n" +
                "lpad(trunc(mod(mod(mod((sysdate-PROM_REPORTED),1)*24,1)*60,1)*60),2,0) \n" +
            "end AS OUTAGE, \n" +
            "(PROM_CLEARED-PROM_REPORTED)*24 \n" +
            "FROM OSS_FAULTS.REALTIME_FAULTS_DELETE@HADWD_DBLINK \n" +
            "WHERE PROM_CLEARED is null AND CIRT_DISPLAYNAME in (SELECT distinct V.CIRT_DISPLAYNAME \n" +
            "FROM CIRCUITS V , CIRCUITS B , services a ,services d \n" +
            "WHERE V.CIRT_CUSR_ABBREVIATION = B.CIRT_CUSR_ABBREVIATION \n" +
            "AND V.CIRT_ACCT_NUMBER = B.CIRT_ACCT_NUMBER \n" +
            "AND B.CIRT_DISPLAYNAME = :vno \n" +
            "and b.CIRT_SERV_ID = a.SERV_ID \n" +
            "and v.CIRT_SERV_ID = d.SERV_ID \n" +
            "and a.SERV_AREA_CODE = d.SERV_AREA_CODE \n" +
            "AND V.CIRT_DISPLAYNAME LIKE '%'||SUBSTR(B.CIRT_DISPLAYNAME, -6, 6) \n" +
            "AND V.CIRT_STATUS IN ('INSERVICE','SUSPENDED') \n" +
            "UNION \n" +
            "SELECT distinct A.CIRT_SERV_ID \n" +
            "FROM CIRCUITS A ,CIRCUITS F, SERVICES_ATTRIBUTES g , services X ,services Y \n" +
            "WHERE A.CIRT_CUSR_ABBREVIATION = f.CIRT_CUSR_ABBREVIATION \n" +
            "AND A.CIRT_ACCT_NUMBER = F.CIRT_ACCT_NUMBER \n" +
            "AND F.CIRT_DISPLAYNAME = ( \n" +
                "SELECT \n" +
                "CASE WHEN SUBSTR(:vno,0,1) = '0' THEN :vno \n" +
                "ELSE \n" +
                "(SELECT  distinct V.CIRT_DISPLAYNAME \n" +
                        "FROM CIRCUITS  V , CIRCUITS B , SERVICES A ,SERVICES D \n" +
                        "WHERE V.CIRT_CUSR_ABBREVIATION = B.CIRT_CUSR_ABBREVIATION \n" +
                        "AND V.CIRT_ACCT_NUMBER = B.CIRT_ACCT_NUMBER \n" +
                        "AND B.CIRT_DISPLAYNAME = :vno \n" +
                        "AND B.CIRT_SERV_ID = A.SERV_ID \n" +
                        "AND V.CIRT_SERV_ID = D.SERV_ID \n" +
                        "AND A.SERV_AREA_CODE = D.SERV_AREA_CODE \n" +
                        "AND V.CIRT_SERT_ABBREVIATION  IN ( 'V-VOICE COPPER' ,'PSTN') \n" +
                        "AND V.CIRT_DISPLAYNAME LIKE '%'||SUBSTR(B.CIRT_DISPLAYNAME, -6, 6) ) \n" +
                "END FROM DUAL) \n" +
            "AND A.CIRT_SERT_ABBREVIATION = 'AB-CAB' \n" +
            "and A.CIRT_SERV_ID = g.SATT_SERV_ID \n" +
            "and G.SATT_ATTRIBUTE_NAME = 'REGISTRATION ID' \n" +
            "and G.SATT_DEFAULTVALUE LIKE '%'||SUBSTR(F.CIRT_DISPLAYNAME, -6, 6) \n" +
            "and A.CIRT_SERV_ID = X.SERV_ID \n" +
            "and F.CIRT_SERV_ID = Y.SERV_ID \n" +
            "and X.SERV_AREA_CODE = Y.SERV_AREA_CODE \n" +
            "AND A.CIRT_STATUS IN ('INSERVICE','SUSPENDED') \n" +
            "union \n" +
            "SELECT distinct D.CIRT_SERV_ID \n" +
            "FROM CIRCUITS  C, CIRCUIT_HIERARCHY  H, CIRCUITS  D \n" +
            "WHERE H.CIRH_CHILD = C.CIRT_NAME \n" +
            "AND H.CIRH_PARENT = D.CIRT_NAME \n" +
            "AND C.CIRT_DISPLAYNAME = :vno \n" +
            "AND D.CIRT_CUSR_ABBREVIATION = C.CIRT_CUSR_ABBREVIATION \n" +
            "AND D.CIRT_ACCT_NUMBER = C.CIRT_ACCT_NUMBER  \n" +
            "AND D.CIRT_STATUS IN ('INSERVICE','SUSPENDED')) \n" +
            "ORDER BY PROM_REPORTED DESC",
            [vno], function (err,data) {
                if (data){
                    if (err == 1){
                        return callBack(data,null);
                    }
                    if (err == 0){
                        console.log(data);
                        return callBack(null, data);
                    }
                }
            });
    },

    getBroadBandUsage : (bbUsername , callBack)=>{

        const http = axios.create({
            baseURL: process.env.EXTERNAL_API_BASE
        });

        const options = {
            headers: {'Content-Type': 'application/json'}
        };
		
		const data = {
			bbUsername: bbUsername
		};
          
        http.post('bbusage',data, options)
            .then(
                (response) => {
					if(response['data']['data']['0']['status'] = 'success'){
                        console.log(response['data']['data']['0']['message']);
                        return callBack(null, response['data']['data']['0']['message']);
                    }else{
						console.log(response['data']['data']['0']['message']);
                        return callBack(response['data']['data']['0']['message'],null);
                    }
                },
                (error) => {
                    console.log(error);
                    return callBack(error,null);
                }
        );
    },
	
	getBroadBandPwReset : (circuit ,action, BBpassword, callBack)=>{

        const http = axios.create({
            baseURL: process.env.EXTERNAL_API_BASE
        });

        const options = {
            headers: {'Content-Type': 'application/json'}
        };
		
		const data = {
			circuit: circuit,
			action: action,
			BBpassword: BBpassword
		};
          
        http.post('bbpwreset',data, options)
            .then(
                (response) => {
                    console.log(response['data']);
                    return callBack(null, response['data']);
                },
                (error) => {
                    console.log(error);
                    return callBack(error,null);
                }
        );
    },
	
	getPeoTvBind : (peotvUsername , callBack)=>{

        const http = axios.create({
            baseURL: process.env.EXTERNAL_API_BASE
        });

        const options = {
            headers: {'Content-Type': 'application/json'}
        };
		
		const dat = {
			peotvUsername: peotvUsername
		};
          
        http.post('peobindub',dat, options)
            .then(
                (response) => {
                    if(response['data']['data']['0']['status'] == 'success'){
                        if(response['data']['data']['0']['status']['0']['status'] == 'success'){
                            console.log(response['data']['data']['0']['message']);
                            return callBack(null, response['data']['data']['0']['message']);
                        }else{
                            console.log(response['data']['data']['0']['message']['0']['Reason']);
                            return callBack(response['data']['data']['0']['message']['0']['Reason'],null);
                        }
                    }else{
                        return callBack(response['data']['data']['0']['message'],null);
                    }
                },
                (error) => {
                    console.log(error);
                    return callBack(error,null);
                }
        );
    },



};
