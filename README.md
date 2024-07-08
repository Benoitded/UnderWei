###   UNDERWEI; a P2P Cross-chain Bridge 

![1-intro 1](https://hackmd.io/_uploads/BksW72uwC.png)

I am a new bridge, I come in peace, and am accessible for all. An open-source peer-2-peer bridge is where my label falls. **[Try me!](https://under-wei.vercel.app/)**

---

My bridge is a public good, where autonomy is key to transact.
Through new mechanisms we prevent major security threats.

- I have no on-chain oracle, or any oracle at all outside of our front-end price recommendation.
- I don't use or incentivise a large liquidity pool.
- I utilise EigenLayer AVS to protect our verification.
- I don't mint, burn or lock any tokens.






#### How do I do this?

![Untitled (10)](https://hackmd.io/_uploads/Sylyf2_wC.png)



Our contracts work through a Dutch auction mechanism which incentivices nearterm P2P bridge arbitrage. Here you can pay a premium to have your bridge request taken quicker, or earn a premium by providing the tokens that are requested on various chains.  

Users post their desired amount of tokens to be bridged, alongside a rate they would ideally want, the minimum rate they are willing to accept for their tokens, and the timeframe over which the discount adjust itself linearly. 


### Ex. 1
Alice has 5 ETH on Ethereum and wants to receive 15.000 USDC on Polygon. Alice chooses her offer to be open for 7days at a minimum rate of 14.850 USDC recieved on Polygon.


---

*"Once someone posted their request (ex 1.), others have the ability to arbitrage this request on the destination chain, thus allow the users tokens to be bridged.""*

---

### Ex 1.1
Bob notices almost immediately via the front-end (or directly through the contract) that there is an open standing request for 15.000 USDC on Polygon for 5 ETH on Ethereum. As Bob could use some ETH at a fair price, and needs it now, he swaps the tokens without a profit. **"What a CHAD!"**


### Ex 1.2
After 3,5 days Bob notices that there's an open standing request of 14.925 USDC on Polygon for 5 ETH on Ethereum. Bob decides to take the request by depositing USDC on the requested chain and receives the ETH on Ethereum. Bob earned 75 USD in ETH on Ethereum, and Alice has her USDC on Polygon.

---

*"Once the request has been deposited, **underwei** sends an event to the AVS operators (performers), whom will verify and prove the requirements of the transfers (token identicity, value, auction validation). Once the performer creates the proof, this gets send to the AVS attestors who wil verify this proof based on the task logic."*
**§NEED TO FLESH OUT MORE§**

*"After the verification, **underwei** utilises LayerZero to communicate the finalising/closing of the verified auction on both contracts, and distributing the funds to Alice and Bob, and the operators can claim their fees in the same contract."*
**§NEED TO FLESH OUT MORE§**

---


### Tech Stack

#### AVS Task Summary:


1. Every operator knows who is supposed to send a task in the next block. If the current performer is the operator itself, it performs the task. 

2. We filter the accepted transactions to find the ActionCreated event with the matching auctionId

3. Verify that Auction will be accepted before its expiration
        
4. Verify the P2P agreed exchange price

5. Verify that the tokens to be identical

6. Sign with the current timestamp. This timestamp will be used as the seed for our PRNG smart contract


#### Frameworks and Languages

**Contracts:** Solidity
**Front-End:** next.js
**Restaking:** Eigenlayer, Othentic, AVS WebAPI(Javascript),  TaskPerformer (Javascript)
**Cross-Chain Communication:** LayerZero (Solidity)

---




### Deployments

#### Links
Website:
- [demo](https://under-wei.vercel.app/)

Github: 
- [Front-End](https://github.com/Benoitded/UnderWei)
- [Contracts](https://github.com/Tranquil-Flow/shared-security-hackathon-contracts)

AVS:
- §NEED TO ADD Link§


#### Contract Addresses
*HOLESKY*
**AuctionReward:** [0xafaFB84a52898Efe2CC7412FCb8d999681C61bbc](https://holesky.etherscan.io/address/0xafafb84a52898efe2cc7412fcb8d999681c61bbc#code)
**Dummy WETH:** [0x4cB2a1552a51557aB049A57f58a152fB832B159f](https://holesky.etherscan.io/address/0x4cb2a1552a51557ab049a57f58a152fb832b159f#code)
**Dummy USDC:** [0x1FB7d6C5eb45468fB914737A20506F1aFB80bBd9](https://holesky.etherscan.io/address/0x1FB7d6C5eb45468fB914737A20506F1aFB80bBd9#code)
**BULLET:** [0x357eA97718b13A37555a253d828cE1fda0dD212B](https://holesky.etherscan.io/address/0x357eA97718b13A37555a253d828cE1fda0dD212B#code)
**METROCAR:** [0xF617152555038b91EBF1B7C44c1c2D85270d9033](https://holesky.etherscan.io/address/0xF617152555038b91EBF1B7C44c1c2D85270d9033#code)

*AMOY*
**AuctionReward:** [0xafaFB84a52898Efe2CC7412FCb8d999681C61bbc](https://amoy.polygonscan.com/address/0xafafb84a52898efe2cc7412fcb8d999681c61bbc#code)
**Dummy WETH:** [0x4cB2a1552a51557aB049A57f58a152fB832B159f](https://amoy.polygonscan.com/address/0x4cB2a1552a51557aB049A57f58a152fB832B159f#code)
**Dummy USDC:** [0x1FB7d6C5eb45468fB914737A20506F1aFB80bBd9](https://amoy.polygonscan.com/address/0x1FB7d6C5eb45468fB914737A20506F1aFB80bBd9#code)
**BULLET:** [0x357eA97718b13A37555a253d828cE1fda0dD212B](https://amoy.polygonscan.com/address/0x357eA97718b13A37555a253d828cE1fda0dD212B#code)
**METROCAR:** [0xF617152555038b91EBF1B7C44c1c2D85270d9033](https://amoy.polygonscan.com/address/0xF617152555038b91EBF1B7C44c1c2D85270d9033#code)
  
  
  
  