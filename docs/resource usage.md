Resource Usage
Algorand smart contracts do not have default access to the entire blockchain ledger. Therefore, when a smart contract method needs to access resources such as accounts, assets (ASA), other applications (smart contracts), or box references, these must be provided through the reference array during invocation. This page explains what reference arrays are, why they are necessary, the different ways to provide them, and includes a series of code examples.

Resource Availability
When smart contracts are executed, they may require data stored within the blockchain ledger for evaluation. For this data (resource) to be accessible to the smart contract, it must be made available. When you say, ‘A resource is available to the smart contract,’ it means that the reference array, referencing the resource, was provided during the invocation and execution of a smart contract method that requires access to that resource.

What are Reference Arrays?
There are four reference arrays:

Accounts: Reference to Algorand accounts
Assets: Reference to Algorand Standard Assets
Applications: Reference to an external smart contract
Boxes: Reference to Boxes created within the smart contract
Including necessary resources in the appropriate arrays enables the smart contract to access the necessary data during execution, such as reading an account’s Algo balance or examining the immutable properties of an ASA. This page explains how data access is managed by a smart contract in version 9 or later of the Algorand Virtual Machine (AVM). For details on earlier AVM versions, refer to the TEAL specification

By default, the reference arrays are empty, with the exception of the accounts and applications arrays. The Accounts array contains the transaction sender’s address, and the Applications array contains the called smart contract ID.

Types of Resources to Make Available
Using these four reference arrays, you can make the following six unique ledger items available during smart contract execution: account, asset, application, account+asset, account+application, and application+box. Accounts and Applications can contain sublists with potentially large datasets. For example, an account may opt into an extensive set of assets or applications which store the user’s local state. Additionally, smart contracts can store potentially unlimited boxes of data within the ledger. For instance, a smart contract might create a unique box of arbitrary data for each user. These combinations, account+asset, account+application, and application+box, represent cases where you need to access data that exists at the intersection of two resources. For example:

Account+Asset: To read what the balance of an asset is for a specific account, both the asset and the account reference must be included in the respective reference arrays.
Account+Application: To access an account’s local state of an application, both the account and the application reference must be included in the respective reference arrays.
Application+Box: To retrieve data from a specific box created by an application, the application and the box reference must be included in the respective reference arrays.
Inner Transaction Resource Availability
When a smart contract executes an inner transaction to call another smart contract, the inner contract inherits all resource availability from the top-level contract. Here’s an example:

Let’s say contract A sends an inner transaction that calls a method in contract B. If contract B’s method requires access to asset XYZ, you only need to provide the asset reference when calling contract A, while still properly referencing contract B in the Applications array. This makes asset XYZ available to contract B through the resource availability inherited from contract A.

Reference Array Constraints and Requirements
There are certain limitations and requirements you need to consider when providing references in the reference arrays:

The four reference arrays are limited to a combined total of eight values per application transaction. This limit excludes the default references to the transaction sender’s address and the called smart contract ID.
The accounts array can contain no more than four accounts.
The values passed into the reference arrays can change per application transaction.
When accessing one of the sublists of items, the application transaction must include both the top-level item and the nested list item within the same call. For example, to read an ASA balance for a specific account, the account and the asset must be present in the respective accounts and asset arrays for the given transaction.
Reason for limited Access to Resources
To maintain a high level of performance, the AVM restricts how much of the ledger can be viewed within a single contract execution. This is implemented with reference arrays passed with each application call transaction, defining the specific ledger items available during execution. These arrays are the Account, Asset, Application, and Boxes arrays.

Resource Sharing
Resources are shared across transactions within the same atomic group. This means that if there are two app calls calling different smart contracts in the same atomic group, the two smart contracts share resource availability.

For example, say you have two smart contract call transactions grouped together, transaction #1 and transaction #2. Transaction #1 has asset 123456 in its assets array, and transaction #2 has asset 555555 in its assets array. Both assets are available to both smart contract calls during evaluation.

When accessing a sublist resource (account+asa, account+application local state, application+box), both resources must be in the same transaction’s arrays. For example, you cannot have account A in transaction #1 and asset Z in transaction #2 and then try to get the balance of asset Z for account A. Asset Z and account A must be in the same application transaction. If asset Z and account A are in transaction #1’s arrays, A’s balance for Z is also available to transaction #2 during evaluation.

