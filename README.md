###   UNDERWEI
*A P2P Cross-chain Bridge*

---

![1-intro 1](https://hackmd.io/_uploads/BksW72uwC.png)

> *I am a new bridge, I come in peace, and am accessible for all. An open-source peer-2-peer censorship-resistant bridge is where my label falls.*

**[Try me!](https://under-wei.vercel.app/)**

---

**Underwei** is a public good AVS bridge, where autonomy is key to transact. Through new mechanisms we prevent major security threats.

- I have no on-chain oracle, or any oracle at all outside of our front-end price recommendation.
- I don't use or incentivise a large liquidity pool.
- I utilise EigenLayer AVS to protect our verification.
- I don't mint, burn or lock any tokens.






## How do I do this?

<img width="2482" alt="Untitled (11)" src="https://github.com/Benoitded/UnderWei/assets/101796507/eb310754-7870-42bf-996f-38481e925962">



**Underwei** contracts work through a Dutch Auction mechanism which incentivices nearterm P2P bridge arbitrage. Here you can pay a premium to have your bridge request taken quicker, or earn a premium by providing the tokens that are requested on various chains.  

Users post their desired amount of tokens to be bridged, alongside a rate they would ideally want, the minimum rate they are willing to accept for their tokens, and the timeframe over which the discount adjust itself linearly. 


### Ex. 1
Alice has 5 $ETH on Ethereum and wants to receive 15.000 $USDC on Polygon. Alice chooses her offer to be open for 7days at a minimum rate of 14.850 $USDC recieved on Polygon.

> *Once someone posted their request (ex 1.), others have the ability to arbitrage this request on the destination chain, thus allow the users tokens to be bridged.*



### Ex 1.1
Bob notices almost immediately via the front-end (or directly through the contract) that there is an open standing request for 15.000 $USDC on Polygon for 5 $ETH on Ethereum. As Bob could use some $ETH at a fair price, and needs it now, he swaps the tokens without a profit. **"What a CHAD!"**


### Ex 1.2
After 3,5 days Bob notices that there's an open standing request of 14.925 $USDC on Polygon for 5 $ETH on Ethereum. Bob decides to take the request by depositing $USDC on the requested chain and receives the $ETH on Ethereum. Bob earned 75 USD in $ETH on Ethereum, and Alice has her $USDC on Polygon.

> *Once the request has been deposited, **underwei** triggers an event sent to the AVS performers. THese performers are responsible for verifying and proving the requirements of the transfers. This verification process ensures:*
> - ***Wether tokens are identical, and their value:** They confirm both sides of the transfer involve the exact same type and amount of cryptocurrency.*
> - ***Auction validation:** They cryptographically prove that the swap adheres to the timeframe and exchange rate the user specified during the Dutch Auction.*


*Essentially, upon request fulfillment, **underwei** initiates a process where independent AVS performers validate the transaction. This validation includes checking the identity and value of the tokens being transferred, along with cryptographic verification that the swap aligns with the user's auction parameters.*



> *Once the AVS performers complete their verification and cryptographic proofs, **underwei** leverages Layer Zero, an interoperability protocol. Layer Zero allows **underwei** to securely communicate across different blockchains. In this case, **underwei** utilizes Layer Zero to:*
> - ***Broadcast the verified auction closure:** Underwei transmits a message to both involved contracts (on seperate chains) confirming the successful verification of the auction.*
> - ***Facilitate fund to distribution:** Underwei initiates the transfer of funds on both chains. Alice recieves her desired tokens (e.g., $USDC), and Bob recieves his desired tokens (e.g., $ETH).*
> - ***Enable operator fee collection:** Within the same contract, **underwei** allows the AVS performers who verified the transaction to claim their designated fees.*


*Essentially, after the AVS verification, **underwei** utilizes Layer Zero to finalise the auction across both chains. This involves notifying both contracts, facilitating the secure transfer of funds between Alice and Bob, and enabling the AVS performers to claim their respective fees - all within a single, streamlined process.*


## Tech Stack

#### AVS Task Summary:
**1.** The performer is elected through a round robin mechanism, this is the blocknumber modulor the number of operators

**2.** The performer will listen to the network, and everytime an event is emitted the performer runs the task logic. This latter consists of verifying the ability of creation of the transaction.  (variable; txAccepted)
  
- Verify that Auction will be accepted before its expiration
        
- Verify the P2P agreed exchange price

- Verify that the tokens to be identical

**4.** The performer sends his result to the attestors network. All the validators will simulate the tx in their turn. And verify if they have the same output. 

**5.** If more than 66% of the network agree, then the task is valid and executed on chain. 



## Frameworks and Languages

**Contracts:** Solidity

**Front-End:** next.js

**Restaking:** Eigenlayer, Othentic, AVS WebAPI (Javascript),  TaskPerformer (Javascript)

**Cross-Chain Communication:** LayerZero (Solidity)

---




## Deployments

#### Website
- [vercel](https://under-wei.vercel.app/)

#### Presentation
- [slides](https://github.com/Benoitded/UnderWei/blob/main/SLIDES.md)

#### Github
- [Front-End](https://github.com/Benoitded/UnderWei)
- [Contracts](https://github.com/Tranquil-Flow/shared-security-hackathon-contracts)

#### AVS
- [github](https://github.com/asanson1404/underwei-AVS)

#### Contract Addresses (HOLESKY)

- [AuctionReward](https://holesky.etherscan.io/address/0xafafb84a52898efe2cc7412fcb8d999681c61bbc#code)

- [Dummy $WETH](https://holesky.etherscan.io/address/0x4cb2a1552a51557ab049a57f58a152fb832b159f#code)

- [Dummy $USDC](https://holesky.etherscan.io/address/0x1FB7d6C5eb45468fB914737A20506F1aFB80bBd9#code)

- [BULLET](https://holesky.etherscan.io/address/0x357eA97718b13A37555a253d828cE1fda0dD212B#code)

- [METROCAR](https://holesky.etherscan.io/address/0xF617152555038b91EBF1B7C44c1c2D85270d9033#code)

##### Contract Addresses (AMOY)

- [AuctionReward](https://amoy.polygonscan.com/address/0xafafb84a52898efe2cc7412fcb8d999681c61bbc#code)

- [Dummy $WETH](https://amoy.polygonscan.com/address/0x4cB2a1552a51557aB049A57f58a152fB832B159f#code)

- [Dummy $USDC](https://amoy.polygonscan.com/address/0x1FB7d6C5eb45468fB914737A20506F1aFB80bBd9#code)

- [BULLET](https://amoy.polygonscan.com/address/0x357eA97718b13A37555a253d828cE1fda0dD212B#code)

- [METROCAR](https://amoy.polygonscan.com/address/0xF617152555038b91EBF1B7C44c1c2D85270d9033#code)
  
  
  
  
