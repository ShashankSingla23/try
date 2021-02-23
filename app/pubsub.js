const Pubnub = require('pubnub');
const PubNub = require('pubnub');
const uuid =Pubnub.generateUUID();
const credentials = {
    publishKey: 'pub-c-ea5b5c56-27ba-42a1-9cad-cd7c413bddb3',
    subscribeKey: 'sub-c-7a60d5de-27c0-11eb-af2a-72ba4a3d8762',
    secretKey: 'sec-c-ZGJmMjIxMTEtOTY4Yi00YmUwLWFjZmUtMWVkNjQwNTBiMDZh',
    uuid:uuid
  };

const CHANNELS={
    TEST:'TEST',
    BLOCKCHAIN:'BLOCKCHAIN',
    TRANSACTION:'TRANSACTION',  
};


class PubSub{
constructor({blockchain, transactionPool,wallet})
{
    this.pubnub=new PubNub(credentials)
    this.metaPayload = {
      "uuid": this.pubnub.getUUID()}
 
    this.filterExprStr = "uuid != '" +this.pubnub.getUUID()+ "'";
    this.pubnub.setFilterExpression(this.filterExprStr);
    this.blockchain=blockchain;
    this.wallet=wallet;
    this.transactionPool= transactionPool; 

    this.pubnub.subscribe({channels:Object.values(CHANNELS)});

    this.pubnub.addListener(this.listner());
   
}
listner()
{
    return{
        message:messageObject=>{
            const {channel,message}=messageObject;
            console.log(`Message received. Channel: ${channel}. Message: ${message}`);
            const parsedMessage = JSON.parse(message);

        switch(channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage,true,()=>{
              this.transactionPool.clearBlockchainTransactions(
                { chain: parsedMessage }
              );});
          break;
          case CHANNELS.TRANSACTION:
            if (!this.transactionPool.existingTransaction({
              inputAddress: this.wallet.publicKey
            })) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          default:
            return;  
        }
        }
    }
}

publish({channel, message,meta})
{   
    this.pubnub.publish({channel,message,meta});
}

broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
      meta: this.metaPayload 
     
    });
  } 

  broadcastTransaction(transaction) {
 // console.log(this.metaPayload);
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
       meta: this.metaPayload 
    });
  }
}

//const testPubSub=new PubSub();

//testPubSub.publish({channel:CHANNELS.TEST,message:'foo'});
module.exports= PubSub;