Because Algorand supports grouping up to 16 transactions simultaneously, this pushes the available resources up to 8x16 or 128 items if all 16 transactions are application transactions.

If an application transaction is grouped with other types of transactions, other resources will be made available to the smart contract called in the application transaction. For example, if an application transaction is grouped with a payment transaction, the payment transaction’s sender and receiver accounts are available to the smart contract.

If the CloseRemainderTo field is set, that account will also be available to the smart contract. The table below summarizes what each transaction type adds to resource availability.

Transaction	Transaction Type	Availability Notes
Payment	pay	txn.Sender, txn.Receiver, and txn.CloseRemainderTo (if set)
Key Registration	keyreg	txn.Sender
Asset Config/Create	acfg	txn.Sender, txn.ConfigAsset, and the txn.ConfigAsset holding of txn.Sender
Asset Transfer	axfer	txn.Sender, txn.AssetReceiver, txn.AssetSender (if set), txnAssetCloseTo (if set), txn.XferAsset, and the txn.XferAsset holding of each of those accounts
Asset Freeze	afrz	txn.Sender, txn.FreezeAccount, txn.FreezeAsset, and the txn.FreezeAsset holding of txn.FreezeAccount. The txn.FreezeAsset holding of txn.Sender is not made available
Note

If any application or asset is created within a group of transactions, it is an available resource as long as it is created before it is accessed.

Different Ways to Provide References
There are different ways you can provide resource references when calling smart contract methods:

Automatic Resource Population: Automatically input resource references in the reference(foreign) arrays with automatic resource population using the AlgoKit Utils library (TypeScript and Python)

Note

Automatic resource population first sends a dry-run transaction to the Algorand node to determine the necessary resources. Then it populates the reference arrays with the required resources and sends the actual transaction. Therefore, it sends two requests to algod for each transaction. Developers should consider the impact on their app if they require sending a large number of transactions.

Reference Types: Pass reference types as arguments to contract methods. (You can only do this for Accounts, Assets, and Applications and not Boxes.)

Manually Input: Manually input resource references in the reference(foreign) arrays

Account Reference Example
Here is a simple smart contract with two methods that read the balance of an account. This smart contract requires the account reference to be provided during invocation.

Algorand TypeScript
Algorand Python
Source
import { Contract, Account, abimethod } from '@algorandfoundation/algorand-typescript'
import { Address } from '@algorandfoundation/algorand-typescript/arc4'

/**
 * A contract that demonstrates how to use resource usage in a contract using an account reference
 */
export default class ReferenceAccount extends Contract {
  /**
   * Returns the balance of the account
   * @returns The balance of the account
   */
  @abimethod({ readonly: true })
  public getAccountBalance() {
    const address = new Address('R3J76MDPEXQEWBV2LQ6FLQ4PYC4QXNHHPIL2BX2KSFU4WUNJJMDBTLRNEM')
    const addressBytes = address.bytes
    const account = Account(addressBytes)

    return account.balance
  }

  /**
   * Returns the balance of the account
   * @param account The account to get the balance of
   * @returns The balance of the account
   */
  @abimethod({ readonly: true })
  public getAccountBalanceWithArgument(account: Account) {
    return account.balance
  }
}

Here are three different ways you can provide the account reference when calling a contract method using the AlgoKit Utils library.

Method #1: Automatic Resource Population
TypeScript
Python
Source
  // Configure automatic resource population per app call
  const result1 = await referenceAccountAppClient.send.getAccountBalance({
    args: {},
  })

  console.log('Method #1 Account Balance', result1.return)

  // Or set the default value for populateAppCallResources to true globally and apply to all app calls
  Config.configure({
    populateAppCallResources: true,
  })

  const result2 = await referenceAccountAppClient.send.getAccountBalance({
    args: {},
  })

  console.log('Method #1 Account Balance', result2.return)

Method #2: Using Reference Types
TypeScript
Python
Source
  // Include the account reference in the app call argument to be populated automatically
  const result = await referenceAccountAppClient.send.getAccountBalanceWithArgument({
    args: {
      account: referenceAccount.addr.toString(),
    },
  })

  console.log('Method #2 Account Balance', result.return)

