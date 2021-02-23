 const crypto =require('crypto');    
           
 const cryptoHash =(...inputs) =>{
  //console.log(inputs['a']);
 // console.log(inputs);
   const hash = crypto.createHash('sha256');
   hash.update(inputs.map(input=> JSON.stringify(input)).sort().join(' '));  //update with data  //????????
   return hash.digest('hex');                         //hash cannot used now 
 };
 module.exports = cryptoHash;