const app = require('./src/app.js');
require('dotenv').config();
app.get('/',(req,res)=>{
    res.send('hello world')
})
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});