Method #3: Manually Input
TypeScript
Python
Source
  // Include the account reference in the accountReferences array to be populated manually
  const result = await referenceAccountAppClient.send.getAccountBalance({
    args: {},
    accountReferences: [referenceAccount],
  })

  console.log('Method #3 Account Balance', result.return)

Asset Reference Example
Here is a simple smart contract with two methods that read the total supply of an asset(ASA). This smart contract requires the asset reference to be provided during invocation.

Algorand TypeScript
Algorand Python
Source
import { Contract, abimethod, Asset } from '@algorandfoundation/algorand-typescript'

/**
 * A contract that demonstrates how to use resource usage in a contract using an asset reference
 */
export default class ReferenceAsset extends Contract {
  /**
   * Returns the total supply of the asset
   * @returns The total supply of the asset
   */
  @abimethod({ readonly: true })
  public getAssetTotalSupply() {
    return Asset(1005).total // Replace with your asset id
  }

  /**
   * Returns the total supply of the asset
   * @param asset The asset to get the total supply of
   * @returns The total supply of the asset
   */
  @abimethod({ readonly: true })
  public getAssetTotalSupplyWithArgument(asset: Asset) {
    return asset.total
  }
}

Here are three different ways you can provide the asset reference when calling a contract method using the AlgoKit Utils library.

Method #1: Automatic Resource Population
TypeScript
Python
Source
  // Configure automatic resource population per app call
  const result1 = await referenceAssetAppClient.send.getAssetTotalSupply({
    args: {},
    populateAppCallResources: true,
  })

  console.log('Method #1 Asset Total Supply', result1.return)

  // Or set the default value for populateAppCallResources to true globally and apply to all app calls
  Config.configure({
    populateAppCallResources: true,
  })

  const result2 = await referenceAssetAppClient.send.getAssetTotalSupply({
    args: {},
  })

  console.log('Method #1 Asset Total Supply', result2.return)

Method #2: Using Reference Types
TypeScript
Python
Source
  // Include the account reference in the app call argument to be populated automatically
  const result = await referenceAssetAppClient.send.getAssetTotalSupplyWithArgument({
    args: {
      asset: referenceAssetId,
    },
  })

  console.log('Method #2 Asset Total Supply', result.return)

Method #3: Manually Input
TypeScript
Python
Source
  // Include the account reference in the accountReferences array to be populated
  const result = await referenceAssetAppClient.send.getAssetTotalSupply({
    args: {},
    assetReferences: [referenceAssetId],
  })

  console.log('Method #3 Asset Total Supply', result.return)

App Reference Example
Here is a simple smart contract named ApplicationReference with two methods that call the increment method in the Counter smart contract via inner transaction. The ApplicationReference smart contract requires the Counter application reference to be provided during invocation.

Algorand TypeScript
Algorand Python
Source
import {
  Contract,
  abimethod,
  Application,
  GlobalState,
  Uint64,
  itxn,
  arc4,
} from '@algorandfoundation/algorand-typescript'
import type { uint64 } from '@algorandfoundation/algorand-typescript'

/**
 * A contract that increments a counter
 */
export class Counter extends Contract {
  public counter = GlobalState<uint64>({ initialValue: Uint64(0) })

  /**
   * Increments the counter and returns the new value
   * @returns The new counter value
   */
  @abimethod()
  public increment(): uint64 {
    this.counter.value = this.counter.value + 1
    return this.counter.value
  }
}

/**
 * A contract that demonstrates how to use resource usage in a contract using an asset reference
 */
export default class ReferenceApp extends Contract {
  /**
   * Calls the increment method on another Counter app with a hardcoded app ID
   * @returns The incremented counter value from the inner call
   */
  @abimethod()
  public incrementViaInner(): uint64 {
    const app = Application(1717) // Replace with your application id

    // Call the increment method on the Counter application
    const appCallTxn = itxn
      .applicationCall({
        appId: app.id,
        // Use methodSelector to get the ABI selector for the increment method
        appArgs: [arc4.methodSelector('increment()uint64')],
        fee: 0,
      })
      .submit()

    // Decode the ABI return value from the transaction logs
    // The ABI return value is in the last log with a prefix for the ABI return format
    return arc4.decodeArc4<uint64>(appCallTxn.lastLog, 'log')
  }

