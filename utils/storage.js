/**
 * Created by itersh on 02.01.17.
 */

const utils  = require('./utils')
    , l      = require('../logger/logger')
    , conf   = require('./conf')
    , labels = ["STORAGE"]

exports.putGroupIntoDB = (src) => {
    return new Promise((res, rej) =>{
        let query = ``;
        if (src.id){
            query = `SELECT * FROM update_group(
                            ${src.id}
                            '${src.type}'
                            '${src.title}'
                            ${src.avatar}
                            '${src.permission}'
                            ${src.createTS}
                            '${src.data}'
                            ${src.active}
                        AS id;`
        } else{
            query = `SELECT * FROM add_group(
                            ${src.id}
                            '${src.type}'
                            '${src.title}'
                            ${src.avatar}
                            '${src.permission}'
                            ${src.createTS}
                            ${src.changeTS}
                            '${src.data}'
                            ${src.active}
                        AS id;`
        }

        l.info(query);

        submitQuery(query, (err, result)=>{
            if (err){
                rej(err);
                return;
            }

            if (result.rows.length){
                l.info(labels, `Success put group: ${result.rows[0].id}`)

                res(result.rows[0].id)
            } else{
                let e = `Can't put group. Err: ${JSON.stringify(src)}`
                l.wrn(labels, e)
                rej(e);
            }
        })
        }
    )
}

exports.getGroupByID = getGroupByID;

function getGroupByID(id){
    return new Promise((res, rej) => {
        let query = `SELECT * FROM groups WHERE id=${id}`;
        submitQuery(query,  (err, result)=>{
            if ( err == null){
                l.info(labels, `Success put group: ${result.rows[0].id}`)

                res(result.rows[0].id)
            } else {
                l.wrn(labels, err)
                rej(err);
            }
        });
    })
}

function submitQuery(query, onResult) {

    conf.isTraceMode() && l.trace(labels, query);
    pool.query(query, function (err, result) {

        if (err != null) {
            l.err('Error running query ' + err + ' query: ' + query);
            onResult(err);
            return;
        }
        conf.isDebugMode() && l.dbg(labels, JSON.stringify(result.rows));

        onResult(null, result);
    });
}