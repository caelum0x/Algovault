================
CODE SNIPPETS
================
TITLE: Wait for Specific Algorand Block
DESCRIPTION: Shows how to use `algod.status_after_block` to pause execution until a specific round number is available. This method is useful for manual polling or synchronization checks when direct control over waiting is needed.

SOURCE: https://dev.algorand.co/algokit/subscribers/python/overview

LANGUAGE: Python
CODE:
```
algod.status_after_block(round_number_to_wait_for)
```

--------------------------------

TITLE: Shutdown Node API Endpoint
DESCRIPTION: Details for the POST /v2/shutdown API endpoint used to gracefully shut down the node. It supports an optional timeout parameter for delayed shutdown.

SOURCE: https://dev.algorand.co/reference/rest-api/algod

LANGUAGE: APIDOC
CODE:
```
POST /v2/shutdown

Special management endpoint to shutdown the node. Optionally provide a timeout parameter to indicate that the node should begin shutting down after a number of seconds.

Parameters:
  timeout (query, integer, false): none

Responses:
  200 OK: none
    Schema: {}

Authentication:
  api_key
```

--------------------------------

TITLE: Graceful Shutdown with Node.js Signals
DESCRIPTION: Demonstrates how to handle Node.js process signals (SIGINT, SIGTERM, SIGQUIT) to gracefully stop the Algorand subscriber, ensuring clean shutdown procedures.

SOURCE: https://dev.algorand.co/algokit/subscribers/typescript/subscriber

LANGUAGE: javascript
CODE:
```
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal =>
  process.on(signal, () => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}; stopping subscriber...`);
    subscriber.stop(signal).then(() => console.log('Subscriber stopped'));
  }),
);

```

--------------------------------

TITLE: Graceful Subscriber Shutdown with Node.js Signals
DESCRIPTION: Sets up signal handlers for common Node.js process signals (SIGINT, SIGTERM, SIGQUIT) to gracefully stop the AlgorandSubscriber. It calls `subscriber.stop()` and allows awaiting its completion.

SOURCE: https://dev.algorand.co/algokit/subscribers/typescript/overview

LANGUAGE: javascript
CODE:
```
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal =>
  process.on(signal, () => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}; stopping subscriber...`);
    subscriber.stop(signal);
  }),
);
```

--------------------------------

TITLE: algopy.op.err: Fail Immediately
DESCRIPTION: Documents the `err()` function which halts the program immediately. This function is a direct mapping to the TEAL `err` opcode, used for explicit program termination.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: APIDOC
CODE:
```
algopy.op.err()
  Fail immediately.
  :returns typing.Never: Halts program

Native TEAL opcode: [`err`](https://developer.algorand.org/docs/get-details/dapps/avm/teal/opcodes/v10/#err)
```

--------------------------------

TITLE: Nodekit Stop Command
DESCRIPTION: Stops the Algorand daemon on the local machine. The daemon can be forcefully stopped. This operation requires the daemon to be installed on the system.

SOURCE: https://dev.algorand.co/nodes/nodekit-reference/commands

LANGUAGE: APIDOC
CODE:
```
nodekit stop [flags]
  -f, --force   forcefully stop the node
  -h, --help    help for stop
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/replacedeploytimecontrolparams

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand TypeScript err() Function
DESCRIPTION: The err() function in the Algorand TypeScript library is used to raise an error and halt the execution of the program. It accepts an optional string message to provide context for the error.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/functions/err

LANGUAGE: APIDOC
CODE:
```
err(message?): never

  Raises an error and halts execution.

  Defined in: packages/algo-ts/src/util.ts:27

  Parameters:
    message? (string): The message to accompany the error.

  Returns:
    never: This function never returns, as it always throws an error.