  /**
   * Calls the increment method on another Counter app passed as an argument
   * @param app The application to call
   * @returns The incremented counter value from the inner call
   */
  @abimethod()
  public incrementViaInnerWithArg(app: Application): uint64 {
    // Call the increment method on the provided Counter application
    const appCallTxn = itxn
      .applicationCall({
        appId: app.id,
        // Use methodSelector to get the ABI selector for the increment method
        appArgs: [arc4.methodSelector('increment()uint64')],
        fee: 0,
      })
      .submit()

    // Decode the ABI return value from the transaction logs
    // The ABI return value is in the last log with a prefix for the ABI return format
    return arc4.decodeArc4<uint64>(appCallTxn.lastLog, 'log')
  }
}

Here are three different ways you can provide the app reference when calling a contract method using the AlgoKit Utils library.

Method #1: Automatic Resource Population
TypeScript
Python
Source
  // Configure automatic resource population per app call
  const result1 = await referenceAppAppClient.send.incrementViaInner({
    args: {},
    populateAppCallResources: true,
  })

  console.log('Method #1 Increment via inner', result1.return)

  // Or set the default value for populateAppCallResources to true globally and apply to all app calls
  Config.configure({
    populateAppCallResources: true,
  })

  const result2 = await referenceAppAppClient.send.incrementViaInner({
    args: {},
    extraFee: microAlgos(1000), // additional fee to cover the inner app call
  })

  console.log('Method #1 Increment via inner', result2.return)

Method #2: Using Reference Types
TypeScript
Python
Source
  // Include the app reference in the app call argument to be populated automatically
  const result = await referenceAppAppClient.send.incrementViaInnerWithArg({
    args: {
      app: 1717n,
    },
    extraFee: microAlgos(1000), // additional fee to cover the inner app call
  })

  console.log('Method #2 Increment via inner', result.return)

Method #3: Manually Input
TypeScript
Python
Source
  // Include the app reference in the appReferences array to be populated
  const result = await referenceAppAppClient.send.incrementViaInner({
    args: {},
    appReferences: [1717n],
    extraFee: microAlgos(1000), // additional fee to cover the inner app call
  })

  console.log('Method #3 Increment via inner', result.return)

Account + Asset Example
Here is a simple smart contract with two methods that read the balance of an ASA in an account. This smart contract requires both the asset reference and the account reference to be provided during invocation.

Algorand TypeScript
Algorand Python
Source
import { Contract, abimethod, Account, Asset, assert } from '@algorandfoundation/algorand-typescript'
import { Address } from '@algorandfoundation/algorand-typescript/arc4'

/**
 * A contract that demonstrates how to reference both accounts and assets in a smart contract
 */
export default class ReferenceAccountAsset extends Contract {
  /**
   * Returns the balance of a specific asset in a hardcoded account
   * @returns The asset balance of the account
   */
  @abimethod({ readonly: true })
  public getAssetBalance() {
    const address = new Address('R3J76MDPEXQEWBV2LQ6FLQ4PYC4QXNHHPIL2BX2KSFU4WUNJJMDBTLRNEM') // Replace with your account address
    const addressBytes = address.bytes
    const account = Account(addressBytes)
    const asset = Asset(1472) // Replace with your asset ID

    assert(account.isOptedIn(asset), 'Account is not opted in to the asset')

    return asset.balance(account)
  }

  /**
   * Returns the balance of a specific asset in a provided account
   * @param account The account to check the asset balance for
   * @param asset The asset to check the balance of
   * @returns The asset balance of the account
   */
  @abimethod({ readonly: true })
  public getAssetBalanceWithArg(account: Account, asset: Asset) {
    assert(account.isOptedIn(asset), 'Account is not opted in to the asset')
    // Get the asset balance
    return asset.balance(account)
  }
}

Here are three different ways you can provide both the account reference and the asset reference when calling a contract method using the AlgoKit Utils library.

