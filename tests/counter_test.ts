
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.4.2/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';
/*
What we are going to test
get-count returns u0 for principals that have never called into count-up.
get-count returns the number of times a specific principal called into count-up.
count-up increments the counter for the tx-sender as observed by get-count and returns (ok true).
*/
Clarinet.test({
   name: "get-count returns u0 for principals that never called count-up before",
   async fn(chain: Chain, accounts: Map<string, Account>){
       //get the deployer account
       let deployer = accounts.get("deployer");

       // Call the get-count read-only function
       // The first parameter is the contract name, the second is the function name,
       // and the third the function arguments as an array. The final
       // paramenter is the tx-sender.
       let count = chain.callReadOnlyFn("counter", "get-count", [
          types.principal(deployer.address)
       ], deployer.address)

       // Assert that the returned result is a uint with a value of 0 (u0)
       count.result.expectUint(0)
   }
})

Clarinet.test({
    name: "count-up counts up for the tx-sender",
    async fn(chain: Chain, accounts: Map<string, Account>){
       // get the deployer account
       let deployer = accounts.get("deployer")
       
       /**
        * Clarinet simulates the mining process by calling 
        * chain.mineBlock() with an array of transactions. 
        * The contract call transactions themselves are constructed 
        * using the Tx.contractCall(). The Clarinet TypeScript 
        * library provides a lot of helper functions to mine blocks, 
        * construct transactions, and create function arguments.
        *  Inspect the source or see the Clarinet documentation for 
        * a full overview.
        */
       //Mine a block with one transaction
       let block = chain.mineBlock([
            // Generate a contract call to count-up from the deployer address.
            Tx.contractCall("counter", "count-up", [], deployer.address)
       ])

       // Get the first (and only) transaction receipt
       let [receipt] = block.receipts

       //Assert that the returned result is a boolean true.
       receipt.result.expectOk().expectBool(true)

       //Get the counter value
       let count = chain.callReadOnlyFn("counter", "get-count", [
         types.principal(deployer.address)
       ], deployer.address)       

       //Assert that the returned result is a u1
       count.result.expectUint(1)
    }
})

Clarinet.test({
    name: "counters are specific to the tx-sender",
    async fn(chain: Chain, accounts: Map<string, Account>){
        // Get some accounts
        let deployer = accounts.get("deployer")
        let wallet1 = accounts.get("wallet_1")
        let wallet2 = accounts.get("wallet_2")

        //mine a few contract calls to count-up
        let block = chain.mineBlock([
            // The deployer account calls count-up zero times.

            // Wallet 1 calls count-up one time.
            Tx.contractCall("counter", "count-up", [], wallet1.address),

            // Wallet 2 calls count-up two times.
            Tx.contractCall("counter", "count-up", [], wallet2.address),
            Tx.contractCall("counter", "count-up", [], wallet2.address)
        ])

        // Get and assert the counter value for deployer.
        let deployerCount = chain.callReadOnlyFn("counter", "get-count", [
            types.principal(deployer.address)
        ], deployer.address)
        deployerCount.result.expectUint(0)

        // Get and assert the counter value for wallet 1.
        let wallet1Count = chain.callReadOnlyFn("counter", "get-count", [
           types.principal(wallet1.address),
        ], wallet1.address)
        wallet1Count.result.expectUint(1)
  
        // Get and assert the counter value for wallet 2.
        let wallet2Count = chain.callReadOnlyFn("counter", "get-count", [
         types.principal(wallet2.address),
        ], wallet2.address)
        wallet2Count.result.expectUint(2)
    }
})
