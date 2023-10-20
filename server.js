const express = require('express')
const app = express()
const port = 3000
var cors = require('cors')
app.use(cors())
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname)
    }
  })
  
  const upload = multer({ storage: storage })


app.post('/upload',upload.any(), (req, res) => {
    console.log(req.body)
    console.log(req.files, req.file)
    res.json(req.files)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})