Method #1: Automatic Resource Population
TypeScript
Python
Source
  // Configure automatic resource population per app call
  const result1 = await accountAssetReferenceAppClient.send.getAssetBalance({
    args: {},
    populateAppCallResources: true,
  })

  console.log('Method #1 Asset Balance', result1)

  // Or set the default value for populateAppCallResources to true globally and apply to all app calls
  Config.configure({
    populateAppCallResources: true,
  })

  const result2 = await accountAssetReferenceAppClient.send.getAssetBalance({
    args: {},
  })

  console.log('Method #1 Asset Balance', result2)

Method #2: Using Reference Types
TypeScript
Python
Source
  // Include the account and asset references in the app call arguments to be populated automatically
  const result = await accountAssetReferenceAppClient.getAssetBalanceWithArg({
    args: {
      account: 'R3J76MDPEXQEWBV2LQ6FLQ4PYC4QXNHHPIL2BX2KSFU4WUNJJMDBTLRNEM',
      asset: referenceAssetId,
    },
  })

  console.log('Method #2 Asset Balance', result)

Method #3: Manually Input
TypeScript
Python
Source
  // Manually provide both account and asset references in the respective arrays
  const result = await accountAssetReferenceAppClient.getAssetBalance({
    args: {},
    accountReferences: ['R3J76MDPEXQEWBV2LQ6FLQ4PYC4QXNHHPIL2BX2KSFU4WUNJJMDBTLRNEM'],
    assetReferences: [referenceAssetId],
  })

  console.log('Method #3 Asset Balance', result)

Account + Application Example
Here is a simple smart contract named AccountAndAppReference with two methods that read the local state my_counter of an account in the Counter smart contract. The AccountAndAppReference smart contract requires both the Counter application reference and the account reference to be provided during invocation.

Algorand TypeScript
Algorand Python
Source
import {
  Contract,
  op,
  abimethod,
  Account,
  Application,
  LocalState,
  Txn,
  Global,
  assert,
  Bytes,
} from '@algorandfoundation/algorand-typescript'
import type { uint64 } from '@algorandfoundation/algorand-typescript'
import { Address } from '@algorandfoundation/algorand-typescript/arc4'

/**
 * A contract that maintains a per-account counter in local state
 * Accounts must opt in to use the counter
 */
export class MyCounter extends Contract {
  // Define a local state variable for the counter
  public myCounter = LocalState<uint64>({ key: 'my_counter' })

  /**
   * Initialize the counter when an account opts in
   */
  @abimethod({ allowActions: 'OptIn' })
  public optIn(): void {
    this.myCounter(Txn.sender).value = 0
  }

  /**
   * Increment the counter for the sender and return its new value
   * @returns The new counter value
   */
  @abimethod()
  public incrementMyCounter(): uint64 {
    assert(Txn.sender.isOptedIn(Global.currentApplicationId), 'Account must opt in to contract first')

    this.myCounter(Txn.sender).value = this.myCounter(Txn.sender).value + 1

    return this.myCounter(Txn.sender).value
  }
}

/**
 * A contract that demonstrates how to reference accounts and applications
 * to access local state from external contracts
 */
export default class ReferenceAccountApp extends Contract {
  /**
   * Get the counter value from another account's local state with hardcoded values
   * @returns The counter value or 0 if it doesn't exist
   */
  @abimethod({ readonly: true })
  public getMyCounter(): uint64 {
    const address = new Address('WMHF4FLJNKY2BPFK7YPV5ID6OZ7LVDB2B66ZTXEAMLL2NX4WJZRJFVX66M')
    const addressBytes = address.bytes
    const account = Account(addressBytes)
    const app = Application(1717) // Replace with your application id

    // Check if the counter value exists in the account's local state for the specified app
    const [value, hasValue] = op.AppLocal.getExUint64(account, app, Bytes('my_counter'))

    if (!hasValue) {
      return 0
    }

    return value
  }

  /**
   * Get the counter value from another account's local state with provided parameters
   * @param account The account to check
   * @param app The application to query
   * @returns The counter value or 0 if it doesn't exist
   */
  @abimethod({ readonly: true })
  public getMyCounterWithArg(account: Account, app: Application): uint64 {
    // Check if the counter value exists in the account's local state for the specified app
    const [value, hasValue] = op.AppLocal.getExUint64(account, app, Bytes('my_counter'))

    if (!hasValue) {
      return 0
    }

    return value
  }
}

