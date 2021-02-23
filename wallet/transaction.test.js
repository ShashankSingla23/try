const Transaction = require("./transaction");
const Wallet = require("./index");
const { verifySignature } = require("../util");
const { REWARD_INPUT, MINING_REWARD } = require("../config");

describe("Transaction", () => {
  let transaction, senderWallet, recipient, amount;
  
  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = "recipient-public-key";
    amount = 50;

    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it("has an id", () => {
    expect(transaction).toHaveProperty("id");
  });

  describe("outputMap", () => {
    it("has an outputMap", () => {
      expect(transaction).toHaveProperty("outputMap");
    });
    it("output amount to the recepient", () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it("outputs remaining balance of senderWallet", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe("input", () => {
    it("has an input", () => {
      expect(transaction).toHaveProperty("input");
    });
    it("has a timestamp in the input", () => {
      expect(transaction.input).toHaveProperty("timestamp");
    });
    it("sets the amount to the senderWallet balance", () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });
    it("sets the `address` to the `senderWallet` `publicKey`", () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it("sign the input", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature,
        })
      ).toBe(true);
    });
  });

  describe("validTransaction()", () => {
    let errorMock;
    beforeEach(() => {
      errorMock = jest.fn();
      global.console.error = errorMock;
    });
    describe("when transaction is valid", () => {
      it("return true", () => {
        expect(Transaction.validTransaction(transaction)).toBe(true);
      });
    });
    describe("when transaction is invalid", () => {
      describe("and a transaction outputMap is invalid", () => {
        it("return false and logs an error", () => {
          transaction.outputMap[senderWallet.publicKey] = 99999;
          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
      describe("and a transaction input signature is invalid", () => {
        it("return false", () => {
          transaction.input.signature = new Wallet().sign("data");
          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });

  describe("update()", () => {
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    describe('and amount is invalid',()=>{
      it('throws an error',()=>{
        expect(()=>{
          transaction.update({
            senderWallet, recipient:'foo',amount:99999
          })
        }).toThrow('Amount exceeds balance');
      });
    });

    describe("and the amount is valid", () => {
      beforeEach(() => {
        originalSignature = transaction.input.signature;
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
        nextAmount = 50;
        nextRecipient = "next-recipinet";
        transaction.update({
          senderWallet,
          recipient: nextRecipient,
          amount: nextAmount,
        });
      });
      
      it("outputs the amount to the next recipient", () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(amount);
      });
  
      it("substracts amount from original sender output amount", () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
          originalSenderOutput - nextAmount
        );
      });
  
      it("maintain a total output that matches the input amount", () => {
        expect(
          Object.values(transaction.outputMap).reduce(
            (total, outputAmount) => total + outputAmount
          )
        ).toEqual(transaction.input.amount);
      });
  
      it("re-sign the transaction", () => {
        expect(transaction.input.signature).not.toEqual(originalSignature);
      });

      describe('and another update for the same recipient',()=>{
        let addedAmount;
        beforeEach(()=>{
          addedAmount=80;
          transaction.update({
            senderWallet,recipient:nextRecipient,amount:addedAmount
          });
        });
        it('adds to the recipient amount',()=>{
          expect(transaction.outputMap[nextRecipient])
          .toEqual(nextAmount+addedAmount);
        }); 
        it('substarct amount from original sender output amount',()=>{
          expect(transaction.outputMap[senderWallet.publicKey])
          .toEqual(originalSenderOutput-nextAmount-addedAmount)
        });

      });
    });
    
  });

  describe('rewardTransaction()',()=>{
    let rewardTransaction,minerWallet;
    beforeEach(()=>{
      minerWallet=new Wallet();
      rewardTransaction=Transaction.rewardTransaction({minerWallet});
    });
    it('create a trasnaction with the reward input',()=>{
      expect(rewardTransaction.input).toEqual(REWARD_INPUT);
    });
    it('create one transaction for the miner with the `MINING_REWARD`',()=>{
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
    })
  })
});
