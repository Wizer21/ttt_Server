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

function getGame(gameId){
  for (let game of rooms){
    if (gameId == game.id){
      return game
    }
  }
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
        res.writeHead(403)
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
        res.writeHead(200)
        res.end("true")
      }
    }
    else if (url_parts == "/userlist"){
      res.writeHead(200)
      res.end(JSON.stringify(userList))
    }
    else if(url_parts == "/update"){      
      const url_query = url.parse(req.url, true).query
      const user = getUser(url_query['username'])
      
      if (user){
        user.lastRequestTime = Date.now()
        if (user.mailBox.length > 0){
          res.writeHead(200)
          res.end(JSON.stringify(user.mailBox))
        }
        else{
          res.writeHead(404)
          res.end("clean")
        }
      }
    }
    else if(url_parts == "/invite"){
      const url_query = url.parse(req.url, true).query
      const from = url_query['from']
      const to = getUser(url_query['to'])

      if(to){
        to.mailBox.push({
          type: "invite",
          from: from,
          since: Date.now()
        })
        res.writeHead(200)
        res.end("done")
      }
      else{
        res.writeHead(404)
        res.end("User not found")
      }
    }
    else if (url_parts == "/open"){
      const url_query = url.parse(req.url, true).query
      const p1 = getUser(url_query['p1'])
      const p2 = getUser(url_query['p2'])
      
      if (p1 && p2){
        let id = rooms.length
        rooms.push({
          id: id,
          p1: p1,
          p2: p2,
          turn: "red",
          play: []
        })
  
        p1.mailBox = [{
          type: "game",
          player: "red",
          room: id
        }]
        p2.mailBox = [{
          type: "game",
          player: "blue",
          room: id
        }]

        res.writeHead(200)
        res.end("done")
      }
      else{
        res.writeHead(404)
        res.end("user not found")
      }
    }
    else if (url_parts == "/clearGameInvite"){
      const url_query = url.parse(req.url, true).query
      const user = getUser(url_query['username'])
      if (user){
        for (let i = 0; i < user.mailBox.length; i++ ){
          if (user.mailBox[i].type == "game")
          {
            user.mailBox.splice(i, 1)
            res.writeHead(200)
            res.end("done")
            return
          }
        }
      }
      res.writeHead(404)
      res.end("user not found")
    }
    else if (url_parts == "/updateGame"){      
      const url_query = url.parse(req.url, true).query
      const game = getGame(url_query['id'])

      if (game){
        res.writeHead(200)
        res.end(JSON.stringify(game))
      }
      else{        
        res.writeHead(404)
        res.end("none")
      }
    }
    else if (url_parts == "/newPlay"){
      const url_query = url.parse(req.url, true).query
      const game = getGame(url_query['id'])
      const panel = url_query['panel']
      const color = url_query['color']

      console.log("new play", req.url);

      if (game){
        if (color == "red"){
          game.turn = "blue"
        }
        else{
          game.turn = "red"
        }
        console.log("game.turn", game.turn);

        game.play.push({
          color: color,
          panel: panel
        })
        console.log(game);
        res.writeHead(200)
        res.end("done")
      }
      else{        
        res.writeHead(404)
        res.end("game not found")
      }
    }
  }
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})