Here are three different ways you can provide both the account reference and the application reference when calling a contract method using the AlgoKit Utils library.

Method #1: Automatic Resource Population
TypeScript
Python
Source
  // Configure automatic resource population per app call
  const result1 = await referenceAccountAppAppClient.send.getMyCounter({
    args: {},
    populateAppCallResources: true,
  })

  console.log('Method #1 My Counter', result1.return)

  // Or set the default value for populateAppCallResources to true globally and apply to all app calls
  Config.configure({
    populateAppCallResources: true,
  })

  const result2 = await referenceAccountAppAppClient.send.getMyCounter({
    args: {},
  })

  console.log('Method #1 My Counter', result2.return)

Method #2: Using Reference Types
TypeScript
Python
Source
  // Include the account and app references in the app call arguments to be populated automatically
  const result = await referenceAccountAppAppClient.send.getMyCounterWithArg({
    args: {
      account: randomAccountA.addr.toString(),
      app: 1717n, // Using the default app ID from the contract
    },
  })

  console.log('Method #2 My Counter', result.return)

Method #3: Manually Input
TypeScript
Python
Source
  // Manually provide both account and app references in the respective arrays
  const result = await referenceAccountAppAppClient.send.getMyCounter({
    args: {},
    accountReferences: [randomAccountA.addr],
    appReferences: [1717n], // Using the default app ID from the contract
  })

  console.log('Method #3 My Counter', result.return)

Application + Box Reference Example
Here is a simple smart contract with a methods that increments the counter value stored in a BoxMap. Each box uses box_counter + account address as its key and stores the counter as its value. This smart contract requires the box reference to be provided during invocation.

Algorand TypeScript
Algorand Python
Source
import {
  Contract,
  abimethod,
  Account,
  BoxMap,
  Txn,
  Global,
  gtxn,
  assert,
  Uint64,
  GlobalState,
  contract,
} from '@algorandfoundation/algorand-typescript'
import type { uint64 } from '@algorandfoundation/algorand-typescript'

/**
 * A contract that uses box storage to maintain a counter for each account
 * Each account needs to pay for the Minimum Balance Requirement (MBR) for their box
 * Constants for box storage are stored in global state
 */
@contract({ stateTotals: { globalUints: 4 } })
export default class ReferenceAppBox extends Contract {
  // Define constants for box storage in global state
  public keyLength = GlobalState<uint64>({ initialValue: Uint64(32 + 19) }) // Account address (32 bytes) + key prefix overhead (19 bytes)
  public valueLength = GlobalState<uint64>({ initialValue: Uint64(8) }) // uint64 (8 bytes)
  public boxSize = GlobalState<uint64>() // Calculated in constructor
  public boxMbr = GlobalState<uint64>() // Calculated in constructor

  // Create a box map to store counter values per account
  public accountBoxCounter = BoxMap<Account, uint64>({ keyPrefix: 'counter' })

  /**
   * Initialize calculated values in constructor
   */
  public constructor() {
    super()
    // Calculate the total box size and MBR in constructor
    this.boxSize.value = this.keyLength.value + this.valueLength.value
    this.boxMbr.value = Uint64(2500) + this.boxSize.value * Uint64(400) // Base MBR + (size * per-byte cost)
  }

  /**
   * Increments the counter for the transaction sender
   * Requires a payment transaction to cover the MBR for the box
   * @param payMbr Payment transaction covering the box MBR
   * @returns The new counter value
   */
  @abimethod()
  public incrementBoxCounter(payMbr: gtxn.PaymentTxn): uint64 {
    // Verify the payment covers the MBR cost and is sent to the contract
    assert(payMbr.amount === this.boxMbr.value, 'Payment must cover the box MBR')
    assert(payMbr.receiver === Global.currentApplicationAddress, 'Payment must be to the contract')

    const [counter, hasCounter] = this.accountBoxCounter(Txn.sender).maybe()

    if (hasCounter) {
      // Increment existing counter
      this.accountBoxCounter(Txn.sender).value = counter + 1
      return counter + 1
    } else {
      // Initialize new counter to 1
      this.accountBoxCounter(Txn.sender).value = Uint64(1)
      return Uint64(1)
    }
  }