```

--------------------------------

TITLE: Abort Catchup API Endpoint
DESCRIPTION: Demonstrates how to abort a catchpoint catchup operation using the Algorand API. Includes examples for various client libraries and command-line tools.

SOURCE: https://dev.algorand.co/reference/rest-api/algod

LANGUAGE: APIDOC
CODE:
```
DELETE /v2/catchup/{catchpoint}
  Aborts a catchpoint catchup.

  Given a catchpoint, it aborts catching up to this catchpoint.

  Parameters:
    catchpoint (path, string, required): A catch point

  Authentication:
    api_key (header: X-Algo-API-Token)

  Responses:
    200 OK: An catchpoint abort response.
      Schema:
        catchup-message (string, required): Catchup abort response string
    400 Bad Request: Bad Request
    401 Unauthorized: Invalid API Token
    500 Internal Server Error: Internal Error
    default: Unknown Error

  Example Responses:
    200 Response:
      {
        "catchup-message": "string"
      }
```

LANGUAGE: curl
CODE:
```
curl -X DELETE http://localhost/v2/catchup/{catchpoint} \
-H 'Accept: application/json' \
-H 'X-Algo-API-Token: API_KEY'
```

LANGUAGE: javascript
CODE:
```
const headers = {
'Accept':'application/json',
'X-Algo-API-Token':'API_KEY'
};

fetch('http://localhost/v2/catchup/{catchpoint}',
{
method: 'DELETE',
headers: headers
})
.then(function(res) {
return res.json();
}).then(function(body) {
console.log(body);
});
```

LANGUAGE: ruby
CODE:
```
require 'rest-client'
require 'json'
headers = {
'Accept' => 'application/json',
'X-Algo-API-Token' => 'API_KEY'
}
result = RestClient.delete 'http://localhost/v2/catchup/{catchpoint}',
params: {},
headers: headers
p JSON.parse(result)
```

LANGUAGE: python
CODE:
```
import requests
headers = {
'Accept': 'application/json',
'X-Algo-API-Token': 'API_KEY'
}
r = requests.delete('http://localhost/v2/catchup/{catchpoint}', headers = headers)
print(r.json())
```

LANGUAGE: php
CODE:
```
require 'vendor/autoload.php';
$headers = array(
'Accept' => 'application/json',
'X-Algo-API-Token' => 'API_KEY',
);
$client = new \GuzzleHttp\Client();
// Define array of request body.
$request_body = array();
try {
$response = $client->request('DELETE','http://localhost/v2/catchup/{catchpoint}', array(
'headers' => $headers,
'json' => $request_body,
)
);
print_r($response->getBody()->getContents());
}
catch (\GuzzleHttp\Exception\BadResponseException $e) {
// handle exception or api errors.
print_r($e->getMessage());
}
```

LANGUAGE: java
CODE:
```
URL obj = new URL("http://localhost/v2/catchup/{catchpoint}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("DELETE");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
response.append(inputLine);
}
in.close();
System.out.println(response.toString());
```

LANGUAGE: go
CODE:
```
package main

import (
"bytes"
"net/http"
)

func main() {
headers := map[string][]string{
"Accept": []string{"application/json"},
"X-Algo-API-Token": []string{"API_KEY"},
}

data := bytes.NewBuffer([]byte{jsonReq})
req, err := http.NewRequest("DELETE", "http://localhost/v2/catchup/{catchpoint}", data)
req.Header = headers
client := &http.Client{}
resp, err := client.Do(req)
// ...
}
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/enumerations/eventtype

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/substring

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand LastHeartbeat Handling for Payouts
DESCRIPTION: Explains how the `LastHeartbeat` field is managed to prevent immediate suspension after key registration or significant balance increases, ensuring fair payout eligibility.

SOURCE: https://dev.algorand.co/concepts/protocol/staking-rewards

