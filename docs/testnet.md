================
CODE SNIPPETS
================
TITLE: Directly Fund Account from TestNet Dispenser
DESCRIPTION: Directly sends a specified amount of ALGOs to an Algorand account using the TestNet Dispenser API. Unlike the ensureFunded method, this function transfers funds immediately without checking the current balance. It's useful for topping up an account with a precise amount.

SOURCE: https://dev.algorand.co/concepts/accounts/funding

LANGUAGE: typescript
CODE:
```
/**
* Directly fund an account using the TestNet Dispenser API
*/
const testnetDispenser = algorand.client.getTestNetDispenserFromEnvironment()
await testnetDispenser.fund('ACCOUNTADDRESS', 1_000_000)
```

LANGUAGE: python
CODE:
```
"""
Directly fund an account using the TestNet Dispenser API
"""
testnet_dispenser = algorand_client.client.get_testnet_dispenser()
testnet_dispenser.fund(address=random_account.address, amount=10, asset_id=0)
```

--------------------------------

TITLE: Funding an Account with TestNet Dispenser
DESCRIPTION: Shows how to use the `fund` method of the Dispenser Client to send Algos to a specified receiver address. The method requires the receiver's address and the amount in microAlgos. It returns a DispenserFundResponse object containing the transaction ID and the funded amount.

SOURCE: https://dev.algorand.co/algokit/utils/python/dispenser-client

LANGUAGE: python
CODE:
```
response = dispenser.fund(

receiver="RECEIVER_ADDRESS",

amount=1000,  # Amount in microAlgos

)
```

--------------------------------

TITLE: Fund Account Using TestNet Dispenser API: With Config
DESCRIPTION: Demonstrates funding an account via the TestNet Dispenser API with configuration options. This example includes setting `minFundingIncrement` for the funding transaction.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/transfer

LANGUAGE: typescript
CODE:
```
await algorand.account.ensureFundedUsingDispenserAPI(
  'ACCOUNTADDRESS',
  algorand.client.getTestNetDispenserFromEnvironment(),
  (1).algo(),
  {
    minFundingIncrement: (2).algo(),
  },
);
```

--------------------------------

TITLE: Send Algorand Transactions with AlgoKit CLI
DESCRIPTION: This section details how to send Algorand transactions using the `algokit task send` command. It covers sending transactions from a file, directly via base64 encoding, and piping output from other commands like `algokit sign`. The command sends transactions to the default `localnet` or a specified network, and outputs the transaction ID upon success.

SOURCE: https://dev.algorand.co/algokit/algokit-cli/tasks/send

LANGUAGE: APIDOC
CODE:
```
algokit task send
  Sends Algorand transactions.

  Usage:
    algokit task send --file <PATH_TO_BINARY_FILE_CONTAINING_SIGNED_TRANSACTIONS> [--network <network_name>]
    algokit task send --transaction <YOUR_BASE64_ENCODED_SIGNED_TRANSACTION> [--network <network_name>]
    <command_producing_transactions> | algokit task send [--network <network_name>]

  Description:
    This command facilitates the submission of signed Algorand transactions to the network.
    It supports reading transactions from a binary file, directly from a base64 encoded string, or via standard input (stdin).
    By default, transactions are sent to the 'localnet'. The `--network` flag allows specifying other networks like 'testnet' or 'mainnet'.
    Upon successful submission, the transaction ID (txid) is printed to the console, along with a URL to check the transaction status.

  Parameters:
    --file <PATH_TO_BINARY_FILE_CONTAINING_SIGNED_TRANSACTIONS>
      Specifies the path to a binary file containing one or more signed transactions.
    --transaction <YOUR_BASE64_ENCODED_SIGNED_TRANSACTION>
      Provides a single signed transaction encoded in Base64.
    --network <network_name>
      (Optional) The name of the Algorand network to send the transaction to (e.g., 'localnet', 'testnet', 'mainnet'). Defaults to 'localnet'.
    <command_producing_transactions>
      (Piped Input) Any command that outputs signed transactions to stdout can be piped into `algokit task send`.

  Compatibility:
    Currently supports `goal clerk` compatible transaction objects.

  Examples:
    # Send transactions from a file to the default localnet
    $ algokit task send --file "./signed_transactions.txn"

    # Send a base64 encoded transaction to the testnet
    $ algokit task send --transaction "AYID..." --network testnet

    # Pipe transactions from `algokit sign` to send to a specified network
    $ algokit task sign --account "my_account" --file "./unsigned_txns.txn" --force | algokit task send --network "testnet"
```