  /**
   * Gets the current counter value for the transaction sender
   * @returns The current counter value or 0 if not set
   */
  @abimethod({ readonly: true })
  public getBoxCounter(): uint64 {
    const [counter, hasCounter] = this.accountBoxCounter(Txn.sender).maybe()

    if (hasCounter) {
      return counter
    }

    return 0
  }

  /**
   * Gets the current counter value for any account
   * @param account The account to check
   * @returns The current counter value or 0 if not set
   */
  @abimethod({ readonly: true })
  public getBoxCounterForAccount(account: Account): uint64 {
    const [counter, hasCounter] = this.accountBoxCounter(account).maybe()

    if (hasCounter) {
      return counter
    }

    return 0
  }

  /**
   * Returns the MBR cost for creating a box
   * @returns The MBR cost in microAlgos
   */
  @abimethod({ readonly: true })
  public getBoxMbr(): uint64 {
    return this.boxMbr.value
  }

  /**
   * Returns all the box size configuration values
   * @returns A tuple containing [keyLength, valueLength, boxSize, boxMbr]
   */
  @abimethod({ readonly: true })
  public getBoxConfiguration(): [uint64, uint64, uint64, uint64] {
    return [this.keyLength.value, this.valueLength.value, this.boxSize.value, this.boxMbr.value]
  }

  /**
   * Updates the box size configuration values
   * @param newKeyLength The new key length
   * @param newValueLength The new value length
   */
  @abimethod()
  public updateBoxConfiguration(newKeyLength: uint64, newValueLength: uint64): void {
    this.keyLength.value = newKeyLength
    this.valueLength.value = newValueLength

    // Recalculate derived values
    this.boxSize.value = this.keyLength.value + this.valueLength.value
    this.boxMbr.value = Uint64(2500) + this.boxSize.value * Uint64(400)
  }
}

Here are two different ways you can provide the box reference when calling a contract method using the AlgoKit Utils library.

Method #1: Automatic Resource Population
TypeScript
Python
Source
  // Create payment for MBR
  const payMbr = await algorand.createTransaction.payment({
    amount: microAlgos(boxMBR),
    sender: randomAccountA,
    receiver: counterAppAddress,
  })

  // Method 1: Using populateAppCallResources in sendParams
  const response1 = await referenceAppBoxAppClient.send.incrementBoxCounter({
    args: {
      payMbr: payMbr,
    },
    sender: randomAccountA,
    populateAppCallResources: true,
  })

  console.log('Method #2 Box Counter (explicit)', response1.return)

  // Method 2: Configure globally
  // Set the default value for populateAppCallResources to true once and apply to all contract invocations
  Config.configure({ populateAppCallResources: true })

  // Create another payment for MBR
  const payMbr2 = await algorand.createTransaction.payment({
    amount: microAlgos(boxMBR),
    sender: randomAccountA,
    receiver: counterAppAddress,
  })

  // With global configuration, we don't need to specify populateAppCallResources
  const response2 = await referenceAppBoxAppClient.send.incrementBoxCounter({
    args: {
      payMbr: payMbr2,
    },
    sender: randomAccountA,
  })

  console.log('Method #1 Box Counter (global)', response2.return)

Method #2: Manually Input
TypeScript
Python
Source
  const boxPrefix = 'counter' // box identifier prefix
  const encoder = new TextEncoder()
  const boxPrefixBytes = encoder.encode(boxPrefix) // UInt8Array of boxPrefix
  const publicKey = randomAccountB.addr.publicKey

  // Create the box reference
  const boxReference = new Uint8Array([...boxPrefixBytes, ...publicKey])

  // Create payment for MBR
  const payMbr = await algorand.createTransaction.payment({
    amount: microAlgos(boxMBR),
    sender: randomAccountB,
    receiver: counterAppAddress,
  })

  // Call the smart contract with manually specified box reference
  const response = await referenceAppBoxAppClient.send.incrementBoxCounter({
    args: {
      payMbr: payMbr,
    },
    boxReferences: [boxReference],
    sender: randomAccountB,
  })

  console.log('Method #2 Box Counter', response.return)