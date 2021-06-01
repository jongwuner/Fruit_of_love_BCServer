// require
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json());
const doAsync = (fn) => async (req, res, next) => await fn(req, res, next).catch(next);

var mysql = require('mysql')
var today = new Date()

app.listen(3001, () => {
  console.log(`3001번 port에 http server를 띄웠습니다.`)
})

const doAsync = (fn) => async (req, res, next) => await fn(req, res, next).catch(next);

app.get('/', (req, res) => {
  res.send('express.js로 만든 3001번 server입니다.')
})

var conn = mysql.createConnection({
    host : 'localhost',
    port : '3306',
    user : 'root',
    password : '1234',
    database : 'test'
})

conn.connect()


var getWalletNum = doAsync(async () => {

    var num = 0
    console.log("-지갑 개수 검사")

    querySQL = "SELECT COUNT(*) FROM user"
    await conn.query(querySQL, (error, results, fields) => {
        if(error){
            console.log(error)
            res.send(false)
        }
        var resultArray = Object.values(JSON.parse(JSON.stringify(results)))

        var obj = resultArray[0]
        var first_key = Object.keys(obj)[0];
        var first_value = obj[Object.keys(obj)[0]];
        num += first_value
        console.log('user에서 가져온 NUM값 : ',num)
    })

    querySQL = "SELECT COUNT(*) FROM project"
    await conn.query(querySQL, (error, results, fields)=>{
        if(error){
            console.log(error)
            res.send(false)
        }
        var resultArray = Object.values(JSON.parse(JSON.stringify(results)))

        var obj = resultArray[0]
        var first_key = Object.keys(obj)[0];
        var first_value = obj[Object.keys(obj)[0]];
        num += first_value
        console.log('project에서 가져온 NUM값 : ', num)
    })

    return num
})


var isSameID = doAsync(async(req, res) => {
    console.log('- 중복 ID검사 -')
    var querySQL = "SELECT * FROM user WHERE user_id='"+req.body.id+"'"
    conn.query(querySQL, (error, results, fields)=>{
        if(error){
            console.log('결과 : 중복 검사 중 Error 발생')
            console.log(error)
            res.send(false)
        }
        var resultArray = Object.values(JSON.parse(JSON.stringify(results)))
        console.log(resultArray[0])
        if(resultArray[0] !== undefined){
            console.log('결과 : 중복 아이디가 있습니다.')
            res.send(false)
        }
    })
})


app.get('/dbtest', (req, res) =>{
    conn.query('SELECT * FROM tmptable', (error, results, fields)=>{
        if(error){
            console.log(error)
        }
        console.log(results)
    })
    res.send('db query try')
})

app.post('/login', (req, res) =>{

    console.log('[로그인 시도] 식별 - ' + today.toLocaleString())
    console.log(req.body);
    querySQL = "SELECT * FROM user WHERE user_id='"+req.body.id+"' and user_pw='"+req.body.pw+"'"
    conn.query(querySQL, (error, results, fields)=>{
        if(error){
            console.log(error)
            res.send(false)
        }
        var resultArray = Object.values(JSON.parse(JSON.stringify(results)))
        console.log(resultArray[0])
        if(resultArray[0] === undefined)
            res.send(false)
        else
            res.send(resultArray[0])
    })
})

app.post('/join', 
    doAsync(async(req, res) => {
        console.log('[회원가입 시도] 식별 - ' + today.toLocaleString())
        console.log(req.body);

        // 중복 검사
        if(await isSameID(req, res) === false)
            throw(error)

        // 지갑 개수 가져오기
        var num = await getWalletNum()

        console.log('- ID/PW DB 등록 시작 -')
        querySQL = "INSERT INTO user (user_id, user_pw, name, point, isAdmin, wallet_id) VALUES ('"+req.body.id+"', '"+req.body.pw+"', '"+req.body.name+"', "+0+", "+0+", "+0+")"
        await conn.query(querySQL, (error, results, fields)=>{
            if(error){
                console.log('결과 : ID/PW DB 등록 중 Error 발생')
                console.log(error)
                res.send(false)
            }
            console.log('결과 : ID/PW DB 등록 성공')
            res.send(true)
        })
    })
)

app.get('/axios', (req, res) => {
    console.log("GET 요청이 들어왔습니다")
    res.send('hihi')
})

app.post('/axios', (req, res) => {
    console.log("POST 요청이 들어왔습니다")
    res.send('hoho')
})
