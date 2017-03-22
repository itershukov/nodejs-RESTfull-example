/**
 * Created by itersh on 18.01.17.
 */
const Const       = require("../../../../utils/const")
    , Group       = require("../data/group").default
    , crypto      = require('crypto')
    , cryptoHash  = require('crypto').createHash('md5')
    , hash        = cryptoHash.update(Const.account.type.GROUP).digest('hex')


exports.getSchema = ()=>{

    return {
        "description": "Request add new Group or change exist Group ",
        "type": "object",
        "group": Const.account.type.GROUP,
        "content_type":{
            "request":[
                "application/json"
            ],
            "response":[
                "application/json"
            ]
        },
        "format":{
            request: {
                "id": `/request${Const.account.type.GROUP}`,
                "type": "object",
                properties: {
                    title:      Const.regExp.titleString(),
                    permission: Const.regExp.array(),
                    data:       Const.regExp.data(),
                    hash:       Const.regExp.hashString(false)
                }
            },
            response: {
                "id": `/response${Const.account.type.GROUP}`,
                "type": "object",
                properties: {
                    id:         Const.regExp.id(),
                    title:      Const.regExp.titleString(),
                    permission: Const.regExp.array(),
                    data:       Const.regExp.data(),
                    hash:       Const.regExp.hashString()
                }
            }
        },
        hash: hash
    }
}