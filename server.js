const http = require('http')
const url = require('url')

// const hostname = '51.75.20.93';
const hostname = '127.0.0.1'
const port = 3000

let userList = []

function userListTimerControl(){
  let now = Date.now()
  for (let i = 0; i < userList.length; i++) {
    if (now - userList[i].lastRequestTime > 10000){
      console.log("AFK", userList[i].name);
      userList.splice(i, 1)
      i--
    }
  }
  console.log("loop", userList);
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
      console.log("getUser(username)", getUser(username));

      if (getUser(username)){
        // User not avaible
        res.end("false")
      }
      else{
        // User avaible
        userList.push({
          name: username,
          lastRequestTime: Date.now(),
          positions: []
        })
        console.log("userList", userList);
        res.end("true")
      }
    }
  }
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})