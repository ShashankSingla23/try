const hexToBinary =require('hex-to-binary');     
const Block = require("./block");
const {cryptoHash} =require('../util');
const  {GENESIS_DATA, MINE_RATE}  = require("../config");
describe("Block", () => {
  const timestamp =2000;
  const lastHash = "foo-lasHash";
  const hash = "foo-hash";
  const nonce =1;
  const difficulty=1;
  const data = ["blockchain", "data"];
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty
  });
  it("has a timestamp, lastHash,hash,and data property", () => {
    // expect('1').toEqual('2');
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });
  describe("gensis()", () => {
    const gensisBlock = Block.genesis();
    it("return a Block insatnce", () => {
      expect(gensisBlock instanceof Block).toBe(true);
    });
    it("return the gensis data", () => {
      expect(gensisBlock).toEqual(GENESIS_DATA);
    });
  });
  
  describe("mineBlock()", () => {
    const lastBlock = Block.genesis();
    const data = "mined data";
    const MINE_RATE=1000;
    const minedBlock = Block.mineBlock({ lastBlock, data });
    it("return a Block instance", () => {
      expect(minedBlock instanceof Block).toBe(true);
    });
    it("set lastHash to the hash of the lastBlock", () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });
    it("sets the data", () => {
      expect(minedBlock.data).toEqual(data);
    });
    it("sets the timestamp", () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
  it('cretae a SHA-256 hash based on proper inputs ',() =>{
  expect(minedBlock.hash)
  .toEqual(cryptoHash(
    minedBlock.timestamp,
    minedBlock.nonce,
    minedBlock.difficulty,
    lastBlock.hash,
    data));
  })
  it('sets a hash that matches difficulty level',()=>{
    expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
  });
  it('adjusts the difficulty',() =>{
    const possibleResults =[lastBlock.difficulty-1,lastBlock.difficulty+1];
    expect (possibleResults.includes(minedBlock.difficulty)).toBe(true);
  })
  });
  describe('adjustDifficulty()',() =>{
    it('raise the difficulty for a quickly mined block',() =>{
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp+MINE_RATE-100
      })).toEqual(block.difficulty+1);
    });
    it('lower the difficulty for a slowly mined block',() =>{
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp+MINE_RATE+100
      })).toEqual(block.difficulty-1);
    });
    it('has a lower limit of 1',()=>{
      block.difficulty=-1;
      expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);
    });
  });
});