--------------------------------

TITLE: AlgorandClient: Create for TestNet
DESCRIPTION: Creates an AlgorandClient instance configured to connect to the Algorand TestNet using AlgoNode. This is useful for testing applications before deploying to MainNet.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/classes/algorandclient

LANGUAGE: typescript
CODE:
```
const algorand = AlgorandClient.testNet();
```

--------------------------------

TITLE: Deploy to Testnet Command
DESCRIPTION: The basic command to initiate a deployment process for smart contracts to the testnet environment using AlgoKit.

SOURCE: https://dev.algorand.co/algokit/algokit-cli/project/deploy

LANGUAGE: shell
CODE:
```
$ algokit project deploy testnet

```

--------------------------------

TITLE: Ensure Account Funded from TestNet Dispenser
DESCRIPTION: Ensures an Algorand account has sufficient funds on TestNet by automatically requesting ALGOs from the TestNet Dispenser API if the balance is below a threshold. The dispenser client uses the ALGOKIT_DISPENSER_ACCESS_TOKEN environment variable for authentication. This is useful for CI/CD pipelines and automated tests.

SOURCE: https://dev.algorand.co/concepts/accounts/funding

LANGUAGE: typescript
CODE:
```
/**
* Ensure an account has sufficient funds using the TestNet Dispenser API
* The dispenser client uses the `ALGOKIT_DISPENSER_ACCESS_TOKEN` environment variable
* to authenticate with the dispenser API.
*/
const dispenserClient = algorand.client.getTestNetDispenserFromEnvironment()
await algorand.account.ensureFundedFromTestNetDispenserApi('ACCOUNTADDRESS', dispenserClient, algo(1))
```

LANGUAGE: python
CODE:
```
"""
Ensure an account is funded from a dispenser account retrieved from the testnet dispenser API.
Uses a dispenser account retrieved from the testnet dispenser API, per the ensure_funded_from_testnet_dispenser_api method, as a funding source such that the given account has a certain amount of Algo free to spend (accounting for Algo locked in minimum balance requirement).
"""
testnet_dispenser = algorand_client.client.get_testnet_dispenser()
algorand_client.account.ensure_funded_from_testnet_dispenser_api(
account_to_fund=random_account.address,
dispenser_client=testnet_dispenser,
min_spending_balance=AlgoAmount(algo=10),
)
```

--------------------------------

TITLE: Creating a TestNet Dispenser Client
DESCRIPTION: Demonstrates how to initialize the TestNet Dispenser Client. You can provide an authorization token directly to the constructor or set it as an environment variable 'ALGOKIT_DISPENSER_ACCESS_TOKEN'. The constructor argument takes precedence if both are used.

SOURCE: https://dev.algorand.co/algokit/utils/python/dispenser-client

LANGUAGE: python
CODE:
```
import algokit_utils

# With auth token
dispenser = algorand.client.get_testnet_dispenser(

auth_token="your_auth_token",

)

# With auth token and timeout
dispenser = algorand.client.get_testnet_dispenser(

auth_token="your_auth_token",

request_timeout=2,  # seconds

)

# From environment variables
# i.e. os.environ['ALGOKIT_DISPENSER_ACCESS_TOKEN'] = 'your_auth_token'
dispenser = algorand.client.get_testnet_dispenser_from_environment()

# Alternatively, you can construct it directly
from algokit_utils import TestNetDispenserApiClient

# Using constructor argument
client = TestNetDispenserApiClient(auth_token="your_auth_token")

# Using environment variable
import os
os.environ['ALGOKIT_DISPENSER_ACCESS_TOKEN'] = 'your_auth_token'
client = TestNetDispenserApiClient()
```

--------------------------------