LANGUAGE: APIDOC
CODE:
```
LastHeartbeat Management for Payouts:

Keyreg to Go Online:
- When `keyreg` makes an account `IncentiveEligible`:
  - `LastHeartbeat` field is set 320 rounds into the future.
  - Treats account as if it proposed in the first round it is online.

Large Algo Increases:
- If an online, `IncentiveEligible` account balance doubles from a single `Pay` transaction:
  - `LastHeartbeat` is incremented to 320 rounds past the current round.
- Mitigates risk of suspension due to shrinking expected proposal interval.

Impact of LastHeartbeat:
- Used in proposal-time checks to determine if an account has proposed recently enough.
- Prevents suspension for accounts that just became eligible or increased stake significantly.
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/waitforconfirmation

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: algosdk: Wait for Transaction Confirmation
DESCRIPTION: Blocks execution until a pending transaction is confirmed on the Algorand network. It requires an algod client instance and the transaction ID. An optional parameter `wait_rounds` can be set to limit the number of rounds to wait before raising an exception, defaulting to 1000 rounds.

SOURCE: https://dev.algorand.co/reference/algokit-utils-py/api-reference/algosdk/algosdktransaction

LANGUAGE: APIDOC
CODE:
```
algosdk.transaction.wait_for_confirmation(algod_client: algosdk.v2client.algod.AlgodClient, txid: str, wait_rounds: int = 0, **kwargs)

  Block until a pending transaction is confirmed by the network.

  Args:
    algod_client (algod.AlgodClient): Instance of the `algod` client used to interact with the network.
    txid (str): The unique identifier of the transaction to wait for.
    wait_rounds (int, optional): The number of rounds to block for before exiting with an Exception. If not supplied, this defaults to 1000.
    **kwargs: Additional keyword arguments to pass to the underlying client calls.
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/captransactionfee

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/nodes/installation/catchup-status

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/controlfees

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: algosdk.transaction.wait_for_confirmation Function
DESCRIPTION: Waits for a transaction to be confirmed on the Algorand network.

SOURCE: https://dev.algorand.co/reference/algokit-utils-py/api-reference/algosdk/algosdktransaction

LANGUAGE: APIDOC
CODE:
```
algosdk.transaction.wait_for_confirmation(client, tx_id, timeout=60)
  # Waits for a transaction to be confirmed on the Algorand network.
  # Parameters:
  #   client: The Algorand client instance.
  #   tx_id: The ID of the transaction to wait for.
  #   timeout: The maximum time in seconds to wait.
  # Returns:
  #   dict: The confirmed transaction information.
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/compileteal

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Account Suspension for Absenteeism
DESCRIPTION: Describes the mechanism for suspending accounts that fail to propose blocks as expected. This includes the expected proposal interval and the grace period before suspension.

SOURCE: https://dev.algorand.co/concepts/protocol/staking-rewards

LANGUAGE: APIDOC
CODE:
```
Account Suspension - Absenteeism:

Expected Proposal Interval:
- `n = TotalOnlineStake / AccountOnlineStake` rounds.
- Example: 2% online stake implies proposing once every 50 rounds.

Suspension Condition:
- Account considered absent if it fails to produce a block over `20n` rounds.

Implementation:
- Mechanism in `generateKnockOfflineAccountsList` in `eval/eval.go`.
- Absent accounts added to `AbsentParticipationAccounts` list in block header.
- Suspension: `Status` changed to `Offline`, `IncentiveEligible` set to false.
- Voting keys retained.

Related Mechanisms:
- Similar to mechanism for knocking accounts offline due to expired voting keys.
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/encodelease

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: nodekit catchup Command
DESCRIPTION: Enables Fast-Catchup for an Algorand node, allowing it to sync with the network more rapidly than standard synchronization methods. Note that not all networks support this feature.

SOURCE: https://dev.algorand.co/nodes/nodekit-reference/commands

