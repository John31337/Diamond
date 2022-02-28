# Instruction

## Objective
* Create a `upgradeable`, `pausable` __crowdfunding__ smart contract which can be used as a _template_ by every __project owner__.
* Follow [__diamond standard__](https://github.com/ethereum/EIPs/issues/2535) so as to never get this error: "exceeding contract size limit" i.e. `24 KB`.

## Features
### Set Deployment Params 
The __Project Owner (PO)__ is able to set these params:
* startTimestamp of crowdfunding
> NOTE: The allocate PC function i.e. `allocatePC()` can only be accessed before this `start_timestamp`. So, the PO has to keep a note of this.
* buffer time period
* min. funding threshold (in USD). This has to be compared with the fund currency. E.g. `100,000 USD` compared to `200,000 USDC` 
> If the min. funding threshold is not reached, the Buffer Time (BFT) is not supposed to start. 
* Conversion period (CP): This is the duration during which the coins can be claimed.
* it's wallet address: used for receiving the fees & fund. Also, used for verification during calling the claim functions `claimFees`, `claimFund`.
* stablecoin address (to decide which coins - USDC, USDT to use as currency for collecting the fund)
> check for valid stablecoin address for the network/chain. Hint: Refer Chainlink API

* min. funding threshold (in USD)
* allocated supply: Suppose, here the PO decides for `100_000` coins, then the contract remains _deactivated_ unless this transferred amount matches with the set number.

### Condition for SC activation:
1. Current timestamp should reach the set `start_timestamp`.
2. the PO sends the allocated supply to the contract after deployment via `allocatePC()` function

> NOTE: `allocatePC()` function can run only once. This is to prevent the PO to manipulate the PC valuation for PT.

### Commission:
* Protocol fees (for 1st marketplace)
	- collected during sale of Bonding Curve (BC) tokens
* Project fees (for 1st marketplace) 
	- collected during sale of Bonding Curve (BC) tokens
* Protocol fees (for 2nd marketplace)
	- collected during the trading (buy/sell) of bond tokens
> NOTE: For now, it is kept same as that of 1st marketplace
* Project fees (for 2nd marketplace)
	- collected during the trading (buy/sell) of bond tokens
> NOTE: It can be same/different as that of 1st marketplace

### Project Investor roles:
- `totPInvestors`: total no. of unique project investors (addresses) to date.
- invest money via `iinvest()` function in stablecoins (like USDC, USDT, etc.) or unstablecoins (like ETH, BSC, WBTC, RBTC, etc.).
	+ project tokens to be minted
	+ protocol fees to be deducted & stored as escrow for the protocol wallet address.
	+ project commission fees to be deducted & stored as escrow for the project owner.
- withdraw money via `iwithdrawFund()` function by depositing minted tokens (gets burned) & receives in stablecoins or unstablecoins.
	+ Case-1: If the investor invested in USDC, then during withdrawal, it receives in USDC.
	+ Case-2: If the investor invested in unstablecoins, they will be given the option to receive in either stable or unstable coins. The swap happens via an DEX interface attached with the contract.
- ~~reclaim fund via `ireclaimFund()` function, when the min. funding threshold (set by the project owner) is not reached within the timeline.~~
	+ ~~This can be done post the timeline only if the min. funding threshold (min. USD fund to be raised) is NOT reached within the timeline.~~
- claim project coin via `iclaimCoin()` function.
	+ This can be done during the conversion period only if the min. funding threshold (min. USD fund to be raised) is reached.

### Project owner roles:
- withdraw deposited coins via `withdrawCoin()` function. TODO: What to do when the min. threshold is not reached forever
	+ This can be done post the CP only (the timeline can't be calculated as there is no time set b/w start_timestamp & BFT_start), if there is no fund amount deposited during the timeline.
	+ Trigger ON this function right from the beginning & disable it when there is the 1st investment by the PI via `invest()` function.
	+ Enable this function if the total available fund (in stablecoins like USDC, USDT) is zero via `withdrawFund()` function.
	> Summary: This function remains disabled from the beginning, but keeps getting _enabled_/_disabled_ via `iwithdrawFund()`/`invest()` functions, when the total available fund (in stablecoins like USDC, USDT) is _zero_/_non-zero_ respectively.

- claim fees via `claimFees()` function
	+ This can be done at any point of time after the contract is activated.
- claim Funding via `claimFund()` function
	+ This can be done post the timeline only if the min. funding threshold (min. USD fund to be raised) is reached within the timeline.
- launch "Bond Investment" feature via deploying bond tokens (like project tokens) contract - `launchBondInv()`
	+ Set the project fee (diff. variable than the 1st marketplace)
	+ create a `BondToken.sol` like `ProjectToken.sol` & mint `100,000` (fixed no. for each project) tokens to the project owner wallet address.
> NOTE: __Project token vs Bond token__: The former can be minted and burnt whenever needed by the `crowdfunding contract` during `iinvest()`, `iwithdrawFund()`. But, the later can be minted only once to the project owner & can't be burned. Moreover the bond tokens can only be transferred. The value of both these types is applicable only during the project conversion period.
	+ This outputs a bond token contract address.
	+ This can be done at any point of time after the min. funding threshold (min. USD fund to be raised) is reached within the timeline.
- [TODO] Just like __project token contract__, (gets created on an address), the locking contract is to be deployed as well.

### Anyone:
* create offers via `createOffers()`
	- params: `reserveBondTokenAmt` (allows multiple sales per offer), `bondTokenAmt`, `askCoinAddr`, `askCoinAmt`, `seller`
	- Create a mapping: `mapping( offer_id => OfferData )`
	- `OfferData` is a struct consisting of  `bondTokens`, `askCoinAddr`, `askCoinAmt`, `status` (open/close).
	- This outputs the offer id(s). An additional variable `offer_id` (of `uint256`) is created to create the next available `offer_id`.
	- This can be done at any point of time after the min. funding threshold (min. USD fund to be raised) is reached within the timeline.
	> NOTE: Multiple offers can be created in a single transaction. This is to save the gas which would otherwise be needed if done multiple times. Params to be set in list.

* edit offers via `editOffers()` for an `offer_id`:
	- edit the offer details & submit.
	- This can be done at any point of time after the min. funding threshold (min. USD fund to be raised) is reached within the timeline.
* delete offers via `delOffers()`
	- Just feed the `offer_id`(s)
	- This can be done at any point of time after the min. funding threshold (min. USD fund to be raised) is reached within the timeline.

### Bond Investor roles:
- `totBInvestors`: total no. of unique bond investors (addresses) to date.
- buy bond tokens based on available offers via `buyOffers()` (can have multiple ids)
	+ investor transfers the asked coins & get the corresponding bond token
	+ protocol fee, project fee gets collected.
	+ update the offer status by setting `status` as open/close (i.e. 1/0)
	+ The balances of bond tokens for holder is maintained in the Bond token contract.
	+ The required tokens
> NOTE: this protocol, project fees can be same/different from those of 1st marketplace.
- claim Fund via `biclaimFund()`
	+ This can be done post the timeline only if the min. funding threshold (min. USD fund to be raised) is reached within the timeline.

### Protocol owner roles:
- claim commission fees via `tclaimFees()`
		+ This can be done at any point of time after the min. funding threshold (min. USD fund to be raised) is reached within the timeline.

### Utils:
* Get price:
	- function: `getPrice()`
	- view price of the project token
	- This depends on Bonding curve equation.
* Create a utility library which will contain all the mathematical calculations and will be used inside the functions of the main contract.
* functions include
	- `_calculatePrice()`: calculate real-time price (in USD) of project token.
	- `isFundingTh()`: is Funding threshold reached.
		- deduct the protocol fees, project owner fees & then check if the totalFundingAmt >= fundingThreshold
* TODO: Create a public function called `getCFStatus` which gives the status of the CF SC based on these:
	- whether the `start_timestamp` is reached as per the current timestamp.
	- whether the `transferredPC` value is non-zero.
	> NOTE: This gets transferred via `allocatePC` function.
	- If min. funding threshold is reached, then we would have to calculate the `end_timestamp` (based on `tpTimestamp`, `bufferPeriod`, `conversionPeriod`) & find out whether it is reached or not.

## Diamond standard
It consists of 3 parts:

1. __Proxy contract__ which is called the _diamond_. Here file is named "CFDiamond.sol"
2. __Diamond storage__ is stored at the _position_ (basically an EVM compatible address) set via a string (unique or same). Here, all the storage variables & contract address for functions is stored & updated when the facet is updated.
3. __Implementation contract__ which is called _facet_. Each facet is deployed into an address.

> NOTES:
> - Now, 3 (PC symbol, curr_timestamp, PO wallet address) of all parameters set inside the constructor of _diamond_ is used to calculate the unique position per CF SC.
> - In order to use any state variables from "Diamond storage" inside the functions of _facet_, just use the position & call the state variables.

### Storage position
* Here, we set the `DIAMOND_STORAGE_POSITION` param different for multiple projects.
* 2 params considered for this: 
	- Project Coin (PC) symbol,
	- current timestamp
	- PO wallet address
* After this, we take the `keccak256` hash of the entire string.

## Unit Testing
* "Project Token SC"
	1. Ownership
		- [ ] "Verify that the crowdfunding contract is the admin"
	2. Mint
		- [ ] "Succeeds when the crowdfunding contract mints token"
		- [ ] "Succeeds when the crowdfunding contract mints token within the conversion period"
		- [ ] "Fails when the crowdfunding contract mints token outside the conversion period"
		- [ ] "Fails when other address mints token"
		- [ ] "Fails when zero tokens minted"

	3. Burn
		- [ ] "Succeeds when the crowdfunding contract burns token"
		- [ ] "Succeeds when the crowdfunding contract burns token within & after the conversion period"
			+ NOTE: during `iclaimCoin` function, the PT is burnt
		- [ ] "Fails when the crowdfunding contract burns token before the conversion period starts"
		- [ ] "Fails when other address burns token"
		- [ ] "Fails when zero tokens burnt"

	4. Transfer
		- [ ] "Check it is deactivated"

	5. TransferFrom
		- [ ] "Check it is deactivated"

	6. Approve
		- [ ] "Check it is deactivated"

* "Crowdfunding SC: Ownable"
	- [ ] "Succeeds when owner transfers ownership to other address"
	- [ ] "Fails when non-owner transfers ownership to other address"

* "Crowdfunding SC: Pausable"
	- [ ] "Succeeds if owner pause when NOT paused" 
	- [ ] "Succeeds if owner unpause when already paused" 
	- [ ] "Fails if owner pause when already paused" 
	- [ ] "Fails if owner unpause when already unpaused" 
	- [ ] "Fails if non-owner pause when NOT paused" 
	- [ ] "Fails if non-owner unpause when already paused" 

* "Crowdfunding SC: Upgradeability"

	> Apart from the main crowdfunding SC file, this also includes the checking for all files (like `FundingUtils.sol`) referenced in the Crowdfunding contract

	1. Constructor
		- [ ] "Fails when the constructor is modified by admin"
		- [ ] "Fails when the constructor is modified by non-admin"
	1. Inheritance
		- [ ] "Succeeds when contract inherits from a new abstract contract by admin"
			- [ ] "Verify storage position is same as original after modification"
		- [ ] "Fails when contract inherits from an existing abstract contract by admin"
		- [ ] "Fails when contract inherits from a new abstract contract by non-admin"
		- [ ] "Fails when contract inherits from an existing abstract contract by non-admin"
	1. State variable
		- [ ] "Verify if the stored data for public variable is reinstated"
		- [ ] "Succeeds when the admin add (type & name) a new state variable"
			- [ ] "Verify storage position is same as original after modification"
		- [ ] "Succeeds when the admin modify (name) a new state variable"
			- [ ] "Verify storage position is same as original after modification"
		- [ ] "Succeeds when the admin remove an existing state variable"
			- [ ] "Verify storage position is same as original after modification"
		- [ ] "Fails when the non-admin add a new state variable"
		- [ ] "Fails when the non-admin remove an existing state variable"
	1. Event
		- [ ] "Succeeds when the admin add a new event"
			- [ ] "Verify storage position is same as original after modification"
		- [ ] "Succeeds when the admin modify an existing event by adding or removing parameters"
			- [ ] "Verify storage position is same as original after modification"
		- [ ] "Fails when the admin creates a duplicate event"
		- [ ] "Fails when the non-admin add a new event"
		- [ ] "Fails when the non-admin modify an existing event by adding or removing parameters"
		- [ ] "Fails when the non-admin creates a duplicate event"
	1. Modifier
		- [ ] Succeeds when the admin add a new modifier
			- [ ] "Verify storage position is same as original after modification"
		- [ ] Succeeds when the admin modify an existing modifier
			- [ ] "Verify storage position is same as original after modification"
		- [ ] Succeeds when the admin remove an existing modifier
			- [ ] "Verify storage position is same as original after modification"
		- [ ] Fails when the non-admin add a new modifier
		- [ ] Fails when the non-admin modify an existing modifier
		- [ ] Fails when the non-admin remove an existing modifier
	1. Function
		- [ ] Succeeds when the admin add a new function
			- [ ] "Verify storage position is same as original after modification"
		- [ ] Succeeds when the admin update an existing function
			- [ ] "Verify storage position is same as original after modification"
		- [ ] Succeeds when the admin remove an existing function
			- [ ] "Verify storage position is same as original after modification"
		- [ ] Fails when the non-admin add a new function
		- [ ] Fails when the non-admin update an existing function
		- [ ] Fails when the non-admin remove an existing function

* "Crowdfunding SC: Bonding Curve"
	- "Buy price of token"
		+ [ ] "Succeeds in getting buy price when the contract is activated"
		+ [ ] "Fails in getting buy price when the contract is not activated"
		+ [ ] "Fails in getting buy price when the invest amount is negative"
	- "Sell price of token"
		+ [ ] "Succeeds in getting sell price when the contract is activated"
		+ [ ] "Fails in getting sell price when the contract is not activated"
		+ [ ] "Fails in getting sell price when the invest amount is negative"

* "Crowdfunding SC: Activation"
	- [ ] "Succeeds when both the conditions meet: now >= start_timestamp and allocated coin is fully transferred"
	- [ ] "Fails when only the current timestamp is >= start_timestamp"
	- [ ] "Fails when only allocated coin is fully transferred"
	- [ ] "Fails when the current timestamp is < start_timestamp"

* "Crowdfunding SC: Project Investor"
* "Crowdfunding SC: Project Owner"
* "Crowdfunding SC: Protocol"
* "Crowdfunding SC: Bond Investor"

## Dependencies
* OpenZeppelin
* Diamond Standard

## Testing framework
* Hardhat using Typescript language.

## Networks
* localhost
* Testnet
	- Rinkeby
	- Kovan
	- Avalanche
* Mainnet
	- Ethereum
	- Avalanche


## Glossary
* BC: Bonding Curve
* BFP: Buffer Period
* BI: Bond Investor
* BP: Buy Price
* BT: Bond Token
* CF SC: Crowdfunding Smart Contract
* CP: Conversion Period
* P or T: Protocol
* PI: Project Investor
* PO: Project Owner
* PT: Project Token
* SC: Smart Contract
* SP: Sell Price