TITLE: Algorand SDK: Transaction Sending
DESCRIPTION: Methods for broadcasting signed transactions to the Algorand network. Supports sending single raw transactions, single signed transaction objects, or batches of signed transaction objects.

SOURCE: https://dev.algorand.co/reference/algokit-utils-py/api-reference/algosdk/algosdkv2clientalgod

LANGUAGE: APIDOC
CODE:
```
send_raw_transaction:
  signature: send_raw_transaction(txn: Union[bytes, str], **kwargs: Any) -> str
  description: Broadcast a signed transaction to the network.
  parameters:
    - name: txn
      type: Union[bytes, str]
      description: transaction to send, encoded in base64
    - name: kwargs
      type: Any
      description: Additional keyword arguments, e.g., request_header (dict)
  returns:
    type: str
    description: transaction ID

send_transaction:
  signature: send_transaction(txn: algosdk.transaction.GenericSignedTransaction, **kwargs: Any) -> str
  description: Broadcast a signed transaction object to the network.
  parameters:
    - name: txn
      type: algosdk.transaction.GenericSignedTransaction
      description: transaction to send (SignedTransaction, LogicSigTransaction, or MultisigTransaction)
    - name: kwargs
      type: Any
      description: Additional keyword arguments, e.g., request_header (dict)
  returns:
    type: str
    description: transaction ID

send_transactions:
  signature: send_transactions(txns: Iterable[transaction.GenericSignedTransaction], **kwargs: Any) -> str
  description: Broadcast list of a signed transaction objects to the network.
  parameters:
    - name: txns
      type: Iterable[transaction.GenericSignedTransaction]
      description: transactions to send (SignedTransaction[] or MultisigTransaction[])
    - name: kwargs
      type: Any
      description: Additional keyword arguments, e.g., request_header (dict)
  returns:
    type: str
    description: first transaction ID
```

--------------------------------

TITLE: Send Algorand Payment Transaction (JavaScript)
DESCRIPTION: Demonstrates sending Algorand payment transactions using the SDK. Includes a minimal example and an advanced example with additional parameters like closing the remainder and rekeying.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/transfer

LANGUAGE: javascript
CODE:
```
// Minimal example
const result = await algorand.send.payment({
  sender: 'SENDERADDRESS',
  receiver: 'RECEIVERADDRESS',
  amount: (4).algo(),
});

// Advanced example
const result2 = await algorand.send.payment({
  sender: 'SENDERADDRESS',
  receiver: 'RECEIVERADDRESS',
  amount: (4).algo(),
  closeRemainderTo: 'CLOSEREMAINDERTOADDRESS',
  lease: 'lease',
  note: 'note',
  rekeyTo: 'REKEYTOADDRESS',
  firstValidRound: 1000n,
  validityWindow: 10,
  extraFee: (1000).microAlgo(),
  staticFee: (1000).microAlgo(),
  maxFee: (3000).microAlgo(),
  signer: transactionSigner,
  maxRoundsToWaitForConfirmation: 5,
  suppressLog: true,
});
```

--------------------------------

TITLE: Send Algorand Payment Transaction
DESCRIPTION: Demonstrates sending a payment transaction using the Algorand client. If a signer has been previously set for the sender account, the client can automatically handle the transaction signing and submission.

SOURCE: https://dev.algorand.co/algokit/utils/algokit-clients

LANGUAGE: python
CODE:
```
algorand_client.send.payment(
    PaymentParams(
        sender=account_a.address,
        receiver=account_b.address,
        amount=AlgoAmount(algo=1),
    )
)
```

--------------------------------

TITLE: Fund Account Using TestNet Dispenser API: Basic
DESCRIPTION: Shows the basic usage of `algorand.account.ensureFundedUsingDispenserAPI` to fund an account via the TestNet Dispenser API. It requires the target account address, a dispenser client instance, and the funding amount.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/transfer

LANGUAGE: typescript
CODE:
```
await algorand.account.ensureFundedUsingDispenserAPI(
  'ACCOUNTADDRESS',
  algorand.client.getTestNetDispenserFromEnvironment(),
  (1).algo(),
);
```

--------------------------------

