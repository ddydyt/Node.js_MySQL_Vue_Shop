const express = require('express');
const app = express();
const mysql = require('mysql');
const formidable = require('formidable')
const jsonwebtoken = require('jsonwebtoken');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'myProject'
})

app.get('/menus', (req, res) => {
    res.json({
        data: [
            {
                "id": 125,
                "authName": '用户管理',
                "path": null,
                "children": [
                    {
                        "id": 110,
                        "authName": '用户列表',
                        "path": 'users',
                        "children": []
                    }
                ]
            },
            {
                "id": 150,
                "authName": '其他管理',
                "path":null,
                "children" : [
                    {
                        id: 151,
                        "authName": '公告管理',
                        "path": 'pubMessage',
                        "children": []
                    }
                ]
            }
            // {
            //     "id": 103,
            //     "authName": '权限管理',
            //     "path": null,
            //     "children": [
            //         {
            //             "id": 104,
            //             "authName": '角色列表',
            //             "path": 'roles',
            //             "children": []
            //         },
            //         {
            //             "id": 111,
            //             "authName": '权限列表',
            //             "path": 'rights',
            //             "children": []
            //         }
            //     ]
            // },
            // {
            //     "id": 101,
            //     "authName": '商品管理',
            //     "path": null,
            //     "children": [
            //         {
            //             "id": 107,
            //             "authName": '商品列表',
            //             "path": null,
            //             "children": []
            //         },
            //         {
            //              "id": 112,
            //             "authName": '分类参数',
            //             "path": null,
            //             "children": []
            //         },
            //         {
            //             "id": 113,
            //             "authName": '商品分类',
            //             "path": null,
            //             "children": []
            //         }
            //     ]
            // },
            // {
            //     "id": 102,
            //     "authName": '订单管理',
            //     "path": null,
            //     "children": [
            //         {
            //             "id": 106,
            //             "authName": '商品列表',
            //             "path": null,
            //             "children": []
            //         }
            //     ]
            // },
            // {
            //     "id": 145,
            //     "authName": '数据统计',
            //     "path": null,
            //     "children": [
            //         {
            //             "id": 105,
            //             "authName": '商品列表',
            //             "path": null,
            //             "children": []
            //         }
            //     ]
            // }
        ],
        meta: {
            msg: '数据获取成功',
            status: 200
        }
    })
})

// 登录
app.post('/login', (req, res) => {
    var form = formidable.IncomingForm();
    form.parse(req, (err, fields, file) => {
        console.log(fields)
        let { mobile, password } = fields;
        connection.query(`select * from user where mobile = '${mobile}' and password = '${password}'`, (err, results) => {
            if (err) return
            if (results.length > 0) {
                const sign = { mobile, password }
                const secretOrPrivateKey = 'This is the Test Key'
                const token = jsonwebtoken.sign(sign, secretOrPrivateKey, { expiresIn: 1000 * 60 * 60 * 10 })
                res.json({
                    meta: {
                        status: 200,
                        msg: '登录并获取token成功!'
                    },
                    token,
                    results
                })
            }
            else {
                res.json({
                    meta: {
                        status: 400,
                        msg: '登录失败!'
                    }
                })
            }
        })
    })
})

// 注册--后台管理系统
app.post('/register', (req, res) => {
    connection.query(`insert into user `, (err, results) => {

    })
})

app.get('/tuijian', (req, res) => {
    connection.query('select * from loupantuijian', (err, results) => {
        if (err) return
        res.json({
            meta: {
                status: 200,
                msg: 'getOK'
            },
            results
        })
    })
})

