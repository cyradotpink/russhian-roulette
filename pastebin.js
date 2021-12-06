const https = require('https')

const httpsReq = (options, data = '') =>
  new Promise((resolve, reject) => {
    var req = https.request(options, res => {
      var data = ''
      res.on('error', err => {
        reject(err)
      })
      res.on('data', d => {
        data += d
      })
      res.on('end', () => {
        resolve({
          data: data,
          status: res.statusCode,
          headers: res.headers
        })
      })
    })
    req.write(data)
    req.on('error', err => {
      reject(err)
    })
    req.on('timeout', () => {
      reject(new Error('Timeout'))
    })
    req.end()
  })

let cookie = null
let csrf = null
const getCsrf = async () => {
  if (cookie) return
  const res = await httpsReq('https://pastebin.com')
  cookie = res.headers['set-cookie'][0]
  csrf = res.data.match(/<meta name="csrf-token" content="(?<csrf>.+)">/).groups.csrf
}

const makeFormData = (dict, boundary) => {
  let out = ''
  for (let [key, value] of Object.entries(dict)) {
    out += `--${boundary}\n`
    out += `Content-Disposition: form-data; name="${key}"\n\n`
    out += value
    out += '\n'
  }
  out += '--' + boundary + '--\n'
  return out
}

const post = async (title, content) => {
  await getCsrf()
  const boundary = '-'.repeat(20) + Math.floor(Math.random() * 10 ** 15)
  formData = makeFormData(
    {
      '_csrf-frontend': csrf,
      'PostForm[text]': content,
      'PostForm[format]': '1',
      'PostForm[expiration]': 'N',
      'PostForm[status]': '0',
      'PostForm[is_password_enabled]': '0',
      'PostForm[is_burn]': '0',
      'PostForm[name]': title
    },
    boundary
  )
  const res = await httpsReq(
    {
      method: 'POST',
      host: 'pastebin.com',
      path: '/',
      headers: {
        cookie: cookie,
        'content-type': `multipart/form-data; boundary=${boundary}`
      }
    },
    formData
  )
  if (res.status !== 302) throw new Error('Unexpected status ' + res.status)
  return res.headers.location
}

module.exports = { post }