TITLE: Algorand SDK: Send Single Transaction Methods
DESCRIPTION: Details the `algorand.send...` methods for composing and sending single Algorand transactions. It outlines the use of `AlgorandClientTransactionSender`, `TxnParams`, and `SendParams` for transaction configuration and execution.

SOURCE: https://dev.algorand.co/algokit/utils/python/algorand-client

LANGUAGE: APIDOC
CODE:
```
algorand.send.{method}(params=TxnParams, send_params=SendParams) -> SingleSendTransactionResult

- **Description**: Composes and sends a single Algorand transaction.
- **Parameters**:
  - `params`: A union type representing any Algorand transaction type. Specific dataclasses can be imported from `algokit_utils.transactions` (e.g., `PaymentParams`, `AssetOptInParams`).
  - `send_params`: A typed dictionary (`algokit_utils.transactions.SendParams`) for settings applied during the send operation.
- **Returns**:
  - `SingleSendTransactionResult`: Contains all relevant information after sending the transaction.
- **Options**:
  - `suppressLog`: A boolean to opt-out of log messages emitted before and/or after sending the transaction.
```

--------------------------------

TITLE: TestNet Node Configuration Example
DESCRIPTION: This JSON snippet shows a sample configuration file (`config.json`) for an Algorand node. It specifies the `NetAddress` property to enable the node to listen for incoming traffic on port 4161, making it suitable for TestNet relay operations.

SOURCE: https://dev.algorand.co/nodes/reference/relay-config

LANGUAGE: json
CODE:
```
{
  "NetAddress": ":4161"
}
```

--------------------------------

TITLE: Check if Algorand Network is TestNet
DESCRIPTION: The isTestNet function determines if the connected Algorand network is a testnet. It requires an AlgodClient instance as input and returns a Promise resolving to a boolean. This function is deprecated and users should refer to the suggested alternatives for current usage.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/istestnet

LANGUAGE: APIDOC
CODE:
```
isTestNet(algod):
  Promise<boolean>

Defined in: src/network-client.ts:149

Deprecated
Use `await algorand.client.isTestNet()` or `await new ClientManager({ algod }).isTestNet()` instead.

Parameters:
  algod: AlgodClient - The Algod client instance.

Returns:
  Promise<boolean> - A promise that resolves to true if the network is a testnet, false otherwise.
```

LANGUAGE: TypeScript
CODE:
```
/**
 * Checks if the Algorand network is a testnet.
 * @deprecated Use `await algorand.client.isTestNet()` or `await new ClientManager({ algod }).isTestNet()` instead.
 * @param algod The Algod client instance.
 * @returns A promise that resolves to true if the network is a testnet, false otherwise.
 */
async isTestNet(algod: AlgodClient): Promise<boolean> {
  // Implementation details...
}
```

--------------------------------

TITLE: Send Algorand Transaction with Resource Population
DESCRIPTION: Illustrates sending a transaction group with the `populateAppCallResources` option enabled. This automatically discovers and adds necessary app call resources before sending.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/transaction-composer

LANGUAGE: javascript
CODE:
```
const myMethod = algosdk.ABIMethod.fromSignature('my_method()void');

const result = algorand
.newGroup()
.addAppCallMethodCall({
  sender: 'SENDER',
  appId: 123n,
  method: myMethod,
  args: [1, 2, 3],
})
.send({
  populateAppCallResources: true,
});
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/gettestnetdispenserapiclient

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Creating Dispenser Client with algorand.client
DESCRIPTION: Demonstrates creating a TestNet Dispenser Client using the `algorand.client` helper functions. This method allows for passing an authorization token directly or defaulting to an environment variable, with options for setting request timeouts.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/dispenser-client

LANGUAGE: javascript
CODE:
```
const dispenserClient = algorand.client.getTestNetDispenser({
  authToken: 'your_auth_token',
});

const dispenserClientWithTimeout = algorand.client.getTestNetDispenser({
  authToken: 'your_auth_token',
  requestTimeout: 2 /* seconds */,
});