LANGUAGE: APIDOC
CODE:
```
nodekit catchup [flags]

Options:
  -d, --datadir string   Data directory for the node
  -h, --help             help for catchup
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getapponcompleteaction

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/functions/err

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/functions/ensurebudget

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/assetoptout

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Nodekit Catchup Commands
DESCRIPTION: Manages the node's catchup process to synchronize with the latest catchpoint. Includes starting and stopping the fast-catchup feature, which syncs the node to the latest catchpoint. Sync times vary based on network conditions and data volume. Note that not all networks support Fast-Catchup.

SOURCE: https://dev.algorand.co/nodes/nodekit-reference/commands

LANGUAGE: APIDOC
CODE:
```
nodekit catchup start [flags]
  -d, --datadir string   Data directory for the node
  -h, --help             help for start

nodekit catchup stop [flags]
  -d, --datadir string   Data directory for the node
  -h, --help             help for stop
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/createasset

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/assetholding

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/decodeappstate

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getabireturn

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/ecdsapkdecompress

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Wait for Specific Block with Algorand SDK
DESCRIPTION: Demonstrates how to manually wait for a specific round to become available using the Algorand SDK. This method is useful for custom polling logic outside the subscriber.

SOURCE: https://dev.algorand.co/algokit/subscribers/typescript/overview

LANGUAGE: javascript
CODE:
```
await algod.statusAfterBlock(roundNumberToWaitFor).do();
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/callapp

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/mnemonicaccount

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/-internal-/interfaces/assetfreezetxn

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/bitlength

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getaccountaddressasstring

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/randomaccount

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/variables/teal_file_ext

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/createapp

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getappargsfortransaction

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/algokit/languages/python/lg-errors

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/ecdsapkrecover

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getappclient

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/nodes/nodekit-quick-start

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/updateapp

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/isschemaisbroken

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/interfaces/avmtraceseventdata

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/interfaces/tealsourcesdebugeventdata

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-py/api-reference/algokit_utils/algokit_utils_logic_error

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/appoptedin

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/variables/algokit_dir

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/algokit/languages/python/lg-calling-apps

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/interfaces/tealsourcedebugeventdata

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/nodes/nodekit-reference/commands

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/assetoptin

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/istestnet

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/algokit/languages/python/lg-control

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/deployapp

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/functions/emit

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/performtemplatesubstitution

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/algo

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: MaxCatchpointDownloadDuration
DESCRIPTION: Defines the maximum duration a client will keep an outgoing connection for a catchpoint download request open. This is a client-side setting, useful for networks with large catchpoint files or slow connections/storage.

SOURCE: https://dev.algorand.co/nodes/reference/config-settings

LANGUAGE: APIDOC
CODE:
```
MaxCatchpointDownloadDuration:
  Description: Defines the maximum duration a client will be keeping the outgoing connection of a catchpoint download request open for processing before shutting it down. Networks that have large catchpoint files, slow connection or slow storage could be a good reason to increase this value. Note that this is a client-side only configuration value, and it’s independent of the actual catchpoint file size.
  Default Value: 43200000000000
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/event-emitter

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/type-aliases/eventdatamap

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/variables/sources_dir

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/expw

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/namespaces/itxn/functions/assetfreeze

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/variables/config

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/extractuint64

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getorcreatekmdwalletaccount

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/assetbulkoptout

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/transactionfees

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/microalgo

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getappglobalstate

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/replace

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/algokit/languages/python/lg-unsupported-python-features

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getapplocalstate

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/bsqrt

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getaccountassetinformation

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/shr

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/islocalnet

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/rekeyedaccount

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/itob

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/variables/max_app_call_account_references

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/algos

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getalgonodeconfig

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getcreatorappsbyname

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/bzero

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/ismainnet

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/arc4/classes/dynamicbytes

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```

--------------------------------

TITLE: Algorand Transaction Confirmation Utility (algokit-utils-ts)
DESCRIPTION: Utility function to wait for an Algorand transaction to be confirmed on the network. This is essential for ensuring transaction completion before proceeding.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/functions/extractuint32

LANGUAGE: APIDOC
CODE:
```
waitForConfirmation:
  Description: Waits for a transaction to be confirmed.
  Parameters: (txId: string, algodClient: AlgodClient, timeout?: number)
  Returns: Promise<TransactionReceipt>
```