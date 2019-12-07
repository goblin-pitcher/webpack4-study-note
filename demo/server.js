const express = require('express')
const app = express()
const webpack = require('webpack')
const config = require('./build/webpack.config.js')
const middleware = require('webpack-dev-middleware')
const compiler = webpack(config)
app.use(middleware(compiler))
app.listen(8080)
app.get('/api/name',(req,res)=>{
    res.json({name:'goblin'})
})
app.get('/name',(req,res)=>{
    res.json({name:'pitcher'})
})