// From environment variables (i.e. process.env['ALGOKIT_DISPENSER_ACCESS_TOKEN'] = 'your_auth_token')
const dispenserClientFromEnv = algorand.client.getTestNetDispenserFromEnvironment();

const dispenserClientFromEnvWithTimeout = algorand.client.getTestNetDispenserFromEnvironment({
  requestTimeout: 2 /* seconds */,
});
```

--------------------------------

TITLE: Algorand Transaction Creation and Sending
DESCRIPTION: Details the process of creating and sending Algorand transactions using the AlgorandClient. It covers transaction parameters, send parameters, and return types for different transaction methods.

SOURCE: https://dev.algorand.co/algokit/utils/python/algorand-client

LANGUAGE: APIDOC
CODE:
```
algorand.create_transaction.{method}(params=TxnParams(...), send_params=SendParams(...)) -> Transaction:
  - Creates and prepares a single Algorand transaction.
  - Parameters:
    - params: A union type representing specific transaction details (e.g., PaymentParams, AssetCreateParams, AppCallParams). Exact dataclasses are available in algokit_utils.
    - send_params: A typed dictionary for controlling the transaction sending process.
      - max_rounds_to_wait_for_confirmation (int | None): Number of rounds to wait for confirmation. Defaults to waiting until the latest lastValid has passed.
      - suppress_log (bool | None): Whether to suppress log messages during transaction sending. Defaults to False (do not suppress).
      - populate_app_call_resources (bool | None): Use simulate to auto-populate app call resources. Defaults to Config.populateAppCallResources.
      - cover_app_call_inner_transaction_fees (bool | None): Use simulate to calculate and cover inner transaction fees in the parent app call. Defaults to False.
  - Returns: A Transaction object ready for signing and sending.
```

--------------------------------

TITLE: algokit dispenser fund Command
DESCRIPTION: Funds your wallet address with TestNet ALGOs. This command requires specifying the receiver address and the amount to be funded. It supports funding in both microAlgos and whole Algos.

SOURCE: https://dev.algorand.co/algokit/algokit-cli/dispenser

LANGUAGE: APIDOC
CODE:
```
algokit dispenser fund [OPTIONS]

