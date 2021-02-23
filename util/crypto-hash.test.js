const  cryptoHash = require('./crypto-hash');
describe('crptoHash()',() =>{

it('genertae a SHA-256 hashed output', () =>{
expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
});

it('produce same hash with same input arguments in any order',() =>
{
 expect(cryptoHash('one' ,'two')).toEqual(cryptoHash('two','one'))  ; 
});

it('produce a unique hash when properity have been changed',()=>{
    const foo={};
   // console.log(foo);
    const originalHash=cryptoHash(foo);
    foo['a']='a';
    //console.log(foo);
    expect(cryptoHash(foo)).not.toEqual(originalHash);

})
});