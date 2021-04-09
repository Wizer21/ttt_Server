const http = require('http')
const url = require('url')

// const hostname = '51.75.20.93';
const hostname = '127.0.0.1'
const port = 3000

let userList = []
let rooms = []

function userListTimerControl(){
  let now = Date.now()
  for (let i = 0; i < userList.length; i++) {
    if (now - userList[i].lastRequestTime > 10000){
      console.log("Kick ", userList[i].name)
      userList.splice(i, 1)
      i--
    }
  }
  setTimeout(() => {
    userListTimerControl()
  }, 10000)
}
userListTimerControl()

function getUser(username){
  for( let user of userList){
    if (user.name == username){
      return user
    }
  }
  return null
}

const server = http.createServer((req, res) => {
  // Allow Cross origin requests
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Request-Method', '*')
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
	res.setHeader('Access-Control-Allow-Headers', '*')

  const url_parts = url.parse(req.url, true).pathname

  if(req.method === 'GET'){
    if(url_parts == '/login'){
      // User connection
      const url_query = url.parse(req.url, true).query
      const username = url_query['username']

      if (getUser(username)){
        // User not avaible
        res.end("false")
      }
      else{
        // User avaible
        userList.push({
          name: username,
          lastRequestTime: Date.now(),
          positions: [],
          mailBox: []
        })
        res.end("true")
      }
    }
    else if (url_parts == "/userlist"){
      res.end(JSON.stringify(userList))
    }
    else if(url_parts == "/update"){      
      const url_query = url.parse(req.url, true).query
      const user = getUser(url_query['username'])
      
      if (user){
        user.lastRequestTime = Date.now()
        if (user.mailBox.length > 0){
          res.end(JSON.stringify(user.mailBox))
        }
        else{
          res.end("clean")
        }
      }
    }
    else if(url_parts == "/invite"){
      const url_query = url.parse(req.url, true).query
      const from = url_query['from']
      const to = getUser(url_query['to'])
      console.log("get invite");

      if(to){
        to.mailBox.push({
          type: "invite",
          from: from,
          since: Date.now()
        })
        res.end("done")
      }
      else{
        res.end("User not found")
      }
    }
    else if (url_parts == "/open"){
      const url_query = url.parse(req.url, true).query
      const p1 = getUser(url_query['p1'])
      const p2 = getUser(url_query['p2'])
      
      if (p1 || p2){
        let id = rooms.length
        rooms.push({
          id: id,
          p1: p1,
          p1: p2
        })
  
        p1.mailBox = [{
          type: "game",
          room: id
        }]
        p2.mailBox = [{
          type: "game",
          room: id
        }]
      }
    }
  }
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})