- Funds your wallet address with TestNet ALGOs.
- Options:
  --receiver, -r: Receiver [alias](./tasks/wallet#add) or address to fund with TestNet ALGOs. This option is required.
  --amount, -a: Amount to fund. Defaults to microAlgos. This option is required.
  --whole-units: Use whole units (Algos) instead of smallest divisible units (microAlgos). Disabled by default.
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/txn

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/resources/overview

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Testnet ASA IPFS URL Example
DESCRIPTION: Example IPFS URLs used in an Algorand Testnet ASA, showcasing the standard IPFS URL and a template-based URL for dynamic content referencing.

SOURCE: https://dev.algorand.co/arc-standards/arc-0019

LANGUAGE: text
CODE:
```
ipfs://QmQZyq4b89RfaUw8GESPd2re4hJqB8bnm4kVHNtyQrHnnK

template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/setbyte

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: algokit_utils.dispenser_api.TestNetDispenserApiClient API
DESCRIPTION: API documentation for the TestNetDispenserApiClient class, used to interact with the Algorand testnet dispenser service. It provides methods for funding accounts and managing dispenser limits.

SOURCE: https://dev.algorand.co/reference/algokit-utils-py/api-reference/algokit_utils/algokit_utils_dispenser_api

LANGUAGE: APIDOC
CODE:
```
class algokit_utils.dispenser_api.TestNetDispenserApiClient:
  """Client for interacting with the Algorand testnet dispenser."""

  # Initialization
  # __init__(algod_client: AlgodClient, dispenser_address: str = "7RF7BMQ3X5V5V4X336Z5B564YQS7XX42Y4V3PB3O234Y4567890AB")
  #   Initializes the client with an AlgodClient instance and the dispenser's address.

  # Methods
  fund(account_address: str, amount: int = 10000000) -> None:
    """Funds an Algorand account with testnet ALGOs from the dispenser.

    Args:
      account_address: The address of the account to fund.
      amount: The amount of ALGOs to send (in micro-ALGOs). Defaults to 10,000,000.

    Returns:
      None.
    """

  get_limit() -> int:
    """Retrieves the current funding limit for the dispenser.

    Returns:
      The funding limit in micro-ALGOs.
    """

  refund(account_address: str, amount: int) -> None:
    """Refunds ALGOs back to the dispenser from a given account.

    Args:
      account_address: The address of the account to refund from.
      amount: The amount of ALGOs to refund (in micro-ALGOs).

    Returns:
      None.
    """

```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/sdk/sdk-list

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: AlgoKit Task Send CLI Usage
DESCRIPTION: Provides the basic command structure and options for sending signed Algorand transactions using the AlgoKit CLI.

SOURCE: https://dev.algorand.co/algokit/algokit-cli/tasks/send

LANGUAGE: Shell
CODE:
```
$ ~ algokit task send

Usage: algokit task send [OPTIONS]

Send a signed transaction to the given network.

Options:

-f, --file FILE                 Single or multiple message pack encoded signed transactions from binary file to
send. Option is mutually exclusive with transaction.
-t, --transaction TEXT          Base64 encoded signed transaction to send. Option is mutually exclusive with file.
-n, --network [localnet|testnet|mainnet]
Network to use. Refers to `localnet` by default.
-h, --help                      Show this message and exit.

```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/itxn

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Single Transaction Sending Signatures (APIDOC)
DESCRIPTION: Outlines the method signatures for sending single transactions via AlgorandClient. It specifies the parameters required for different transaction types and the structure of the result returned after sending.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/algorand-client

LANGUAGE: APIDOC
CODE:
```
algorand.send.{method}(params: {ComposerTransactionTypeParams} & CommonAppCallParams & SendParams): SingleSendTransactionResult
  - Sends a single transaction to the Algorand network.
  - Parameters:
    - {ComposerTransactionTypeParams}: Transaction-specific parameters.
    - CommonAppCallParams: Common parameters for app call transactions.
    - SendParams: Parameters controlling execution semantics (e.g., suppressLog).
  - Returns: SingleSendTransactionResult containing information about the sent transaction.
```

--------------------------------

TITLE: sendGroupOfTransactions Function
DESCRIPTION: Signs and sends a group of up to 16 Algorand transactions to the chain. This function is deprecated and users should instead use TransactionComposer or AtomicTransactionComposer for constructing and sending group transactions.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/sendgroupoftransactions

LANGUAGE: APIDOC
CODE:
```
sendGroupOfTransactions(`groupSend`, `algod`): `Promise`<`Omit`<`SendAtomicTransactionComposerResults`, "returns">>

Defined in: src/transaction/transaction.ts:957

Deprecated
Use `TransactionComposer` (`algorand.newGroup()`) or `AtomicTransactionComposer` to construct and send group transactions instead.

Signs and sends a group of [up to 16](https://developer.algorand.org/docs/get-details/atomic_transfers/#create-transactions) transactions to the chain

Parameters:

groupSend: `TransactionGroupToSend`
  The group details to send, with:
  * `transactions`: The array of transactions to send along with their signing account
  * `sendParams`: The parameters to dictate how the group is sent

algod: `AlgodClient`
  An algod client

Returns:
`Promise`<`Omit`<`SendAtomicTransactionComposerResults`, "returns">>
  An object with transaction IDs, transactions, group transaction ID (`groupTransactionId`) if more than 1 transaction sent, and (if `skipWaiting` is `false` or unset) confirmation (`confirmation`)
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/unit-testing/python/contract-testing

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: AlgoKit Task Send Command Reference
DESCRIPTION: Detailed reference for the AlgoKit Task Send command, outlining its parameters, their types, constraints, and usage.

SOURCE: https://dev.algorand.co/algokit/algokit-cli/tasks/send

LANGUAGE: APIDOC
CODE:
```
algokit task send [OPTIONS]

Send a signed transaction to the given network.

Options:
  --file, -f FILE                 Single or multiple message pack encoded signed transactions from binary file to send. Mutually exclusive with --transaction.
  --transaction, -t TEXT          Base64 encoded signed transaction to send. Mutually exclusive with --file.
  --network, -n [localnet|testnet|mainnet]
                                  Network to use. Refers to `localnet` by default.
  --help                          Show this message and exit.

Parameter Details:
  -f, --file FILE:
    Type: FILE
    Description: Path to a binary file containing single or multiple message pack encoded signed transactions to send. This option is mutually exclusive with the --transaction option.

  -t, --transaction TEXT:
    Type: TEXT
    Description: A single base64 encoded signed transaction to send. This option is mutually exclusive with the --file option. Note: This flag only supports sending a single transaction.

  -n, --network [localnet|testnet|mainnet]:
    Type: ENUM (localnet, testnet, mainnet)
    Description: Specifies the network to which the transactions will be sent. Defaults to `localnet`.

  -h, --help:
    Type: BOOLEAN
    Description: Displays the help message and exits.

Usage Notes:
  - To send multiple transactions, use the --file flag with a binary file containing the transactions.
  - The --transaction flag is only for sending a single transaction.

```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/gtxn

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Connect Node to Single Relay (Algorand CLI)
DESCRIPTION: Connects an Algorand node to a single specified relay node. The command requires the IP address and port of the relay. Use port 4161 for TestNet or 4160 for MainNet.

SOURCE: https://dev.algorand.co/nodes/reference/relay-config

LANGUAGE: shell
CODE:
```
goal node start -p "ipaddress:4161"
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/itxncreate

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: TestNetDispenserApiClient Creation
DESCRIPTION: Creates a new instance of the TestNetDispenserApiClient. It can be configured with an auth token and request timeout, or it can load credentials from environment variables.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/gettestnetdispenserapiclient

LANGUAGE: APIDOC
CODE:
```
getTestNetDispenserApiClient(params: TestNetDispenserApiClientParams | null): TestNetDispenserApiClient

Defined in: src/dispenser-client.ts:21

Deprecated: Use clientManager.getTestNetDispenser or clientManager.getTestNetDispenserFromEnvironment instead.

Description:
  Create a new TestNetDispenserApiClient instance. Refer to [docs](https://github.com/algorandfoundation/algokit/blob/main/docs/testnet_api.md) on guidance to obtain an access token.

Parameters:
  params: An object containing parameters for the TestNetDispenserApiClient class, or null if you want the client to load the access token from the environment variable ALGOKIT_DISPENSER_ACCESS_TOKEN.
    - Type: null | TestNetDispenserApiClientParams

Returns:
  TestNetDispenserApiClient: An instance of the TestNetDispenserApiClient class.

Example:
  const client = algokit.getTestNetDispenserApiClient({
    authToken: 'your_auth_token',
    requestTimeout: 15,
  })
```

LANGUAGE: typescript
CODE:
```
const client = algokit.getTestNetDispenserApiClient({
  authToken: 'your_auth_token',
  requestTimeout: 15,
})
```

--------------------------------

TITLE: Compose and Send Transaction Group
DESCRIPTION: Demonstrates composing a group of transactions, including a payment and an asset opt-in, using the Algorand SDK's TransactionComposer and sending them.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/algorand-client

LANGUAGE: typescript
CODE:
```
const result = algorand
  .newGroup()
  .addPayment({ sender: 'SENDERADDRESS', receiver: 'RECEIVERADDRESS', amount: (1).microAlgo() })
  .addAssetOptIn({ sender: 'SENDERADDRESS', assetId: 12345n })
  .send();
```

--------------------------------

TITLE: TestNetDispenserApiClient API
DESCRIPTION: Client for interacting with the AlgoKit TestNet Dispenser API. Provides methods to fund accounts, get dispenser limits, and refund assets. Authentication can be handled via an access token passed to the constructor or by setting the ALGOKIT_DISPENSER_ACCESS_TOKEN environment variable.

SOURCE: https://dev.algorand.co/reference/algokit-utils-py/api-reference/algokit_utils/algokit_utils_dispenser_api

LANGUAGE: APIDOC
CODE:
```
class algokit_utils.dispenser_api.TestNetDispenserApiClient
  Client for interacting with the [AlgoKit TestNet Dispenser API](https://github.com/algorandfoundation/algokit/blob/main/docs/testnet_api.md).

  Initialization:
    auth_token: Optional[str] = None
      The access token for the dispenser API. If not provided, it will be loaded from the ALGOKIT_DISPENSER_ACCESS_TOKEN environment variable.

  Methods:
    fund(account_address: str, amount: int = 1000000)
      Funds an Algorand account with the specified amount of Algos.
      Parameters:
        account_address: The Algorand account address to fund.
        amount: The amount of Algos to send (default is 1,000,000 microAlgos).
      Returns:
        A dictionary containing the transaction ID and status.

    get_limit(account_address: str) -> int
      Retrieves the remaining daily limit for funding an account.
      Parameters:
        account_address: The Algorand account address to check the limit for.
      Returns:
        The remaining daily limit in microAlgos.

    refund(transaction_id: str, account_address: str)
      Refunds a previous transaction, returning the Algos to the dispenser.
      Parameters:
        transaction_id: The ID of the transaction to refund.
        account_address: The Algorand account address from which the transaction originated.
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/unit-testing/typescript/contract-testing

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Send Payment with Manual Signer (Python)
DESCRIPTION: Shows how to send a payment transaction by manually specifying the signer. This approach is used when the AlgorandClient should not automatically manage or cache the signing credentials for a given account.

SOURCE: https://dev.algorand.co/algokit/utils/algokit-clients

LANGUAGE: python
CODE:
```
"""
If you don't want the Algorand client to cache the signer,
you can manually provide the signer.
"""
algorand_client.send.payment(
    PaymentParams(
        sender=account_a.address,
        receiver=account_b.address,
        amount=AlgoAmount(algo=1),
        signer=account_a.signer,  # The signer must be manually provided
    )
)
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/unit-testing/python/signature-testing

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/overview

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/setbit

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/unit-testing/python/overview

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/rest-api/overview

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/unit-testing/python/state-management

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/rest-api/kmd

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/utils/python/testing

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/voterparams

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: ARC-59 Send Asset Information
DESCRIPTION: Retrieves information required for sending an asset via the ARC-59 router. This includes details about the receiver and the router's state regarding the asset and minimum balance requirements.

SOURCE: https://dev.algorand.co/arc-standards/arc-0059

LANGUAGE: APIDOC
CODE:
```
Function: ARC59_getSendAssetInfo

Description: Determines relevant information about the receiver and the router for sending an asset.

Returns: A tuple containing:
  - itxns (uint64): The number of inner transactions required.
  - mbr (uint64): The amount of ALGO the sender MUST send to the router contract to cover Minimum Balance Requirement (MBR).
  - routerOptedIn (bool): Whether the router is already opted in to the asset.
  - receiverOptedIn (bool): Whether the receiver is already directly opted in to the asset.
  - receiverAlgoNeededForClaim (uint64): The amount of ALGO the receiver would currently need to claim the asset.

Usage Example:
  // Assuming 'sender', 'assetId', 'receiverAddress' are defined
  const sendAssetInfo = ARC59_getSendAssetInfo(sender, assetId, receiverAddress);
  // Use sendAssetInfo.itxns, sendAssetInfo.mbr, etc. to construct the transaction.
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/unit-testing/python/concepts/index

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```

--------------------------------

TITLE: Algorand Transaction Sending Functions (algokit-utils-ts)
DESCRIPTION: Provides functions for sending various types of Algorand transactions, including atomic groups and individual transactions. These functions abstract away much of the complexity of transaction construction and submission.

SOURCE: https://dev.algorand.co/algokit/unit-testing/typescript/signature-testing

LANGUAGE: APIDOC
CODE:
```
sendAtomicTransactionComposer:
  Description: Sends an atomic transaction composer.
  Parameters: (composer: AtomicTransactionComposer)
  Returns: Promise<SendTransactionResult>

sendGroupOfTransactions:
  Description: Sends a group of transactions.
  Parameters: (transactions: Transaction[], signer: Signer)
  Returns: Promise<SendTransactionResult>

sendTransaction:
  Description: Sends a single transaction.
  Parameters: (transaction: Transaction, signer: Signer)
  Returns: Promise<SendTransactionResult>
```