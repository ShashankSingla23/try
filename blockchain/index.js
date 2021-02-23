const Block = require("./block");
const { cryptoHash } = require("../util");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");
class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });
    this.chain.push(newBlock);
  }

  replaceChain(chain,validateTransactions ,onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error("the incoming chain must be longer");
      //  console.log('newchain ',chain.length);
      // console.log('blockchain ',this.chain.length);
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error("the incoming chain must be valid");
      return;
    }

    if(validateTransactions && !this.validTransactionData({chain})){
       console.error('the incoming chain has invalid data');
      return;
    }

    if (onSuccess) {
      //console.log('called');
      onSuccess();
    }
    console.log("replacing chain with ", chain);
    this.chain = chain;
  }

  validTransactionData({ chain }) {
    //not static as we need to look our vailable blockchain
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transasctionSet=new Set();
      let rewardTransactionCount = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;
          if (rewardTransactionCount > 1) {
            console.error("miner reward exceeds limit");
            return false;
          }
          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("reward amount is invalid");
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error("invalid transaction");
            return false;
          }
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          });
          if (transaction.input.amount !== trueBalance) {
            console.error("invalid input amount");
            return false;
          }
          if(transasctionSet.has(transaction)){
            console.error('An identical transaction appears more than once in block');
            return false;
          }else{
            transasctionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false; //for === two values should be of same instance
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const { timestamp, lastHash, hash, nonce, difficulty, data } = block;
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty
      );

      if (hash != validatedHash) return false;
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }
    return true;
  }
}
module.exports = Blockchain;