// 用户信息列表
app.get('/users', (req, res) => {
    var start = (req.query.pagenum - 1) * req.query.pagesize;
    var end = (req.query.pagenum - 1) * req.query.pagesize + req.query.pagesize
    connection.query(`select * from user limit ${start},${end}`, (error, results, fields) => {
        if (error) return
        // for(x in results){
        //     results[x].mg_state = Boolean(results[x].mg_state);
        // }
        connection.query('select * from user', (error2, results2, fields2) => {
            if (error2) return
            res.json({
                data: {
                    users: results,
                    total: results2.length,
                    pagenum: req.query.pagenum
                },
                meta: {
                    status: 200,
                    msg: 'OK'
                }
            })
        })
    })
})

app.get('/newsList', (req, res) => {
    connection.query('select id,title,date_format(time,"%Y-%m-%d") as time,content from news', (err, results) => {
        if (err) return
        var year, month, day = '';
        results.forEach((item, index) => {
            year = item.time.slice(0, 4);
            month = item.time.slice(5, 7);
            day = item.time.slice(8, 10)
            item.time = year + '年' + month + '月' + day + '日';
        })
        res.json({
            meta: {
                status: 200,
                msg: 'getOK'
            },
            results
        })
    })
})
// 公告
app.get('/gonggao', (req, res) => {
    connection.query('select * from gonggao order by id desc limit 1', (err, results) => {
        console.log(results);
        res.json({
            status: 200,
            results
        })
    })
})

// 用户统一注册
app.get('/userInfo', (req, res) => {
    connection.query('select * from user', (err, results) => {
        res.json({
            meta: {
                status: 200,
                msg: 'getOK'
            },
            results
        })
    })
})

// 修改用户信息--微信前台接口
app.post('/alterUserInfo', (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        console.log(fields)
        let { uid, realName, mobile, idCard, location, bank, bankId, bankName } = fields;
        var sql = `update user set realName = '${realName}',mobile = '${mobile}',idCard = '${idCard}',location  = '${location}',bank = '${bank}',bankid = '${bankId}',bankName = '${bankName}' where id = ${uid}`
        connection.query(sql, (err, results) => {
            if (err) return
            res.json({
                status: 200,
                msg: '修改成功!'
            })
        })
    })
})

// 修改用户信息，后台管理系统
app.post('/updateUserInfo', (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        console.log(fields)
        let { id, userName, password, mobile, nickName, realName, idCard, location, bank, bankid, bankName } = fields;
        var sql = `update user set userName = '${userName}',password = '${password}',nickName = '${nickName}',mobile = '${mobile}',realName = '${realName}',idCard = '${idCard}',location = '${location}',bank = '${bank}',bankid = '${bankid}',bankName = '${bankName}' where id = ${id}`
        connection.query(sql, (err, results) => {
            if (err) return
            res.json({
                meta: {
                    status: 200,
                    msg: '修改用户信息成功!'
                },
                results
            })
        })
    })
    // res.json({
    //     meta: {
    //         status: 400,
    //         msg: '修改失败!'
    //     }
    // })
})

// 后台管理系统-添加新用户
app.post('/addUser', (req, res) => {
    const form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        let { userName, password, mobile, nickName, realName, idCard, location, bank, bankid, bankName } = fields;
        var sql = `insert into user (userName,password,nickName,mobile,realName,idCard,location,bank,bankid,bankName) values ('${userName}',${password},'${nickName}','${mobile}','${realName}','${idCard}','${location}','${bank}','${bankid}','${bankName}');`;
        connection.query(sql, (err, results) => {
            if (err) return
            res.json({
                meta: {
                    status: 200,
                    msg: '插入OK'
                }
            })
        })
    })
})

// 删除用户
app.post('/delUserInfo', (req, res) => {
    var form = formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        let { id } = fields;
        connection.query(`delete from user where id = ${id}`, (err, results) => {
            if (err) return
            res.json({
                meta: {
                    status: 200,
                    msg: '删除成功!'
                },
                results
            })
        })
    })
})

app.post('/uploadPic', (req, res) => {
    var form = formidable.IncomingForm();
    form.uploadDir = ''
})

app.listen(3000, () => {
    console.log('OK')
})
