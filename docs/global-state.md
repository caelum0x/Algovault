================
CODE SNIPPETS
================
TITLE: Dynamic Global State Access in Algorand TypeScript
DESCRIPTION: Illustrates how to interact with Algorand's global state using dynamic keys within a smart contract. This requires explicitly reserving state space using the `@contract` decorator and accessing state via `GlobalState` with a variable key.

SOURCE: https://dev.algorand.co/algokit/languages/typescript/lg-storage

LANGUAGE: typescript
CODE:
```
// If using dynamic keys, state must be explicitly reserved
@contract({ stateTotals: { globalBytes: 5 } })
class DynamicAccessContract extends Contract {
 test(key: string, value: string) {
 // Interact with state using a dynamic key
 const dynamicAccess = GlobalState<string>({ key });
 dynamicAccess.value = value;
 }
}
```

--------------------------------

TITLE: Declare Global State in Algorand TypeScript
DESCRIPTION: Demonstrates how to declare global state variables for Algorand smart contracts using the `GlobalState` utility from the Algorand TypeScript SDK. It covers defining state with `uint64` and `bytes` types, setting initial values, and overriding default keys.

SOURCE: https://dev.algorand.co/algokit/languages/typescript/lg-storage

LANGUAGE: typescript
CODE:
```
import {
 GlobalState,
 Contract,
 uint64,
 bytes,
 Uint64,
 contract,
 } from '@algorandfoundation/algorand-typescript';

class DemoContract extends Contract {
 // The property name 'globalInt' will be used as the key
 globalInt = GlobalState<uint64>({ initialValue: Uint64(1) });

 // Explicitly override the key
 globalBytes = GlobalState<bytes>({ key: 'alternativeKey' });
}
```

--------------------------------

TITLE: Set and Get Global State with Algorand TypeScript
DESCRIPTION: Illustrates how to set and retrieve values from an application's global state using `op.AppGlobal.put` and `op.AppGlobal.getUint64`. This is fundamental for managing contract-level data.

SOURCE: https://dev.algorand.co/algokit/unit-testing/typescript/opcodes

LANGUAGE: TypeScript
CODE:
```
import { arc4, bytes, Bytes, op, uint64, Uint64 } from '@algorandfoundation/algorand-typescript';

import { TestExecutionContext } from '@algorandfoundation/algorand-typescript-testing';

class StateContract extends arc4.Contract {

@arc4.abimethod()

setAndGetState(key: bytes, value: uint64): uint64 {

op.AppGlobal.put(key, value);

return op.AppGlobal.getUint64(key);

}

}

// Create the context manager for snippets below

const ctx = new TestExecutionContext();

const contract = ctx.contract.create(StateContract);

const key = Bytes('test_key');

const value = Uint64(42);

const result = contract.setAndGetState(key, value);

expect(result).toEqual(value);

const [storedValue, _] = ctx.ledger.getGlobalState(contract, key);

expect(storedValue?.value).toEqual(42);

```

--------------------------------

TITLE: Read Global State in TypeScript
DESCRIPTION: Demonstrates reading all global state values from an Algorand smart contract using TypeScript. This method returns a tuple containing values for global integers, bytes, and account addresses, accessing them via their respective properties.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/global

LANGUAGE: TypeScript
CODE:
```
/**
* Reads and returns all global state values from the contract
* @returns A tuple containing [globalInt, globalIntNoDefault, globalBytes, globalString, globalBool, globalAccount]
* where each value corresponds to the current state of the respective global variable
*/
public readGlobalState(): [uint64, uint64, bytes, string, boolean, arc4.Address] {
// Convert Account reference type to native Address type for return value
const accountAddress = new arc4.Address(this.globalAccount.value)
return [
this.globalInt.value,
this.globalIntNoDefault.value,
this.globalBytes.value,
this.globalString.value,
this.globalBool.value,
accountAddress,
]
}
```

--------------------------------

TITLE: Delete Global State in Algorand
DESCRIPTION: Illustrates how to delete global state entries from an Algorand smart contract. This includes examples in TypeScript, Python, and TEAL, showing how to remove specific global state variables using `delete()` or `app_global_del`.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/global

LANGUAGE: TypeScript
CODE:
```
@arc4.abimethod()
public deleteGlobalState(): boolean {
  this.globalInt.delete()
  return true
}
```

LANGUAGE: Python
CODE:
```
@arc4.abimethod
def del_global_state(self) -> bool:
  del self.global_int_full.value
  return True
```

LANGUAGE: TEAL
CODE:
```
#pragma version 10
del_global_state:
  proto 0 1
  byte "global_int_full"
  app_global_del
  int 1
  retsub
```

--------------------------------

TITLE: Write Global State in Algorand
DESCRIPTION: Demonstrates how to write multiple global state values in Algorand smart contracts. This includes updating string, boolean, and account-related global state variables.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/global

LANGUAGE: TypeScript
CODE:
```
/**
* Updates multiple global state values
* @param valueBytes New value for globalBytes
* @param valueBool New value for globalBool
* @param valueAccount New value for globalAccount
*/
public writeGlobalState(valueString: string, valueBool: boolean, valueAccount: Account): void {
  this.globalString.value = valueString
  this.globalBool.value = valueBool
  this.globalAccount.value = valueAccount

  assert(this.globalString.value === valueString)
  assert(this.globalBool.value === valueBool)
  assert(this.globalAccount.value === valueAccount)
}
```

--------------------------------

TITLE: Define and Use Global State
DESCRIPTION: Demonstrates how to define global state variables within an Algorand smart contract using `algots.GlobalState`. It shows how to initialize state with default values and how to update them during testing.

SOURCE: https://dev.algorand.co/algokit/unit-testing/typescript/state-management

LANGUAGE: TypeScript
CODE:
```
class MyContract extends algots.arc4.Contract {

stateA = algots.GlobalState<algots.uint64>({ key: 'globalStateA' });

stateB = algots.GlobalState({ initialValue: algots.Uint64(1), key: 'globalStateB' });

}

// In your test

const contract = ctx.contract.create(MyContract);

contract.stateA.value = algots.Uint64(10);

contract.stateB.value = algots.Uint64(20);
```

--------------------------------

TITLE: Define ARC4 Application State with Proxies
DESCRIPTION: Illustrates how to declare application state (global, local, and box state) by defining instance properties using state proxy types like `GlobalState`, `LocalState`, and `Box`. `GlobalState` supports an `initialValue` and custom `key`, while `Box` proxies always require an explicit key.

SOURCE: https://dev.algorand.co/algokit/languages/typescript/lg-program-structure

LANGUAGE: typescript
CODE:
```
import {
  Contract,
  uint64,
  bytes,
  GlobalState,
  LocalState,
  Box,
} from '@algorandfoundation/algorand-typescript';

export class ContractWithState extends Contract {
  globalState = GlobalState<uint64>({ initialValue: 123, key: 'customKey' });
  localState = LocalState<string>();
  boxState = Box<bytes>({ key: 'boxKey' });
}
```

--------------------------------

TITLE: Put Global State (algopy)
DESCRIPTION: Writes a value to a specified key in the global state of the current application. It takes a state key and the value to be written as input. The value can be bytes or an integer.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: python
CODE:
```
algopy.global_state.put(a: algopy.Bytes | bytes, b: algopy.Bytes | algopy.UInt64 | bytes | int, /) -> None
```

--------------------------------

TITLE: Algorand Global State Initialization (TypeScript)
DESCRIPTION: Demonstrates the declaration and initialization of global state variables in Algorand smart contracts using TypeScript. It covers defining state for various data types like unsigned integers, bytes, strings, booleans, and account references, including options for default values.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/global

LANGUAGE: typescript
CODE:
```
public globalInt = GlobalState<uint64>({ initialValue: Uint64(50) }) // UInt64 with default value

public globalIntNoDefault = GlobalState<uint64>() // UInt64 with no default value

public globalBytes = GlobalState<bytes>({ initialValue: Bytes('Silvio') }) // Bytes with default value

public globalString = GlobalState<string>({ initialValue: 'Micali' }) // Bytes with default value

public globalBool = GlobalState({ initialValue: true }) // Bool with default value

public globalAccount = GlobalState<Account>() // Address with no default value
```

--------------------------------

TITLE: Access Algorand State with Typed Client
DESCRIPTION: Demonstrates how to use a typed Algorand client to access global, local, and box state. It covers retrieving individual state keys and values from maps, showcasing the client's methods for state interaction.

SOURCE: https://dev.algorand.co/algokit/client-generator/typescript

LANGUAGE: typescript
CODE:
```
const factory = algorand.client.getTypedAppFactory(Arc56TestFactory, { defaultSender: 'SENDER' });

const { appClient: client } = await factory.send.create.createApplication({

args: [],

deployTimeParams: { someNumber: 1337n },

});

expect(await client.state.global.globalKey()).toBe(1337n);

expect(await anotherAppClient.state.global.globalKey()).toBe(1338n);

expect(await client.state.global.globalMap.value('foo')).toEqual({ foo: 13n, bar: 37n });

await client.appClient.fundAppAccount({ amount: microAlgos(1_000_000) });

await client.send.optIn.optInApplication({ args: [], populateAppCallResources: true });

expect(await client.state.local(defaultSender).localKey()).toBe(1337n);

expect(await client.state.local(defaultSender).localMap.value('foo')).toBe('bar');

expect(await client.state.box.boxKey()).toBe('baz');

expect(
await client.state.box.boxMap.value({
add: { a: 1n, b: 2n },
subtract: { a: 4n, b: 3n },
}),
).toEqual({
sum: 3n,
difference: 1n,
});
```

--------------------------------

TITLE: GlobalStateOptions Type Alias
DESCRIPTION: Defines the configuration options for declaring a global state field within an Algorand smart contract using the algorand-typescript library. It allows specifying an optional initial value and an optional custom key for the state field.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/type-aliases/globalstateoptions

LANGUAGE: APIDOC
CODE:
```
GlobalStateOptions Type Alias

Options for declaring a global state field in Algorand applications using algorand-typescript.

Defined in: packages/algo-ts/src/state.ts:26

Type Parameters:
• ValueType

Type declaration:
GlobalStateOptions<ValueType>: object
  initialValue?: ValueType
    An initial value to assign to this global state field when the application is created
  key?: bytes | string
    The key to be used for this global state field.
    Defaults to the name of the property this proxy is assigned to

Related:
[Previous GlobalState](/reference/algorand-typescript/api-reference/index/type-aliases/globalstate)
[Next LocalState](/reference/algorand-typescript/api-reference/index/type-aliases/localstate)
```

--------------------------------

TITLE: Algorand Global State Put Operation
DESCRIPTION: Enables writing data to the global state of an Algorand application. This function allows storing either a uint64 or bytes value under a specified key. It corresponds to the app_global_put TEAL opcode.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/appglobal

LANGUAGE: APIDOC
CODE:
```
put(key: bytes, value: uint64 | bytes): void
  - Writes a value to the global state of the current application.
  - Parameters:
    - key: The key (bytes) to write to in global state.
    - value: The value to store, which can be a uint64 or bytes.
  - Returns:
    - void
  - See:
    - Native TEAL opcode: app_global_put
    - Min AVM version: 2
```

--------------------------------

TITLE: Algorand State Access API
DESCRIPTION: Defines the structure and methods for accessing Algorand application state (global, local, box) via a typed client. This includes accessing registered keys and map entries.

SOURCE: https://dev.algorand.co/algokit/client-generator/typescript

LANGUAGE: APIDOC
CODE:
```
State Access:
  Access local, global, and box storage state.

  Properties:
    state.global: Access global state.
    state.local(address): Access local state for a specific address.
    state.box: Access box storage state.

  Key Access:
    For registered keys (e.g., 'myKey'):
      {keyName}(): Retrieves the value associated with the key.
      Example: client.state.global.myKey()

  Map Access:
    For registered maps (e.g., 'myMap'):
      value(key): Retrieves a single value from the map by its key.
        Parameters:
          key: The key within the map.
        Example: client.state.global.myMap.value('mapKey')
      getMap(): Retrieves all values from the map as an object.
        Example: client.state.global.myMap.getMap()

  Return Types:
    Values are returned as their corresponding TypeScript types defined in the app spec.
    Structs are parsed into their respective object structures.
```

--------------------------------

TITLE: Algorand Global State Manipulation Opcodes
DESCRIPTION: This section details the TEAL opcodes used for interacting with Algorand's global state. Global state stores key-value pairs associated with an application, with keys as byte slices and values as byte slices or uint64. The number of state entries is limited by the initial application configuration.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/global

LANGUAGE: APIDOC
CODE:
```
APIDOC:
  Global State Storage Opcodes:

  app_global_put(key: bytes, value: bytes | uint64)
    - Description: Writes a key-value pair to the application's global state.
    - Parameters:
      - key: The byte slice representing the state key.
      - value: The value to store, which can be a byte slice or a uint64.
    - Returns: None. Operation succeeds or fails based on state limits and validity.
    - Limitations: Subject to global state entry limits and key/value size constraints.

  app_global_get(key: bytes) -> bytes | uint64 | Error
    - Description: Reads a value from the application's global state using its key.
    - Parameters:
      - key: The byte slice representing the state key to retrieve.
    - Returns: The value associated with the key (byte slice or uint64), or an error if the key does not exist or the operation fails.

  app_global_get_ex(key: bytes) -> (OnComplete: uint64, value: bytes | uint64) | Error
    - Description: Reads a value from global state along with its existence status. This is useful for distinguishing between a zero value and a non-existent key.
    - Parameters:
      - key: The byte slice representing the state key to retrieve.
    - Returns:
      - A tuple containing: 
        - OnComplete: A uint64 indicating if the key exists (1) or not (0).
        - value: The value associated with the key (byte slice or uint64) if it exists.
      - Returns an error if the operation fails.

  app_global_del(key: bytes)
    - Description: Deletes a key-value pair from the application's global state.
    - Parameters:
      - key: The byte slice representing the state key to delete.
    - Returns: None. Operation succeeds or fails based on key existence and permissions.

  Related Concepts:
    - Local State: State specific to each account interacting with the application.
    - State Schema: Defines the maximum number of global and local state entries allowed for an application.
```

--------------------------------

TITLE: Algorand TEAL Opcodes: Global State Modification
DESCRIPTION: Documentation for TEAL opcodes used to modify global application state. Covers writing values to specific keys within the global state.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: APIDOC
CODE:
```
app_global_put
  Writes a value to a key in the global state of the current application.
  Parameters:
    - key: The state key (bytes).
    - value: The value to write (bytes or uint64).
  Returns:
    - None.
  Native TEAL opcode: [`app_global_put`](https://developer.algorand.org/docs/get-details/dapps/avm/teal/opcodes/v10/#app_global_put)
```

--------------------------------

TITLE: Manage Algorand AppGlobal State (algopy)
DESCRIPTION: Provides methods to interact with the global state of an Algorand application. This includes deleting keys from the global state. These operations map to native TEAL opcodes like `app_global_del`.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: python
CODE:
```
class AppGlobal:
    @staticmethod
    def delete(a: algopy.Bytes | bytes, /) -> None
```

LANGUAGE: APIDOC
CODE:
```
AppGlobal.delete(state_key)
  - Description: Deletes a key from the global state of the current application. Deleting a non-existent key has no effect.
  - Parameters:
    - state_key: The key (bytes) to delete from the global state.
  - Returns: None.
  - Native TEAL opcode: app_global_del
```

--------------------------------

TITLE: Get Algorand Global State
DESCRIPTION: Retrieves the global state for a specified Algorand application ID. This method is part of the AppManager instance and returns the state data.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/app

LANGUAGE: javascript
CODE:
```
const globalState = await algorand.app.getGlobalState(12345n);
```

--------------------------------

TITLE: Global and GlobalState
DESCRIPTION: Accesses global state values of an application. `Global` provides access to native TEAL global variables, while `GlobalState` represents the application's global state.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
Global:
  Description: Get Global values. Native TEAL op: `global`.
  Purpose: Accesses global variables defined within the Algorand protocol (e.g., `Txn.sender`, `Balance`).
  Source: Algorand TEAL opcodes.
  Related: `GlobalState`, `Txn`
```

LANGUAGE: APIDOC
CODE:
```
GlobalState:
  Description: Global state associated with the application, the key will be the name of the member, this is assigned to.
  Purpose: Manages the application's global key-value storage.
  Assignment: Keys are derived from member names.
  Related: `Global`, `LocalState`
```

--------------------------------

TITLE: Access Global State in Contracts
DESCRIPTION: Shows how to access global state variables within an ARC4 smart contract using the `op.Global` namespace. This example retrieves `minTxnFee` and `minBalance` and sums them, demonstrating interaction with the Algorand network's global configuration.

SOURCE: https://dev.algorand.co/algokit/unit-testing/typescript/opcodes

LANGUAGE: typescript
CODE:
```
import { TestExecutionContext } from '@algorandfoundation/algorand-typescript-testing';

import { op, arc4, uint64, Uint64 } from '@algorandfoundation/algorand-typescript';


class MyContract extends arc4.Contract {

@arc4.abimethod()

checkGlobals(): uint64 {

return op.Global.minTxnFee + op.Global.minBalance;

}

}

// Create the context manager for snippets below

const ctx = new TestExecutionContext();

ctx.ledger.patchGlobalData({

minTxnFee: 1000,

minBalance: 100000,

});

const contract = ctx.contract.create(MyContract);

const result = contract.checkGlobals();

expect(result).toEqual(101000);
```

--------------------------------

TITLE: Decode Algorand App State
DESCRIPTION: Decodes the raw global state response from the Algorand algod API into a user-friendly object. It provides parsed versions of keys and values, including base64, UTF-8, and raw binary representations.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/app

LANGUAGE: javascript
CODE:
```
const globalAppState = /* value from algod */

const appState = AppManager.decodeAppState(globalAppState)

const keyAsBinary = appState['value1'].keyRaw
const keyAsBase64 = appState['value1'].keyBase64

if (typeof appState['value1'].value === 'string') {
  const valueAsString = appState['value1'].value
  const valueAsBinary = appState['value1'].valueRaw
  const valueAsBase64 = appState['value1'].valueBase64
} else {
  const valueAsNumberOrBigInt = appState['value1'].value
}
```

--------------------------------

TITLE: Get Global Bytes (algopy)
DESCRIPTION: Retrieves a byte value from the global state of the current application. It takes a state key as input and returns the associated byte value. If the key does not exist, it returns a zero value of type uint64.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: python
CODE:
```
algopy.global_state.get_bytes(a: algopy.Bytes | bytes, /) -> algopy.Bytes
```

--------------------------------

TITLE: Accessing Algorand State with Typed Factory
DESCRIPTION: This snippet demonstrates how to use a typed app factory to interact with Algorand application state. It shows accessing global, local, and box storage, including maps and individual keys. The example also includes application creation, account funding, and opting into an application, highlighting how state values are retrieved and asserted.

SOURCE: https://dev.algorand.co/algokit/client-generator/python

LANGUAGE: Python
CODE:
```
factory = algorand.client.get_typed_app_factory(Arc56TestFactory, default_sender="SENDER")

result, client = factory.send.create.create_application(

args=[],

compilation_params={"deploy_time_params": {"some_number": 1337}},

)

assert client.state.global_state.global_key() == 1337

assert another_app_client.state.global_state.global_key() == 1338

assert client.state.global_state.global_map.value("foo") == {

foo: 13,

bar: 37,

}

client.appClient.fund_app_account(

FundAppAccountParams(amount=AlgoAmount.from_micro_algos(1_000_000))

)

client.send.opt_in.opt_in_to_application(

args=[],

)

assert client.state.local(defaultSender).local_key() == 1337

assert client.state.local(defaultSender).local_map.value("foo") == "bar"

assert client.state.box.box_key() == "baz"

assert client.state.box.box_map.value({

add: { a: 1, b: 2 },

subtract: { a: 4, b: 3 },

}) == {

sum: 3,

difference: 1,

}
```

--------------------------------

TITLE: algopy.GlobalState Class
DESCRIPTION: Documentation for the GlobalState class, used to interact with the global state of an Algorand application. Provides methods to get values by key and check for existence.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
class algopy.GlobalState
  __bool__(): Checks if the global state is non-empty.
  get(key): Retrieves the value associated with a key.
  property key: The key in the global state.
  maybe(key): Returns a maybe-wrapped value for a key.
  property value: The value associated with a key.
```

--------------------------------

TITLE: AppGlobal State Management Methods
DESCRIPTION: Provides methods to interact with the global state of an Algorand application. These methods map to native TEAL opcodes for reading and writing global variables.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/appglobal

LANGUAGE: APIDOC
CODE:
```
AppGlobal:
  Variable Declaration:
    const AppGlobal: object
    Defined in: packages/algo-ts/src/op.ts:185
    Purpose: Get or modify Global app state

  Methods:
    delete(key: bytes): void
      Description: Deletes key A from the global state of the current application.
      Parameters:
        a (bytes): The key to delete.
      Returns: void
      See:
        Native TEAL opcode: app_global_del
        Min AVM version: 2

    getBytes(key: bytes): bytes
      Description: Gets the value of key A from the global state of the current application. Returns zero if the key does not exist.
      Parameters:
        a (bytes): The key to retrieve.
      Returns: bytes: The value associated with the key.
      See:
        Native TEAL opcode: app_global_get
        Min AVM version: 2

    getExBytes(appId: uint64 | Application, key: bytes): readonly [bytes, boolean]
      Description: Retrieves the value of key B from the global state of application A. Returns a tuple containing the value and a boolean indicating if the key existed.
      Parameters:
        a (uint64 | Application): The application ID or object.
        b (bytes): The key to retrieve.
      Returns: readonly [bytes, boolean]: A tuple where the first element is the value (bytes) and the second is a boolean (1 if key existed, 0 otherwise).
      See:
        Native TEAL opcode: app_global_get_ex
        Min AVM version: 2

    getExUint64(appId: uint64 | Application, key: bytes): readonly [uint64, boolean]
      Description: Retrieves the value of key B from the global state of application A as a uint64. Returns a tuple containing the value and a boolean indicating if the key existed.
      Parameters:
        a (uint64 | Application): The application ID or object.
        b (bytes): The key to retrieve.
      Returns: readonly [uint64, boolean]: A tuple where the first element is the value (uint64) and the second is a boolean (1 if key existed, 0 otherwise).
      See:
        Native TEAL opcode: app_global_get_ex
        Min AVM version: 2

    getUint64(key: bytes): uint64
      Description: Gets the value of key A from the global state of the current application as a uint64. Returns zero if the key does not exist.
      Parameters:
        a (bytes): The key to retrieve.
      Returns: uint64: The value associated with the key.
      See:
        Native TEAL opcode: app_global_get
        Min AVM version: 2

    put(key: bytes, value: bytes | uint64): void
      Description: Sets or updates the value for key A in the global state of the current application.
      Parameters:
        key (bytes): The key to set.
        value (bytes | uint64): The value to associate with the key.
      Returns: void
      See:
        Native TEAL opcode: app_global_put
        Min AVM version: 2
```

--------------------------------

TITLE: Get Global UInt64 (algopy)
DESCRIPTION: Retrieves a uint64 value from the global state of the current application. It takes a state key as input and returns the associated uint64 value. If the key does not exist, it returns a zero value of type uint64.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: python
CODE:
```
algopy.global_state.get_uint64(a: algopy.Bytes | bytes, /) -> algopy.UInt64
```

--------------------------------

TITLE: Algorand Python Global Storage Examples
DESCRIPTION: Demonstrates how to use GlobalState for managing contract-level storage with optional keys, descriptions, and default values. Also shows direct assignment of typed values to instance variables for simpler global state management.

SOURCE: https://dev.algorand.co/algokit/languages/python/lg-storage

LANGUAGE: python
CODE:
```
from algopy import GlobalState, UInt64, Bytes

# Example usage within a contract class
class MyContract:
    def __init__(self) -> None:
        # Global storage with full configuration
        self.global_int_full = GlobalState(UInt64(55), key="gif", description="Global int full")
        self.global_bytes_full = GlobalState(Bytes(b"Hello"))

        # Simplified global storage (direct assignment)
        self.global_int_simplified = UInt64(33)
        self.global_bytes_simplified = Bytes(b"Hello")

        # Global storage without a default value
        self.global_int_no_default = GlobalState(UInt64)
        self.global_bytes_no_default = GlobalState(Bytes)

    def example_methods(self):
        # Checking existence and getting values
        global_int_full_exists = bool(self.global_int_full)
        bytes_with_default_specified = self.global_bytes_no_default.get(b"Default if no value set")
        
        # Accessing value directly (will raise if not set and no default)
        # error_if_not_set = self.global_int_no_default.value

        # Example of setting a value (assuming it's done elsewhere or in __init__)
        # self.global_int_full.value = UInt64(100)
        pass

```

--------------------------------

TITLE: Get Algorand Local State
DESCRIPTION: Fetches the local state for a given application ID and account address. The state is decoded into an object keyed by the UTF-8 representation of the state key.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/app

LANGUAGE: javascript
CODE:
```
const localState = await algorand.app.getLocalState(12345n, 'ACCOUNTADDRESS');
```

--------------------------------

TITLE: algopy.GlobalState Class Methods
DESCRIPTION: Documentation for the GlobalState class in algopy, which manages application global state. It provides methods to check for value existence, retrieve values with defaults, access raw keys, and get values with existence flags.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
algopy.GlobalState:
  Description: Manages global state associated with an application.

  __bool__():
    Returns: bool
    Description: Returns True if the key has a value set, regardless of the value's truthiness.

  get(default: algopy._TState) -> algopy._TState:
    Parameters:
      default: The default value to return if the key is not set.
    Returns: algopy._TState
    Description: Returns the value associated with the key, or the provided default if the key is not set.
    Example:
      name = self.name.get(Bytes(b"no name"))

  key:
    Type: algopy.Bytes
    Description: Provides access to the raw storage key for the global state entry.

  maybe() -> tuple[algopy._TState, bool]:
    Returns: tuple[algopy._TState, bool]
    Description: Returns the value and a boolean indicating if the value exists for the key.
    Example:
      name, name_exists = self.name.maybe()
      if not name_exists:
        name = Bytes(b"no name")

  value:
    Type: algopy._TState
    Description: Returns the value associated with the key. Raises an error if the value is not set.
```

--------------------------------

TITLE: Algorand TypeScript GlobalState API
DESCRIPTION: Provides a proxy for manipulating a global state field within the algorand-typescript library. It allows checking for the existence of a value, getting or setting the value, and deleting the stored value. The ValueType parameter must be a serializable type.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/type-aliases/globalstate

LANGUAGE: APIDOC
CODE:
```
GlobalState<ValueType>
  Defined in: packages/algo-ts/src/state.ts:44
  A proxy for manipulating a global state field

  Type Parameters:
  • ValueType: The type of the value being stored - must be a serializable type

  Type declaration:
  hasValue: readonly boolean
    Gets a boolean value indicating if global state field currently has a value
  value: ValueType
    Get or set the value of this global state field
  delete(): void
    Delete the stored value of this global state field

  [Previous CompileLogicSigOptions](/reference/algorand-typescript/api-reference/index/type-aliases/compilelogicsigoptions)   [Next GlobalStateOptions](/reference/algorand-typescript/api-reference/index/type-aliases/globalstateoptions)
```

--------------------------------

TITLE: algopy AppGlobal State Operations
DESCRIPTION: Manages the global state of an Algorand application. These methods allow reading, writing, and deleting key-value pairs from the application's global storage. They map directly to specific TEAL opcodes for state manipulation.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopyop

LANGUAGE: APIDOC
CODE:
```
algopy.op.AppGlobal:
  Get or modify Global app state
  Native TEAL ops: [`app_global_del`](https://developer.algorand.org/docs/get-details/dapps/avm/teal/opcodes/v10/#app_global_del), [`app_global_get`](https://developer.algorand.org/docs/get-details/dapps/avm/teal/opcodes/v10/#app_global_get), [`app_global_put`](https://developer.algorand.org/docs/get-details/dapps/avm/teal/opcodes/v10/#app_global_put)

  *static* delete(a: algopy.Bytes | bytes, /) → None
    Deletes key 'a' from the global state of the current application.
    Parameters:
      a: The state key to delete.
    Returns: None.
    Notes: Deleting an absent key has no effect and does not cause failure.

  *static* get_bytes(a: algopy.Bytes | bytes, /) → algopy.Bytes
    Retrieves the value associated with key 'a' from the global state.
    Parameters:
      a: The state key to retrieve.
    Returns: The value as algopy.Bytes. Returns zero-value if the key does not exist.

  *static* get_ex_bytes(a: algopy.Application | algopy.UInt64 | int, b: algopy.Bytes | bytes, /) → tuple[algopy.Bytes, bool]
    Retrieves the value associated with key 'b' from the global state of a specific application 'a'.
    Parameters:
      a: The application ID or reference.
      b: The state key to retrieve.
    Returns: A tuple containing the value (algopy.Bytes) and a boolean flag indicating if the key existed.

  *static* get_ex_uint64(a: algopy.Application | algopy.UInt64 | int, b: algopy.Bytes | bytes, /) → tuple[algopy.UInt64, bool]
    Retrieves the value associated with key 'b' from the global state of a specific application 'a'.
    Parameters:
      a: The application ID or reference.
      b: The state key to retrieve.
    Returns: A tuple containing the value (algopy.UInt64) and a boolean flag indicating if the key existed.

  *static* get_uint64(a: algopy.Bytes | bytes, /) → algopy.UInt64
    Retrieves the value associated with key 'a' from the global state.
    Parameters:
      a: The state key to retrieve.
    Returns: The value as algopy.UInt64. Returns zero-value if the key does not exist.

  *static* put(a: algopy.Bytes | bytes, b: algopy.Bytes | algopy.UInt64 | bytes | int, /) → None
    Writes value 'b' to key 'a' in the global state of the current application.
    Parameters:
      a: The state key to write to.
      b: The value to write (can be Bytes or UInt64).
    Returns: None.
```

--------------------------------

TITLE: Algorand Global and Local State Schema Configuration
DESCRIPTION: Methods for defining the schema for global and local state in Algorand smart contracts.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/itxncreate

LANGUAGE: APIDOC
CODE:
```
setGlobalNumUint(numUint: number)
  - Sets the number of unsigned integers allowed in global state.
  - Parameters:
    - numUint: The count of uints.

setGlobalNumByteSlice(numByteSlice: number)
  - Sets the number of byte slices allowed in global state.
  - Parameters:
    - numByteSlice: The count of byte slices.

setLocalNumUint(numUint: number)
  - Sets the number of unsigned integers allowed in local state per account.
  - Parameters:
    - numUint: The count of uints.

setLocalNumByteSlice(numByteSlice: number)
  - Sets the number of byte slices allowed in local state per account.
  - Parameters:
    - numByteSlice: The count of byte slices.
```

--------------------------------

TITLE: Get Global Bytes Ex (algopy)
DESCRIPTION: Retrieves a byte value and a existence flag from the global state of a specified application. It takes an application identifier and a state key as input. The function returns a tuple containing the byte value and a boolean indicating if the key existed.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: python
CODE:
```
algopy.global_state.get_ex_bytes(a: algopy.Application | algopy.UInt64 | int, b: algopy.Bytes | bytes, /) -> tuple[algopy.Bytes, bool]
```

--------------------------------

TITLE: Algorand App Global State Operations
DESCRIPTION: Provides methods for reading, writing, and deleting key-value pairs within the global state of the current application.

SOURCE: https://dev.algorand.co/reference/algorand-teal/opcodes

LANGUAGE: APIDOC
CODE:
```
app_global_get
  params: state key.
  Return: value. The value is zero (of type uint64) if the key does not exist.
  Description: global state of the key A in the current application
  Groups: State Access
  0x64
  stateKey
  any
  | Size | Availability | Doc Cost |
  | --- | --- | --- |
  | 1 | v2 | 1 |

app_global_get_ex
  params: Txn.ForeignApps offset (or, since v4, an _available_ application id), state key. Return: did_exist flag (top of the stack, 1 if the application and key existed and 0 otherwise), value. The value is zero (of type uint64) if the key does not exist.
  Description: X is the global state of application A, key B. Y is 1 if key existed, else 0
  Groups: State Access
  0x65
  uint64
  stateKey
  any
  bool
  | Size | Availability | Doc Cost |
  | --- | --- | --- |
  | 1 | v2 | 1 |

app_global_put
  params: state key, value.
  Description: write B to key A in the global state of the current application
  Groups: State Access
  0x67
  stateKey
  any
  -
  | Size | Availability | Doc Cost |
  | --- | --- | --- |
  | 1 | v2 | 1 |

app_global_del
  params: state key.
  Deleting a key which is already absent has no effect on the application global state. (In particular, it does _not_ cause the program to fail.)
  Description: delete key A from the global state of the current application
  Groups: State Access
  0x69
  stateKey
  -
  | Size | Availability | Doc Cost |
  | --- | --- | --- |
  | 1 | v2 | 1 |
```

--------------------------------

TITLE: Define Local State Variables in TypeScript
DESCRIPTION: Demonstrates how to declare and initialize local state variables for different data types (uint64, bytes, string, boolean, Account) within an Algorand smart contract using TypeScript. These variables are managed by the `LocalState` class.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/local

LANGUAGE: typescript
CODE:
```
public localInt = LocalState<uint64>({ key: 'int' })

public localIntNoDefault = LocalState<uint64>()

public localBytes = LocalState<bytes>()

public localString = LocalState<string>()

public localBool = LocalState<boolean>()

public localAccount = LocalState<Account>()
```

--------------------------------

TITLE: Generic State Reading Examples
DESCRIPTION: Provides examples of how to use the generic state retrieval methods of the Algorand AppClient to fetch global state, local state, and box values.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/app-client

LANGUAGE: javascript
CODE:
```
const globalState = await appClient.getGlobalState();
const localState = await appClient.getLocalState('ACCOUNTADDRESS');
const boxName: BoxReference = 'my-box';
const boxName2: BoxReference = 'my-box2';
const boxNames = appClient.getBoxNames();
const boxValue = appClient.getBoxValue(boxName);
const boxValues = appClient.getBoxValues([boxName, boxName2]);
const boxABIValue = appClient.getBoxValueFromABIType(boxName, algosdk.ABIStringType);
const boxABIValues = appClient.getBoxValuesFromABIType([boxName, boxName2], algosdk.ABIStringType);
```

--------------------------------

TITLE: Algorand Global State Get Operations
DESCRIPTION: Provides methods to retrieve data from the global state of an Algorand application. Includes functions for getting uint64 values and general data, along with an existence check. These operations map to native TEAL opcodes like app_global_get_ex and app_global_get.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/appglobal

LANGUAGE: APIDOC
CODE:
```
app_global_get_ex(key: bytes): [uint64, boolean]
  - Retrieves a value from global state and indicates if the key existed.
  - Parameters:
    - key: The key (bytes) to retrieve from global state.
  - Returns:
    - A tuple containing: a uint64 value (zero if key does not exist) and a boolean flag (true if the key existed, false otherwise).
  - See:
    - Native TEAL opcode: app_global_get_ex
    - Min AVM version: 2

getUint64(key: bytes): uint64
  - Retrieves a uint64 value from global state for a given key.
  - Parameters:
    - key: The key (bytes) to retrieve from global state.
  - Returns:
    - The uint64 value associated with the key. Returns zero if the key does not exist.
  - See:
    - Native TEAL opcode: app_global_get
    - Min AVM version: 2
```

--------------------------------

TITLE: GlobalState Function API
DESCRIPTION: Documentation for the GlobalState function in the algorand-typescript library. This function creates a proxy for manipulating global state fields, requiring serializable types for values.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/functions/globalstate

LANGUAGE: APIDOC
CODE:
```
GlobalState Function Documentation

Function: GlobalState()

Signature:
GlobalState<ValueType>(options?): GlobalState<ValueType>

Description:
Creates a new proxy for manipulating a global state field.

Defined in:
packages/algo-ts/src/state.ts:44

Type Parameters:
• ValueType: The type of the value being stored - must be a serializable type

Parameters:
• options?: GlobalStateOptions<ValueType>: Options for configuring this field

Returns:
GlobalState<ValueType>: A GlobalState object for manipulating the state.

Related:
[Previous err](/reference/algorand-typescript/api-reference/index/functions/err)
[Next log](/reference/algorand-typescript/api-reference/index/functions/log)
```

--------------------------------

TITLE: Utilize Txn, Global, and AppParams Enums in Algorand TypeScript
DESCRIPTION: Illustrates the usage of enums for transaction (Txn), global state (Global), and application parameters (AppParams) within the Algorand TypeScript SDK. These enums abstract AVM operations that accept enum arguments, providing static properties or functions for enum members.

SOURCE: https://dev.algorand.co/algokit/languages/typescript/lg-ops

LANGUAGE: typescript
CODE:
```
import { Contract, Global, log, Txn } from '@algorandfoundation/algorand-typescript';

import { AppParams } from '@algorandfoundation/algorand-typescript/op';

class MyContract extends Contract {

test() {

log(Txn.sender);

log(Txn.applicationArgs(0));

log(Global.groupId);

log(Global.creatorAddress);

log(...AppParams.appAddress(123));

}

}
```

--------------------------------

TITLE: TypeScript: Box Map Key Prefix and Existence Check
DESCRIPTION: Provides methods to retrieve the key prefix of a box map and to check if a specific key exists within the box map.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: typescript
CODE:
```
/**
* Retrieves the key prefix of the boxMap box
* @returns The key prefix of the boxMap box
*/
@abimethod({ readonly: true })
public keyPrefixBoxMap(): bytes {
  return this.boxMap.keyPrefix
}
```

LANGUAGE: typescript
CODE:
```
/**
* Checks if the boxMap box exists
* @param key The key to check for
* @returns true if the box exists, false otherwise
*/
@abimethod({ readonly: true })
public boxMapExists(key: uint64): boolean {
  return this.boxMap(key).exists
}
```

--------------------------------

TITLE: Reading State with ARC-56 Examples
DESCRIPTION: Illustrates practical usage of the ARC-56 state reading methods for global, local, and box storage within the Algorand AppClient.

SOURCE: https://dev.algorand.co/algokit/utils/typescript/app-client

LANGUAGE: javascript
CODE:
```
const values = appClient.state.global.getAll();
const value = appClient.state.local('ADDRESS').getValue('value1');
const mapValue = appClient.state.box.getMapValue('map1', 'mapKey');
const map = appClient.state.global.getMap('myMap');
```

--------------------------------

TITLE: StateTotals Type Alias
DESCRIPTION: Defines the total amount of global and local state a contract will use. This is optional but recommended for dynamic state interaction or future state expansion, as state cannot be increased after contract creation.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/-internal-/type-aliases/statetotals

LANGUAGE: APIDOC
CODE:
```
StateTotals: object
  description: Options class to manually define the total amount of global and local state contract will use.
  type: object
  properties:
    globalBytes?: number
      description: Optional. The total number of bytes reserved for global state.
      type: number
    globalUints?: number
      description: Optional. The total number of uints reserved for global state.
      type: number
    localBytes?: number
      description: Optional. The total number of bytes reserved for local state.
      type: number
    localUints?: number
      description: Optional. The total number of uints reserved for local state.
      type: number
  definedIn: packages/algo-ts/src/base-contract.ts:31
```

--------------------------------

TITLE: Algorand ApplicationStateOperation Schema
DESCRIPTION: Defines an operation against an application’s global, local, or box state. Supports write and delete operations with specified state type and key.

SOURCE: https://dev.algorand.co/reference/rest-api/algod

LANGUAGE: APIDOC
CODE:
```
ApplicationStateOperation:
  account: string (optional) (for local state changes)
  app-state-type: string (required, 'g' for global, 'l' for local, 'b' for boxes)
  key: string (byte) (required)
  new-value: AvmValue (optional)
    AvmValue:
      bytes: string (optional)
      type: integer (optional, e.g., 0)
      uint: integer (optional)
  operation: string (required, 'w' for write, 'd' for delete)
```

--------------------------------

TITLE: Get Global UInt64 Ex (algopy)
DESCRIPTION: Retrieves a uint64 value and a existence flag from the global state of a specified application. It takes an application identifier and a state key as input. The function returns a tuple containing the uint64 value and a boolean indicating if the key existed.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: python
CODE:
```
algopy.global_state.get_ex_uint64(a: algopy.Application | algopy.UInt64 | int, b: algopy.Bytes | bytes, /) -> tuple[algopy.UInt64, bool]
```
================
CODE SNIPPETS
================
TITLE: Algorand Global State Keys (v6)
DESCRIPTION: This snippet details Algorand global state keys introduced in version 6, related to the last emitted log message and state proof public key.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_108

LANGUAGE: Go
CODE:
```
package main

// LastLog is the last message emitted. Empty bytes if none were emitted. Application mode only.
const LastLog = "[]byte"

// StateProofPK is a 64-byte state proof public key.
const StateProofPK = "[]byte"

```

--------------------------------

TITLE: Delete Global App State Key - TypeScript
DESCRIPTION: Deletes a key from the global state of the current Algorand application. This function corresponds to the `app_global_del` TEAL opcode and requires a minimum AVM version of 2.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-typescript/API Reference/op/variables/AppGlobal.md#_snippet_0

LANGUAGE: typescript
CODE:
```
AppGlobal.delete(a: bytes): void;
```

--------------------------------

TITLE: Get Global Application State (Algorand)
DESCRIPTION: Retrieves the global state for a specific key within an application. This state is shared across all accounts interacting with the application.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_139

LANGUAGE: Go
CODE:
```
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/algorand/go-algorand-sdk/client/v2/algod"
)

func main() {
	// Replace with your node URL and token
	algodAddress := "http://localhost:8545"
	algodToken := "your_api_token"

	client, err := algod.NewClient(algodAddress, algodToken, "")
	if err != nil {
		log.Fatalf("Failed to create algod client: %v", err)
	}

	appId := uint64(12345678) // Replace with the actual App ID
	keyName := "global_counter" // Replace with the desired key

	appInfo, err := client.ApplicationInfo(context.Background(), appId).Do(context.Background())
	if err != nil {
		log.Fatalf("Failed to get application info: %v", err)
	}

	globalState := appInfo.Params.GlobalState

	for _, kvp := range globalState {
		if kvp.Key == keyName {
			value := kvp.Value
			if value.Type == "uint64" {
				fmt.Printf("Global state for key '%s' in app %d: %d\n", keyName, appId, value.Uint)
			} else if value.Type == "bytes" {
				fmt.Printf("Global state for key '%s' in app %d: %s\n", keyName, appId, string(value.Bytes))
			}
			break
		}
	}
}

```

--------------------------------

TITLE: Delete from Algorand App Global State
DESCRIPTION: Deletes a key from the global state of the current Algorand application. If the key does not exist, this operation has no effect. This corresponds to the `app_global_del` TEAL opcode.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-python/API Reference/algopy-op.mdx#_snippet_81

LANGUAGE: python
CODE:
```
algopy.op.AppGlobal.delete(a: algopy.Bytes | bytes, /) -> None
```

--------------------------------

TITLE: Algorand Global State Keys (v7)
DESCRIPTION: This snippet details Algorand global state keys introduced in version 7, specifying the number of program pages for approval and clear state.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_109

LANGUAGE: Go
CODE:
```
package main

// NumApprovalProgramPages represents the number of Approval Program pages.
const NumApprovalProgramPages = "uint64"

// NumClearStateProgramPages represents the number of ClearState Program pages.
const NumClearStateProgramPages = "uint64"

```

--------------------------------

TITLE: Algorand Global State Keys (v3)
DESCRIPTION: This snippet details Algorand global state keys introduced in version 3, related to the number of assets and application state variables.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_105

LANGUAGE: Go
CODE:
```
package main

// NumAssets represents the total number of Assets.
const NumAssets = "uint64"

// NumApplications represents the total number of Applications.
const NumApplications = "uint64"

// GlobalNumUint represents the number of global state integers in ApplicationCall.
const GlobalNumUint = "uint64"

// GlobalNumByteSlice represents the number of global state byteslices in ApplicationCall.
const GlobalNumByteSlice = "uint64"

// LocalNumUint represents the number of local state integers in ApplicationCall.
const LocalNumUint = "uint64"

// LocalNumByteSlice represents the number of local state byteslices in ApplicationCall.
const LocalNumByteSlice = "uint64"

```

--------------------------------

TITLE: Algorand Global State Keys (v2)
DESCRIPTION: This snippet details Algorand global state keys introduced in version 2, including asset configuration and freeze parameters.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_104

LANGUAGE: Go
CODE:
```
package main

// ConfigAssetReserve is a 32-byte address for asset reserve configuration.
const ConfigAssetReserve = "address"

// ConfigAssetFreeze is a 32-byte address for asset freeze configuration.
const ConfigAssetFreeze = "address"

// ConfigAssetClawback is a 32-byte address for asset clawback configuration.
const ConfigAssetClawback = "address"

// FreezeAsset is a uint64 representing the Asset ID being frozen or un-frozen.
const FreezeAsset = "uint64"

// FreezeAssetAccount is a 32-byte address of the account whose asset slot is being frozen or un-frozen.
const FreezeAssetAccount = "address"

// FreezeAssetFrozen is a bool indicating the new frozen value (0 or 1).
const FreezeAssetFrozen = "bool"

```

--------------------------------

TITLE: Algorand Global State Keys (v5)
DESCRIPTION: This snippet details Algorand global state keys introduced in version 5, including non-participation status and log/creation information.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_107

LANGUAGE: Go
CODE:
```
package main

// Nonparticipation marks an account as nonparticipating for rewards.
const Nonparticipation = "bool"

// NumLogs represents the number of Logs (only with `itxn` in v5). Application mode only.
const NumLogs = "uint64"

// CreatedAssetID is the Asset ID allocated by the creation of an ASA (only with `itxn` in v5). Application mode only.
const CreatedAssetID = "uint64"

// CreatedApplicationID is the ApplicationID allocated by the creation of an application (only with `itxn` in v5). Application mode only.
const CreatedApplicationID = "uint64"

```

--------------------------------

TITLE: Get Bytes from Algorand App Global State
DESCRIPTION: Retrieves the value associated with a given key from the global state of the current Algorand application. If the key does not exist, it returns a zero value. This corresponds to the `app_global_get` TEAL opcode.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-python/API Reference/algopy-op.mdx#_snippet_82

LANGUAGE: python
CODE:
```
algopy.op.AppGlobal.get_bytes(a: algopy.Bytes | bytes, /) -> algopy.Bytes
```

--------------------------------

TITLE: Get Bytes with Existence Check from Algorand App Global State
DESCRIPTION: Retrieves the value associated with a key from the global state of a specified Algorand application. It also returns a flag indicating whether the key existed. This corresponds to the `app_global_get_ex` TEAL opcode.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-python/API Reference/algopy-op.mdx#_snippet_83

LANGUAGE: python
CODE:
```
algopy.op.AppGlobal.get_ex_bytes(a: algopy.Application | algopy.UInt64 | int, b: algopy.Bytes | bytes, /) -> tuple[algopy.Bytes, bool]
```

--------------------------------

TITLE: Algorand Global State Keys (v4)
DESCRIPTION: This snippet details Algorand global state keys introduced in version 4, concerning extra program pages for smart contracts.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_106

LANGUAGE: Go
CODE:
```
package main

// ExtraProgramPages indicates the number of additional pages for approval and clear state programs.
// An ExtraProgramPages of 1 means 2048 more total bytes, or 1024 for each program.
const ExtraProgramPages = "uint64"

```

--------------------------------

TITLE: Get Global App State Bytes - TypeScript
DESCRIPTION: Retrieves the byte value associated with a given key from the global state of the current Algorand application. If the key does not exist, it returns a zero value. This function maps to the `app_global_get` TEAL opcode and requires a minimum AVM version of 2.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-typescript/API Reference/op/variables/AppGlobal.md#_snippet_1

LANGUAGE: typescript
CODE:
```
AppGlobal.getBytes(a: bytes): bytes;
```

--------------------------------

TITLE: Get Global App State Bytes with Existence Check - TypeScript
DESCRIPTION: Retrieves the byte value and an existence flag for a given key from the global state of a specified application. The flag indicates if the application and key existed. This function corresponds to the `app_global_get_ex` TEAL opcode and requires a minimum AVM version of 2.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-typescript/API Reference/op/variables/AppGlobal.md#_snippet_2

LANGUAGE: typescript
CODE:
```
AppGlobal.getExBytes(a: uint64 | Application, b: bytes): readonly [bytes, boolean];
```

--------------------------------

TITLE: Get Global App State Uint64 - TypeScript
DESCRIPTION: Retrieves the uint64 value associated with a given key from the global state of the current Algorand application. If the key does not exist, it returns a zero value. This function maps to the `app_global_get` TEAL opcode and requires a minimum AVM version of 2.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-typescript/API Reference/op/variables/AppGlobal.md#_snippet_4

LANGUAGE: typescript
CODE:
```
AppGlobal.getUint64(a: bytes): uint64;
```

--------------------------------

TITLE: Delete from Global State (Algorand)
DESCRIPTION: Deletes key A from the global state of the current Algorand application. This operation removes data from the application's global storage.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_143

LANGUAGE: Python
CODE:
```
app_global_del(key)
```

--------------------------------

TITLE: Get UInt64 with Existence Check from Algorand App Global State
DESCRIPTION: Retrieves a UInt64 value associated with a key from the global state of a specified Algorand application. It also returns a flag indicating whether the key existed. This corresponds to the `app_global_get_ex` TEAL opcode.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-python/API Reference/algopy-op.mdx#_snippet_84

LANGUAGE: python
CODE:
```
algopy.op.AppGlobal.get_ex_uint64(a: algopy.Application | algopy.UInt64 | int, b: algopy.Bytes | bytes, /) -> tuple[algopy.UInt64, bool]
```

--------------------------------

TITLE: Get UInt64 from Algorand App Global State
DESCRIPTION: Retrieves a UInt64 value associated with a given key from the global state of the current Algorand application. If the key does not exist, it returns a zero value. This corresponds to the `app_global_get` TEAL opcode.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-python/API Reference/algopy-op.mdx#_snippet_85

LANGUAGE: python
CODE:
```
algopy.op.AppGlobal.get_uint64(a: algopy.Bytes | bytes, /) -> algopy.UInt64
```

--------------------------------

TITLE: Get Global App State Uint64 with Existence Check - TypeScript
DESCRIPTION: Retrieves the uint64 value and an existence flag for a given key from the global state of a specified application. The flag indicates if the application and key existed. This function corresponds to the `app_global_get_ex` TEAL opcode and requires a minimum AVM version of 2.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-typescript/API Reference/op/variables/AppGlobal.md#_snippet_3

LANGUAGE: typescript
CODE:
```
AppGlobal.getExUint64(a: uint64 | Application, b: bytes): readonly [uint64, boolean];
```

--------------------------------

TITLE: Get Global State Value with Default
DESCRIPTION: Retrieves a value from the global state, returning a default value if the key is not set. This is useful for safely accessing state variables.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-python/API Reference/algopy.mdx#_snippet_155

LANGUAGE: Python
CODE:
```
name = self.name.get(Bytes(b"no name")
```

--------------------------------

TITLE: Define and Use Global State
DESCRIPTION: Demonstrates defining global state variables within an Algorand smart contract using `algots.GlobalState`. It shows how to initialize state with values and keys, and how to update them within a test context.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/algokit/unit-testing/typescript/state-management.md#_snippet_1

LANGUAGE: typescript
CODE:
```
class MyContract extends algots.arc4.Contract {
  stateA = algots.GlobalState<algots.uint64>({ key: 'globalStateA' });
  stateB = algots.GlobalState({ initialValue: algots.Uint64(1), key: 'globalStateB' });
}

// In your test
const contract = ctx.contract.create(MyContract);
contract.stateA.value = algots.Uint64(10);
contract.stateB.value = algots.Uint64(20);
```

--------------------------------

TITLE: Put to Algorand App Global State
DESCRIPTION: Writes a value to a specified key in the global state of the current Algorand application. This corresponds to the `app_global_put` TEAL opcode.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-python/API Reference/algopy-op.mdx#_snippet_86

LANGUAGE: python
CODE:
```
algopy.op.AppGlobal.put(a: algopy.Bytes | bytes, b: algopy.Bytes | algopy.UInt64 | bytes | int, /) -> None
```

--------------------------------

TITLE: Write to Global State (Algorand)
DESCRIPTION: Writes value B to key A in the global state of the current Algorand application. This is a fundamental operation for managing application-wide data.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/avm.md#_snippet_141

LANGUAGE: Python
CODE:
```
app_global_put(key, value)
```

--------------------------------

TITLE: Get ApplicationParams Global State
DESCRIPTION: Retrieves the global state of the ApplicationParams. Global state is a key-value store accessible by all participants in the application.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algokit-utils-py/API Reference/algosdk/algosdk.v2client.models.application_params.mdx#_snippet_8

LANGUAGE: Python
CODE:
```
global_state
```

--------------------------------

TITLE: Put Global App State Value - TypeScript
DESCRIPTION: Writes a value (either bytes or uint64) to a specified key in the global state of the current Algorand application. This function corresponds to the `app_global_put` TEAL opcode and requires a minimum AVM version of 2.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-typescript/API Reference/op/variables/AppGlobal.md#_snippet_5

LANGUAGE: typescript
CODE:
```
AppGlobal.put(a: bytes, b: uint64 | bytes): void;
```

--------------------------------

TITLE: Algorand Application Global State Delta
DESCRIPTION: Represents changes to an Algorand application's global state. It includes a key for the state variable and the delta value, which can be an integer or byte string update.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/rest-api/indexer.md#_snippet_338

LANGUAGE: Go
CODE:
```
type EvalDeltaKeyValue struct {
	Key   string      `json:"key,omitempty"`
	Value EvalDelta `json:"value,omitempty"`
}

type EvalDelta struct {
	Action int64  `json:"action,omitempty"`
	Bytes  string `json:"bytes,omitempty"`
	Uint   uint64 `json:"uint,omitempty"`
}
```

--------------------------------

TITLE: Algorand Application Global State Delta
DESCRIPTION: Represents changes to an Algorand application's global state. It includes a key for the state variable and the delta value, which can be an integer or byte string update.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/rest-api/indexer.md#_snippet_76

LANGUAGE: Go
CODE:
```
type EvalDeltaKeyValue struct {
	Key   string      `json:"key,omitempty"`
	Value EvalDelta `json:"value,omitempty"`
}

type EvalDelta struct {
	Action int64  `json:"action,omitempty"`
	Bytes  string `json:"bytes,omitempty"`
	Uint   uint64 `json:"uint,omitempty"`
}
```

--------------------------------

TITLE: Algorand Global Storage with TypeScript
DESCRIPTION: Demonstrates how to declare and interact with Algorand's global storage using the `@algorandfoundation/algorand-typescript` library. It shows defining state variables for uint64 and bytes, including explicit key overrides and dynamic key access with state reservation.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/algokit/languages/typescript/lg-storage.md#_snippet_0

LANGUAGE: TypeScript
CODE:
```
import {
  GlobalState,
  Contract,
  uint64,
  bytes,
  Uint64,
  contract,
} from '@algorandfoundation/algorand-typescript';

class DemoContract extends Contract {
  // The property name 'globalInt' will be used as the key
  globalInt = GlobalState<uint64>({ initialValue: Uint64(1) });
  // Explicitly override the key
  globalBytes = GlobalState<bytes>({ key: 'alternativeKey' });
}

// If using dynamic keys, state must be explicitly reserved
@contract({ stateTotals: { globalBytes: 5 } })
class DynamicAccessContract extends Contract {
  test(key: string, value: string) {
    // Interact with state using a dynamic key
    const dynamicAccess = GlobalState<string>({ key });
    dynamicAccess.value = value;
  }
}
```

--------------------------------

TITLE: Algorand Application Global State Delta
DESCRIPTION: Represents a change in an application's global state. It includes the key, the delta action, and the new value (either bytes or uint).

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/rest-api/indexer.md#_snippet_139

LANGUAGE: Go
CODE:
```
type EvalDeltaKeyValue struct {
	Key   string    `json:"key,omitempty"`
	Value EvalDelta `json:"value,omitempty"`
}

type EvalDelta struct {
	Action int `json:"action,omitempty"`
	Bytes  []byte `json:"bytes,omitempty"`
	Uint   uint64 `json:"uint,omitempty"`
}
```

--------------------------------

TITLE: Example Output of Global State Read
DESCRIPTION: JSON output illustrating the structure of global state data retrieved from an Algorand smart contract, including keys, value types, and encoded values.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/storage/global.mdx#_snippet_8

LANGUAGE: json
CODE:
```
{
  "Creator": {
    "tb": "FRYCPGH25DHCYQGXEB54NJ6LHQG6I2TWMUV2P3UWUU7RWP7BQ2BMBBDPD4",
    "tt": 1
  },
  "MyBytesKey": {
    "tb": "hello",
    "tt": 1
  },
  "MyUintKey": {
    "tt": 2,
    "ui": 50
  }
}
```

--------------------------------

TITLE: Algorand Global State Delta Key-Value Pair
DESCRIPTION: Represents a key-value pair within an Algorand global state delta, used for application state updates.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/rest-api/indexer.md#_snippet_189

LANGUAGE: Go
CODE:
```
type EvalDeltaKeyValue struct {
	Key   string       `json:"key"`
	Value EvalDelta `json:"value"`
}
```

--------------------------------

TITLE: Set and Get App Global State
DESCRIPTION: Demonstrates setting a key-value pair in the application's global state and then retrieving the value associated with a given key. It uses `op.AppGlobal.put` to store data and `op.AppGlobal.getUint64` to retrieve it. The function returns the retrieved `uint64` value.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/algokit/unit-testing/typescript/opcodes.md#_snippet_6

LANGUAGE: TypeScript
CODE:
```
import { arc4, bytes, Bytes, op, uint64, Uint64 } from '@algorandfoundation/algorand-typescript';
import { TestExecutionContext } from '@algorandfoundation/algorand-typescript-testing';

class StateContract extends arc4.Contract {
  @arc4.abimethod()
  setAndGetState(key: bytes, value: uint64): uint64 {
    op.AppGlobal.put(key, value);
    return op.AppGlobal.getUint64(key);
  }
}

// Create the context manager for snippets below
const ctx = new TestExecutionContext();

const contract = ctx.contract.create(StateContract);
const key = Bytes('test_key');
const value = Uint64(42);
const result = contract.setAndGetState(key, value);
expect(result).toEqual(value);

const [storedValue, _] = ctx.ledger.getGlobalState(contract, key);
expect(storedValue?.value).toEqual(42);
```

--------------------------------

TITLE: Read Global State (TEAL)
DESCRIPTION: TEAL code snippet for reading global state values within the current smart contract. It utilizes the `app_global_get` and `app_global_get_ex` opcodes.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/smart-contracts/storage/global.mdx#_snippet_5

LANGUAGE: TEAL
CODE:
```
# TEAL code for reading global state

# Example using app_global_get
# Push the key for the global state variable onto the stack
# PUSHBYTES "MyKey"
# app_global_get
# Dup
# If
#   # Process the value if found
#   # ...
# Else
#   # Handle case where value is not found
#   # ...
# EndIf

# Example using app_global_get_ex
# Push the key for the global state variable onto the stack
# PUSHBYTES "MyKey"
# app_global_get_ex
# Swap
# Dup
# If
#   # Value found, it's now on top of the stack
#   # Process the value
#   # ...
# Else
#   # Value not found, boolean false is on top
#   Pop
#   # Handle case where value is not found
#   # ...
# EndIf

# Reading from a foreign application's global state requires the foreign app's ID
# and that the foreign app is included in the transaction's foreignApps array.
# Example:
# Push the foreign app ID onto the stack
# Push the key onto the stack
# app_global_get_ex
# Swap
# Dup
# If
#   # Process the value from the foreign app
#   # ...
# Else
#   # Handle case where value is not found
#   # ...
# EndIf

```

--------------------------------

TITLE: Algorand State Proof Keys Generation
DESCRIPTION: This describes the generation of state proof keys in Algorand, starting from version 3.4.2. These keys, along with ephemeral keys, are used to create Post-Quantum secure state proofs, enabling lightweight verification of blockchain state without running a full node.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/concepts/protocol/overview.mdx#_snippet_2



--------------------------------

TITLE: Define Global State Options - TypeScript
DESCRIPTION: Defines the structure for options when declaring a global state field in Algorand smart contracts using TypeScript. It includes optional properties for an initial value and a key.

SOURCE: https://github.com/algorandfoundation/devportal/blob/main/src/content/docs/reference/algorand-typescript/API Reference/index/type-aliases/GlobalStateOptions.md#_snippet_0

LANGUAGE: typescript
CODE:
```
type GlobalStateOptions<ValueType> = {
  initialValue?: ValueType;
  key?: bytes | string;
};
```================
CODE SNIPPETS
================
TITLE: Delete Global State Key (TEAL Opcode)
DESCRIPTION: Deletes key A from the global state of the current application. Deleting an absent key has no effect and does not cause the program to fail. Available since v2 in Application mode. Takes a state key as input.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_57

LANGUAGE: TEAL
CODE:
```
app_global_del
```

--------------------------------

TITLE: Get Global State Value (TEAL Opcode)
DESCRIPTION: Retrieves the global state value for key A in the current application. Available since v2 in Application mode. Takes a state key as input. Returns the value (any type). Returns zero (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_52

LANGUAGE: TEAL
CODE:
```
app_global_get
```

--------------------------------

TITLE: Getting Global Application State in TEAL
DESCRIPTION: Gets the global state value for key A in the current application. Returns the value or 0 (uint64) if the key does not exist. Availability: v2. Mode: Application. Stack: ..., A: stateKey -> ..., any. Bytecode: 0x64. Params: state key. Return: value (any type).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v10.md#_snippet_70

LANGUAGE: TEAL
CODE:
```
app_global_get
```

--------------------------------

TITLE: Deleting Global State Value (app_global_del) - TEAL
DESCRIPTION: Deletes a key from the global state for the current application. Stack: ..., A: stateKey → .... Deletes key A from the global state of the current application. Available since v2 in Application mode. Parameters: state key. Deleting a key which is already absent has no effect on the application global state (does not cause the program to fail).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_68

LANGUAGE: TEAL
CODE:
```
app_global_del
```

--------------------------------

TITLE: Getting Global State Value (app_global_get_ex) - TEAL
DESCRIPTION: Gets the global state value for a specific application and key. Stack: ..., A: uint64, B: stateKey → ..., X: any, Y: bool. X is the global state of application A, key B. Y is 1 if key existed, else 0. Available since v2 in Application mode. Parameters: Txn.ForeignApps offset (or, since v4, an available application id), state key. Returns: did_exist flag (top of the stack, 1 if the application and key existed and 0 otherwise), value. The value is zero (of type uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_64

LANGUAGE: TEAL
CODE:
```
app_global_get_ex
```

--------------------------------

TITLE: Deleting Global State (AVM)
DESCRIPTION: Deletes a specified key from the global state of the current application. Requires the state key on the stack. Deleting a non-existent key has no effect. Available from AVM v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v9.md#_snippet_74

LANGUAGE: AVM
CODE:
```
0x69
```

--------------------------------

TITLE: Get Global State Value with Existence Check (TEAL Opcode)
DESCRIPTION: Retrieves the global state value for key B in application A, and indicates if the key existed. Available since v2 in Application mode. Takes application id (or Txn.ForeignApps offset since v4) and a state key as input. Returns the value (any type) and a boolean flag (1 if key existed, 0 otherwise). The value is zero (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_53

LANGUAGE: TEAL
CODE:
```
app_global_get_ex
```

--------------------------------

TITLE: Getting Global Application State with Existence Check in TEAL
DESCRIPTION: Gets the global state value for key B in application A, and indicates if the key existed. X is the value, Y is 1 if the key existed, 0 otherwise. Returns 0 (uint64) if the key does not exist. Availability: v2. Mode: Application. Stack: ..., A: uint64, B: stateKey -> ..., X: any, Y: bool. Bytecode: 0x65. Params: Txn.ForeignApps offset (or available application id since v4), state key. Return: did_exist flag (bool), value (any type).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v10.md#_snippet_71

LANGUAGE: TEAL
CODE:
```
app_global_get_ex
```

--------------------------------

TITLE: Putting Global State Value (app_global_put) - TEAL
DESCRIPTION: Writes a value to a key in the global state for the current application. Stack: ..., A: stateKey, B → .... Writes B to key A in the global state of the current application. Available since v2 in Application mode. Parameters: state key, value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_66

LANGUAGE: TEAL
CODE:
```
app_global_put
```

--------------------------------

TITLE: app_global_get - TEAL
DESCRIPTION: Retrieves the global state value for key A in the current application. Returns 0 (uint64) if the key does not exist.
Bytecode: 0x64
Stack: ..., A: stateKey → ..., any
Availability: v2
Mode: Application
Params: state key. Return: value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v3.md#_snippet_61

LANGUAGE: TEAL
CODE:
```
app_global_get
```

--------------------------------

TITLE: Get Global State - TEAL Opcode
DESCRIPTION: Retrieves the global state value for a specific key in the current application.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_63

LANGUAGE: TEAL Opcode Description
CODE:
```
- Bytecode: 0x64
- Stack: ..., A: stateKey → ..., any
- global state of the key A in the current application
- Availability: v2
- Mode: Application

params: state key. Return: value. The value is zero (of type uint64) if the key does not exist.
```

--------------------------------

TITLE: Write Global State Value (TEAL Opcode)
DESCRIPTION: Writes value B to key A in the global state of the current application. Available since v2 in Application mode. Takes a state key and value as input.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_55

LANGUAGE: TEAL
CODE:
```
app_global_put
```

--------------------------------

TITLE: Writing Global State (AVM)
DESCRIPTION: Writes a value to a specified key in the global state of the current application. Requires the state key and the value on the stack. Available from AVM v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v9.md#_snippet_72

LANGUAGE: AVM
CODE:
```
0x67
```

--------------------------------

TITLE: app_global_get Opcode in TEAL
DESCRIPTION: Retrieves the global state value for key A in the current application. Pushes the value onto the stack. Available since TEAL version 2 in Application mode. Key A is a state key. Returns a zero value (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_83

LANGUAGE: TEAL
CODE:
```
app_global_get
```

--------------------------------

TITLE: Deleting from Algorand Application Global State (app_global_del)
DESCRIPTION: Documents the `app_global_del` AVM opcode (0x69). This opcode deletes a specified key (A) from the global state of the current application. It is available from AVM v2 onwards and operates in Application mode. The parameter is the state key. Deleting a non-existent key has no effect and does not cause the program to fail.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_97



--------------------------------

TITLE: Deleting from Global State (Algorand TEAL)
DESCRIPTION: Deletes a specified key (A) from the global state of the current Algorand application. Available since TEAL version 2 and usable in Application mode. Deleting a non-existent key does not cause the program to fail.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_88

LANGUAGE: TEAL
CODE:
```
0x69
```

--------------------------------

TITLE: app_global_get_ex Opcode in TEAL
DESCRIPTION: Retrieves the global state value for key B in application A. Pushes the value (X) and a boolean flag (Y) onto the stack. Y is 1 if the key existed, 0 otherwise. Available since TEAL version 2 in Application mode. Application A can be specified via Txn.ForeignApps offset or an available application id (v4+). Key B is a state key. Returns a zero value (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_84

LANGUAGE: TEAL
CODE:
```
app_global_get_ex
```

--------------------------------

TITLE: app_global_get Opcode (TEAL)
DESCRIPTION: Retrieves the global state value for key A in the current application. Returns the value. If the key does not exist, returns zero of type uint64. Available since v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_92

LANGUAGE: TEAL
CODE:
```
app_global_get
Bytecode: 0x64
```

--------------------------------

TITLE: Writing to Algorand Application Global State (app_global_put)
DESCRIPTION: Documents the `app_global_put` AVM opcode (0x67). This opcode writes a value (B) to a specified key (A) in the global state of the current application. It is available from AVM v2 onwards and operates in Application mode. Parameters include the state key and the value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_95



--------------------------------

TITLE: Writing to Global State (Algorand TEAL)
DESCRIPTION: Writes a value (B) to a specified key (A) in the global state of the current Algorand application. Available since TEAL version 2 and usable in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_86

LANGUAGE: TEAL
CODE:
```
0x67
```

--------------------------------

TITLE: app_global_get_ex Opcode (TEAL)
DESCRIPTION: Retrieves the global state value for key B in application A and indicates if the key existed. Application A can be specified by a Txn.ForeignApps offset or, since v4, an available application id. Returns the value (X) and a boolean flag (Y) which is 1 if the application and key existed, 0 otherwise. The value X is zero (uint64) if the key does not exist. Available since v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_93

LANGUAGE: TEAL
CODE:
```
app_global_get_ex
Bytecode: 0x65
```

--------------------------------

TITLE: Accessing Global State - TEAL
DESCRIPTION: Describes the `global` opcode used to access global state fields within a TEAL program. It specifies the syntax, bytecode representation, and its effect on the stack. The opcode retrieves a specific global field value based on the provided index.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v2.md#_snippet_36

LANGUAGE: TEAL
CODE:
```
Syntax: global F
Bytecode: 0x32 {uint8}
```

--------------------------------

TITLE: Get Local State Value with Existence Check (TEAL Opcode)
DESCRIPTION: Retrieves the local state value for key C in application B for account A, and indicates if the key existed. Available since v2 in Application mode. Takes Txn.Accounts offset (or address since v4), application id (or Txn.ForeignApps offset since v4), and a state key as input. Returns the value (any type) and a boolean flag (1 if key existed, 0 otherwise). The value is zero (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_51

LANGUAGE: TEAL
CODE:
```
app_local_get_ex
```

--------------------------------

TITLE: Delete Local State Key (TEAL Opcode)
DESCRIPTION: Deletes key B from account A's local state for the current application. Deleting an absent key has no effect and does not cause the program to fail. Available since v2 in Application mode. Takes Txn.Accounts offset (or address since v4) and a state key as input.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_56

LANGUAGE: TEAL
CODE:
```
app_local_del
```

--------------------------------

TITLE: Getting Local Application State in TEAL
DESCRIPTION: Gets the local state value for key B in the current application for account A. Returns the value or 0 (uint64) if the key does not exist. Availability: v2. Mode: Application. Stack: ..., A, B: stateKey -> ..., any. Bytecode: 0x62. Params: Txn.Accounts offset (or available account address since v4), state key. Return: value (any type).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v10.md#_snippet_68

LANGUAGE: TEAL
CODE:
```
app_local_get
```

--------------------------------

TITLE: Deleting Local State (AVM)
DESCRIPTION: Deletes a specified key from an account's local state for the current application. Requires the target account offset/address and the state key on the stack. Deleting a non-existent key has no effect. Available from AVM v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v9.md#_snippet_73

LANGUAGE: AVM
CODE:
```
0x68
```

--------------------------------

TITLE: Getting Local Application State with Existence Check in TEAL
DESCRIPTION: Gets the local state value for key C in application B for account A, and indicates if the key existed. X is the value, Y is 1 if the key existed, 0 otherwise. Returns 0 (uint64) if the key does not exist. Availability: v2. Mode: Application. Stack: ..., A, B: uint64, C: stateKey -> ..., X: any, Y: bool. Bytecode: 0x63. Params: Txn.Accounts offset (or available account address since v4), available application id (or Txn.ForeignApps offset since v4), state key. Return: did_exist flag (bool), value (any type).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v10.md#_snippet_69

LANGUAGE: TEAL
CODE:
```
app_local_get_ex
```

--------------------------------

TITLE: Get Local State Value (TEAL Opcode)
DESCRIPTION: Retrieves the local state value for key B in the current application for account A. Available since v2 in Application mode. Takes Txn.Accounts offset (or address since v4) and a state key as input. Returns the value (any type). Returns zero (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_50

LANGUAGE: TEAL
CODE:
```
app_local_get
```

--------------------------------

TITLE: Deleting Local State Value (app_local_del) - TEAL
DESCRIPTION: Deletes a key from an account's local state for the current application. Stack: ..., A, B: stateKey → .... Deletes key B from account A's local state of the current application. Available since v2 in Application mode. Parameters: Txn.Accounts offset (or, since v4, an available account address), state key. Deleting a key which is already absent has no effect on the application local state (does not cause the program to fail).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_67

LANGUAGE: TEAL
CODE:
```
app_local_del
```

--------------------------------

TITLE: Access Global State - TEAL
DESCRIPTION: The `global` opcode is used to push the value of a specific global field onto the stack. It takes one immediate argument, F, which specifies the global field to access. The available fields are listed in the global field group table.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v9.md#_snippet_27

LANGUAGE: TEAL
CODE:
```
global F
```

--------------------------------

TITLE: App Local Get TEAL Opcode
DESCRIPTION: Explains the `app_local_get` opcode. Takes an account A and a state key B from the stack. Returns the local state value for key B in the current application in account A. Returns 0 (uint64) if the key does not exist. Available since v2 in Application mode. Bytecode: 0x62. Stack: ..., A, B: stateKey → ..., any. Parameters: Txn.Accounts offset (or, since v4, an available account address), state key. Return: value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v6.md#_snippet_83

LANGUAGE: Algorand TEAL
CODE:
```
app_local_get
```

--------------------------------

TITLE: Accessing Global Properties TEAL
DESCRIPTION: The `global` opcode retrieves a specific global property of the blockchain or current application state. It takes a single immediate argument `F` which is the index of the desired global field. The value is pushed onto the stack.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v11.md#_snippet_23

LANGUAGE: TEAL Syntax
CODE:
```
global F
```

LANGUAGE: TEAL Bytecode
CODE:
```
0x32 {uint8}
```

--------------------------------

TITLE: app_local_get_ex Opcode in TEAL
DESCRIPTION: Retrieves the local state value for key C in application B for account A. Pushes the value (X) and a boolean flag (Y) onto the stack. Y is 1 if the key existed, 0 otherwise. Available since TEAL version 2 in Application mode. Account A can be specified via Txn.Accounts offset or an available account address (v4+). Application B can be specified via an available application id or a Txn.ForeignApps offset (v4+). Key C is a state key. Returns a zero value (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_82

LANGUAGE: TEAL
CODE:
```
app_local_get_ex
```

--------------------------------

TITLE: app_local_get - TEAL
DESCRIPTION: Retrieves the local state value for key B in the current application for account A. Returns 0 (uint64) if the key does not exist.
Bytecode: 0x62
Stack: ..., A: uint64, B: stateKey → ..., any
Availability: v2
Mode: Application
Params: Txn.Accounts offset (or available account address since v4), state key. Return: value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v3.md#_snippet_59

LANGUAGE: TEAL
CODE:
```
app_local_get
```

--------------------------------

TITLE: Putting Local State Value (app_local_put) - TEAL
DESCRIPTION: Writes a value to a key in an account's local state for the current application. Stack: ..., A, B: stateKey, C → .... Writes C to key B in account A's local state of the current application. Available since v2 in Application mode. Parameters: Txn.Accounts offset (or, since v4, an available account address), state key, value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_65

LANGUAGE: TEAL
CODE:
```
app_local_put
```

--------------------------------

TITLE: app_local_get Opcode in TEAL
DESCRIPTION: Retrieves the local state value for key B in the current application for account A. Pushes the value onto the stack. Available since TEAL version 2 in Application mode. Account A can be specified via Txn.Accounts offset or an available account address (v4+). Key B is a state key. Returns a zero value (uint64) if the key does not exist.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_81

LANGUAGE: TEAL
CODE:
```
app_local_get
```

--------------------------------

TITLE: Deleting from Algorand Application Local State (app_local_del)
DESCRIPTION: Documents the `app_local_del` AVM opcode (0x68). This opcode deletes a specified key (B) from the local state of account A for the current application. It is available from AVM v2 onwards and operates in Application mode. Parameters include an account offset/address and the state key. Deleting a non-existent key has no effect and does not cause the program to fail.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_96



--------------------------------

TITLE: Writing Local State (AVM)
DESCRIPTION: Writes a value to a specified key in an account's local state for the current application. Requires the target account offset/address, the state key, and the value on the stack. Available from AVM v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v9.md#_snippet_71

LANGUAGE: AVM
CODE:
```
0x66
```

--------------------------------

TITLE: app_local_get_ex - TEAL
DESCRIPTION: Retrieves the local state value for key C in application B for account A. Returns the value (X) and a boolean flag (Y) indicating if the key existed (1) or not (0). The value is 0 (uint64) if the key did not exist.
Bytecode: 0x63
Stack: ..., A: uint64, B: uint64, C: stateKey → ..., X: any, Y: bool
Availability: v2
Mode: Application
Params: Txn.Accounts offset (or available account address since v4), available application id (or Txn.ForeignApps offset since v4), state key. Return: did_exist flag (top of stack), value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v3.md#_snippet_60

LANGUAGE: TEAL
CODE:
```
app_local_get_ex
```

--------------------------------

TITLE: Get Local State (Extended) - TEAL Opcode
DESCRIPTION: Retrieves the local state value for a specific key in a specified application for a given account, returning the value and a boolean indicating if the key existed.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_62

LANGUAGE: TEAL Opcode Description
CODE:
```
- Bytecode: 0x63
- Stack: ..., A, B: uint64, C: stateKey → ..., X: any, Y: bool
- X is the local state of application B, key C in account A. Y is 1 if key existed, else 0
- Availability: v2
- Mode: Application

params: Txn.Accounts offset (or, since v4, an _available_ account address), _available_ application id (or, since v4, a Txn.ForeignApps offset), state key. Return: did_exist flag (top of the stack, 1 if the application and key existed and 0 otherwise), value. The value is zero (of type uint64) if the key does not exist.
```

--------------------------------

TITLE: app_local_get_ex Opcode (TEAL)
DESCRIPTION: Retrieves the local state value for key C in application B for account A and indicates if the key existed. Account A can be specified by a Txn.Accounts offset or, since v4, an available account address. Application B can be specified by an available application id or, since v4, a Txn.ForeignApps offset. Returns the value (X) and a boolean flag (Y) which is 1 if the application and key existed, 0 otherwise. The value X is zero (uint64) if the key does not exist. Available since v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_91

LANGUAGE: TEAL
CODE:
```
app_local_get_ex
Bytecode: 0x63
```

--------------------------------

TITLE: Deleting from Local State (Algorand TEAL)
DESCRIPTION: Deletes a specified key (B) from the local state of account A within the current Algorand application. Account A is identified by an offset in Txn.Accounts or an available address (since v4). Available since TEAL version 2 and usable in Application mode. Deleting a non-existent key does not cause the program to fail.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_87

LANGUAGE: TEAL
CODE:
```
0x68
```

--------------------------------

TITLE: Get Local State - TEAL Opcode
DESCRIPTION: Retrieves the local state value for a specific key in the current application for a given account.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_61

LANGUAGE: TEAL Opcode Description
CODE:
```
- Bytecode: 0x62
- Stack: ..., A, B: stateKey → ..., any
- local state of the key B in the current application in account A
- Availability: v2
- Mode: Application

params: Txn.Accounts offset (or, since v4, an _available_ account address), state key. Return: value. The value is zero (of type uint64) if the key does not exist.
```

--------------------------------

TITLE: Write Local State Value (TEAL Opcode)
DESCRIPTION: Writes value C to key B in account A's local state for the current application. Available since v2 in Application mode. Takes Txn.Accounts offset (or address since v4), state key, and value as input.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_54

LANGUAGE: TEAL
CODE:
```
app_local_put
```

--------------------------------

TITLE: Writing to Algorand Application Local State (app_local_put)
DESCRIPTION: Documents the `app_local_put` AVM opcode (0x66). This opcode writes a value (C) to a specified key (B) in the local state of account A for the current application. It is available from AVM v2 onwards and operates in Application mode. Parameters include an account offset/address, the state key, and the value.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_94



--------------------------------

TITLE: app_local_get Opcode (TEAL)
DESCRIPTION: Retrieves the local state value for key B in the current application for account A. Account A can be specified by a Txn.Accounts offset or, since v4, an available account address. Returns the value. If the key does not exist, returns zero of type uint64. Available since v2 in Application mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_90

LANGUAGE: TEAL
CODE:
```
app_local_get
Bytecode: 0x62
```

--------------------------------

TITLE: app_local_put Opcode in TEAL
DESCRIPTION: Writes value C to key B in account A's local state for the current application. Available since TEAL version 2 in Application mode. Account A can be specified via Txn.Accounts offset or an available account address (v4+). Key B is a state key. Value C is the value to write.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_85

LANGUAGE: TEAL
CODE:
```
app_local_put
```

--------------------------------

TITLE: Accessing Global Fields in TEAL
DESCRIPTION: Describes the `global` opcode in Algorand TEAL, used to push a specific global field value onto the stack. It specifies the syntax, corresponding bytecode, and the effect on the stack.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v6.md#_snippet_50

LANGUAGE: TEAL
CODE:
```
Syntax: global F where F: [global](#field-group-global)
Bytecode: 0x32 {uint8}
Stack: ... → ..., any
global field F
```

--------------------------------

TITLE: Generate Algorand Participation Keys with algokey
DESCRIPTION: This command uses the `algokey` tool to generate a set of participation keys for an Algorand account. It requires specifying the first and last rounds for which the keys will be valid, the public address of the parent account, and the output file path for the key database.

SOURCE: https://github.com/algorand/go-algorand/blob/master/docs/participation_key_lifecycle.md#_snippet_0

LANGUAGE: Shell
CODE:
```
algokey part generate --first 35000000 --last 36000000 --parent <account-address> --keyfile keys.db
```

--------------------------------

TITLE: Application Parameters Fields (app_params) - TEAL
DESCRIPTION: Fields available for the app_params_get opcode. Fields: 0: AppApprovalProgram ([]byte) - Bytecode of Approval Program; 1: AppClearStateProgram ([]byte) - Bytecode of Clear State Program; 2: AppGlobalNumUint (uint64) - Number of uint64 values allowed in Global State; 3: AppGlobalNumByteSlice (uint64) - Number of byte array values allowed in Global State; 4: AppLocalNumUint (uint64) - Number of uint64 values allowed in Local State; 5: AppLocalNumByteSlice (uint64) - Number of byte array values allowed in Local State; 6: AppExtraProgramPages (uint64) - Number of Extra Program Pages of code space; 7: AppCreator (address) - Creator address; 8: AppAddress (address) - Address for which this application has authority.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_74

LANGUAGE: TEAL
CODE:
```
app_params
```

--------------------------------

TITLE: ecdsa_pk_decompress Opcode (TEAL v8)
DESCRIPTION: The `ecdsa_pk_decompress` opcode decompresses a compressed ECDSA public key for a specified curve (V). It takes a 33-byte compressed public key (A) from the stack and replaces it with the two 32-byte components (X and Y) of the decompressed public key.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_6

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_decompress V
```

--------------------------------

TITLE: Test GPG Agent Connection (Shell)
DESCRIPTION: Tests if the GPG agent forwarding is set up correctly by signing a simple string ("foo") using a specific GPG key. If successful, it should sign without prompting for a passphrase.

SOURCE: https://github.com/algorand/go-algorand/blob/master/scripts/release/README.md#_snippet_2

LANGUAGE: Shell
CODE:
```
echo foo | gpg -u rpm@algorand.com --clearsign
```

--------------------------------

TITLE: Decompress Public Key (ECDSA) - Algorand TEAL
DESCRIPTION: Decompresses a compressed ECDSA public key into its X and Y components for a specified curve (Secp256k1 or Secp256r1). Stack: ..., compressed_pubkey: [33]byte → ..., pubkey_X: [32]byte, pubkey_Y: [32]byte. Availability: v5. Cost: Secp256k1=650; Secp256r1=2400. Requires a curve index parameter.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_6

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_decompress
```

--------------------------------

TITLE: ed25519verify TEAL v5 Opcode
DESCRIPTION: Verifies an Ed25519 signature. It expects data (A), a 64-byte signature (B), and a 32-byte public key (C) on the stack. It verifies the signature of ("ProgData" || program_hash || data) against the public key and pushes 1 (true) or 0 (false) onto the stack. The public key is the top element, followed by the signature, then the data. This opcode costs 1900 units.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
ed25519verify
Bytecode: 0x04
Stack: ..., A: []byte, B: [64]byte, C: [32]byte → ..., bool
```

--------------------------------

TITLE: Push Global Field (global) - TEAL
DESCRIPTION: Pushes the value of the specified global field `F` onto the stack. Refer to the global fields list for available fields and types.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v1.md#_snippet_12

LANGUAGE: TEAL
CODE:
```
Syntax: global F
Bytecode: 0x32 {uint8}
Stack: ... &rarr; ..., any
```

--------------------------------

TITLE: Checking FirstValid Round Periodicity in Algorand TEAL
DESCRIPTION: This TEAL snippet ensures that the transaction's FirstValid round is an exact multiple of the template parameter `TMPL_PERIOD`. This helps restrict key registration attempts to specific intervals. It uses the modulo operator (`%`) and checks for a remainder of 0. This check is combined with previous conditions using `&&`.

SOURCE: https://github.com/algorand/go-algorand/blob/master/tools/teal/templates/docs/delegate-keyreg.teal.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
txn FirstValid
int TMPL_PERIOD
%
int 0
==
&&
```

--------------------------------

TITLE: Pre-generating Algorand Participation Keys using Docker
DESCRIPTION: This command runs the `goal network pregen` command inside a Docker container to generate participation keys based on a provided template file and save them to a specified output directory. It requires mounting the template file and an output directory for the generated keys.

SOURCE: https://github.com/algorand/go-algorand/blob/master/docker/README.md#_snippet_2

LANGUAGE: bash
CODE:
```
docker run --rm -it \
    --name pregen \
    -v /path/to/your/template.json:/etc/algorand/template.json \
    -v $(pwd)/pregen:/algod/pregen \
    --entrypoint "/node/bin/goal" \
    algorand/algod:stable network pregen -t /etc/algorand/template.json -p /algod/pregen
```

--------------------------------

TITLE: Checking Contract Expiration Round in Algorand TEAL
DESCRIPTION: This TEAL snippet verifies that the transaction's LastValid round is before the contract's expiration round, specified by the template parameter `TMPL_EXPIRE`. This check ensures the delegated key registration is not attempted after the contract has expired. It is combined with previous checks using `&&`.

SOURCE: https://github.com/algorand/go-algorand/blob/master/tools/teal/templates/docs/delegate-keyreg.teal.md#_snippet_2

LANGUAGE: TEAL
CODE:
```
txn LastValid
int TMPL_EXPIRE
<
&&
```

--------------------------------

TITLE: Starting Algorand Private Network with Pre-generated Keys using Docker
DESCRIPTION: This command starts an Algorand node inside a Docker container, mounting the previously pre-generated keys and the template file. By mounting the `pregen` directory to `/etc/algorand/keys`, the node reuses the existing participation keys, allowing the network to start much faster.

SOURCE: https://github.com/algorand/go-algorand/blob/master/docker/README.md#_snippet_3

LANGUAGE: bash
CODE:
```
docker run --rm -it --name algod-pregen-run \
    -p 4190:8080 \
    -v /tmp/big_keys.json:/etc/algorand/template.json \
    -v $(pwd)/pregen:/etc/algorand/keys \
    algorand/algod:stable
```

--------------------------------

TITLE: Recover Public Key (ECDSA) - Algorand TEAL
DESCRIPTION: Recovers an ECDSA public key from data, a signature, and a recovery ID for a specified curve (Secp256k1 or Secp256r1). Stack: ..., data: [32]byte, recovery_id: uint64, signature_R: [32]byte, signature_S: [32]byte → ..., pubkey_X: [32]byte, pubkey_Y: [32]byte. Availability: v5. Cost: 2000. Requires a curve index parameter.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_7

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_recover
```

--------------------------------

TITLE: Opcode: ed25519verify (0x04)
DESCRIPTION: Verifies an Ed25519 signature. It expects data ([]byte), a 64-byte signature, and a 32-byte public key on the stack (in that order, bottom to top). It verifies the signature of ("ProgData" || program_hash || data) against the public key and pushes a boolean (0 or 1) result. The cost is 1900.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v6.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
ed25519verify
```

--------------------------------

TITLE: Checking Transaction Type in Algorand TEAL
DESCRIPTION: This TEAL snippet checks if the current transaction is a Key Registration transaction. It compares the transaction's TypeEnum field to the integer value '2', which corresponds to the KeyReg transaction type.

SOURCE: https://github.com/algorand/go-algorand/blob/master/tools/teal/templates/docs/delegate-keyreg.teal.md#_snippet_0

LANGUAGE: TEAL
CODE:
```
txn TypeEnum
int 2
==
```

--------------------------------

TITLE: ed25519verify Opcode (TEAL v8)
DESCRIPTION: The `ed25519verify` opcode verifies an Ed25519 signature against a public key and specific data. It expects three values on the stack: data ([]byte), signature ([64]byte), and public key ([32]byte), verifying the signature of ("ProgData" || program_hash || data) and pushing a boolean result (0 or 1).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
ed25519verify
```

--------------------------------

TITLE: Execute GPG Agent Forwarding Script (Shell)
DESCRIPTION: Runs the script located in the release scripts directory to set up GPG agent forwarding, allowing remote signing without transferring the private key. This is a manual step required before the signing stage proceeds.

SOURCE: https://github.com/algorand/go-algorand/blob/master/scripts/release/README.md#_snippet_1

LANGUAGE: Shell
CODE:
```
./forward_gpg_agent.sh
```

--------------------------------

TITLE: ecdsa_pk_decompress TEAL v5 Opcode
DESCRIPTION: Decompresses a 33-byte compressed ECDSA public key (A) for a specified curve (V) into its 32-byte X and Y components. It replaces A with X (bottom) and Y (top) on the stack. All values are big-endian. Available in v5. Costs 650 units for Secp256k1.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_6

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_decompress V
Bytecode: 0x06 {uint8}
Stack: ..., A: [33]byte → ..., X: [32]byte, Y: [32]byte
```

--------------------------------

TITLE: Verifying Authorized Signature in Algorand TEAL
DESCRIPTION: This TEAL snippet performs the final check: verifying that the transaction's ID (`TxID`) has been signed by the authorized key (`TMPL_AUTH`) and that the signature is provided as the first argument (`arg_0`) to the contract. It uses the `ed25519verify` opcode. This check is combined with all previous conditions using `&&`.

SOURCE: https://github.com/algorand/go-algorand/blob/master/tools/teal/templates/docs/delegate-keyreg.teal.md#_snippet_6

LANGUAGE: TEAL
CODE:
```
txn TxID
arg_0
addr TMPL_AUTH
ed25519verify
&&
```

--------------------------------

TITLE: ecdsa_pk_recover Opcode (TEAL v8)
DESCRIPTION: The `ecdsa_pk_recover` opcode recovers an ECDSA public key from a signature and recovery ID for a specified curve (V). It expects four values on the stack: data hash (A), recovery ID (B), signature R (C), and signature S (D), pushing the recovered 32-byte public key components (X and Y) onto the stack.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_7

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_recover V
```

--------------------------------

TITLE: Invalid JSON: Duplicate Top-Level Key
DESCRIPTION: Illustrates an invalid JSON object with duplicate keys at the top level, which results in an error.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/jsonspec.md#_snippet_2

LANGUAGE: json
CODE:
```
{"key0": 1,"key0": 2}
```

--------------------------------

TITLE: ecdsa_pk_recover TEAL v5 Opcode
DESCRIPTION: Recovers an ECDSA public key for a specified curve (V) from a 32-byte data hash (A), a uint64 recovery ID (B), and 32-byte signature components R (C) and S (D). It replaces the inputs with the recovered 32-byte public key components X (bottom) and Y (top) on the stack. S is the top element, followed by R, recovery ID, and data. All values are big-endian. The data hash must be 32 bytes. Available in v5. Costs 2000 units.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_7

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_recover V
Bytecode: 0x07 {uint8}
Stack: ..., A: [32]byte, B: uint64, C: [32]byte, D: [32]byte → ..., X: [32]byte, Y: [32]byte
```

--------------------------------

TITLE: ecdsa_pk_decompress (TEAL)
DESCRIPTION: Decompress pubkey A into components X, Y.
The 33 byte public key in a compressed form to be decompressed into X and Y (top) components. All values are big-endian encoded.
Stack: ..., A: [33]byte → ..., X: [32]byte, Y: [32]byte
Bytecode: 0x06 {uint8}
Cost: Secp256k1=650; Secp256r1=2400
Availability: v5

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v11.md#_snippet_6

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_decompress V
```

--------------------------------

TITLE: Verifying Ed25519 Signature (AVM Assembly)
DESCRIPTION: Verifies an Ed25519 signature against data and a public key. It takes data ([]byte), a signature ([64]byte), and a public key ([32]byte) from the stack and pushes a boolean result (0 or 1). It has a cost of 1900 and is available since AVM v7.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v10.md#_snippet_76

LANGUAGE: AVM Assembly
CODE:
```
ed25519verify_bare
```

--------------------------------

TITLE: Ed25519verify TEAL v2 Opcode
DESCRIPTION: For (data A, signature B, pubkey C) verify the signature of ("ProgData" || program_hash || data) against the pubkey → {0 or 1}. The 32 byte public key is the last element on the stack, preceded by the 64 byte signature at the second-to-last element on the stack, preceded by the data which was signed at the third-to-last element on the stack. Stack: ..., A: []byte, B: [64]byte, C: [32]byte → ..., bool. Cost: 1900. Mode: Signature.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v2.md#_snippet_4

LANGUAGE: TEAL Syntax
CODE:
```
ed25519verify
```

LANGUAGE: TEAL Bytecode
CODE:
```
0x04
```

--------------------------------

TITLE: Verify Ed25519 Signature - AVM/TEAL
DESCRIPTION: Verifies an Ed25519 signature against data and a public key, pushing a boolean result (0 or 1) onto the stack. Requires data ([]byte), signature ([64]byte), and public key ([32]byte) on the stack. Available since AVM v7 with a cost of 1900.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v9.md#_snippet_84

LANGUAGE: Hex
CODE:
```
0x84
```

--------------------------------

TITLE: Verify Signature (Ed25519) - Algorand TEAL
DESCRIPTION: Verifies an Ed25519 signature against data and a public key. Stack: ..., data: []byte, signature: [64]byte, pubkey: [32]byte → ..., bool. Verifies the signature of ("ProgData" || program_hash || data) against the pubkey. Cost: 1900.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
ed25519verify
```

--------------------------------

TITLE: ecdsa_verify Opcode (TEAL v8)
DESCRIPTION: The `ecdsa_verify` opcode verifies an ECDSA signature for a specified curve (V). It requires five 32-byte values on the stack: data hash (A), signature R (B), signature S (C), public key X (D), and public key Y (E), pushing a boolean result (0 or 1) indicating verification success.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_5

LANGUAGE: TEAL
CODE:
```
ecdsa_verify V
```

--------------------------------

TITLE: Acceptable JSON: Nested Duplicate Key
DESCRIPTION: Provides an example of acceptable JSON where duplicate keys are nested at a lower level; these are ignored according to the specification.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/jsonspec.md#_snippet_3

LANGUAGE: json
CODE:
```
{"key0": 1,"key1": {"key2":2,"key2":"10"}}
```

--------------------------------

TITLE: Opcode: ecdsa_pk_recover (0x07)
DESCRIPTION: Recovers an ECDSA public key from a signature and message for a specified curve (V). It expects 32-byte data, a uint64 recovery ID, 32-byte signature R, and 32-byte signature S on the stack (bottom to top). All values are big-endian. The signed data must be 32 bytes. It consumes four values and pushes two 32-byte public key components (X then Y) onto the stack. Available since v5. Cost is 2000.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v6.md#_snippet_7

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_recover
```

--------------------------------

TITLE: ed25519verify (TEAL)
DESCRIPTION: For (data A, signature B, pubkey C) verify the signature of ("ProgData" || program_hash || data) against the pubkey => {0 or 1}.
The 32 byte public key is the last element on the stack, preceded by the 64 byte signature at the second-to-last element on the stack, preceded by the data which was signed at the third-to-last element on the stack.
Stack: ..., A: []byte, B: [64]byte, C: [32]byte → ..., bool
Bytecode: 0x04
Cost: 1900

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v11.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
ed25519verify
```

--------------------------------

TITLE: ecdsa_pk_recover (TEAL)
DESCRIPTION: For (data A, recovery id B, signature C, D) recover a public key.
S (top) and R elements of a signature, recovery id and data (bottom) are expected on the stack and used to deriver a public key. All values are big-endian encoded. The signed data must be 32 bytes long.
Stack: ..., A: [32]byte, B: uint64, C: [32]byte, D: [32]byte → ..., X: [32]byte, Y: [32]byte
Bytecode: 0x07 {uint8}
Cost: 2000
Availability: v5

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v11.md#_snippet_7

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_recover V
```

--------------------------------

TITLE: Opcode: ecdsa_pk_decompress (0x06)
DESCRIPTION: Decompresses a 33-byte compressed ECDSA public key (A) for a specified curve (V) into its 32-byte X and 32-byte Y components. It consumes one 33-byte value and pushes two 32-byte values (X then Y) onto the stack. All values are big-endian. Available since v5. Cost for Secp256k1 is 650.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v6.md#_snippet_6

LANGUAGE: TEAL
CODE:
```
ecdsa_pk_decompress
```

--------------------------------

TITLE: TEAL v4 Opcode: ed25519verify
DESCRIPTION: Verifies an Ed25519 signature against a public key and data. It expects the data ([]byte), signature ([64]byte), and public key ([32]byte) on the stack (in that order, top-to-bottom). It pushes a boolean (0 or 1) indicating success or failure. The verification is performed on the hash of ('ProgData' || program_hash || data). This operation has a cost of 1900 and is used in Signature mode.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v4.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
ed25519verify
```

--------------------------------

TITLE: Verifying VRF Proof in Algorand TEAL
DESCRIPTION: Verifies the proof B of message A against public key C using the specified VRF algorithm S. Returns the VRF output (64 bytes) and a boolean verification flag. The standard VrfAlgorand (ECVRF-ED25519-SHA512-Elligator2) is available. This operation has a cost of 5700. Available from TEAL version 7.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_146

LANGUAGE: TEAL
CODE:
```
Syntax: vrf_verify S
Bytecode: 0xd0 {uint8}
Stack: ..., A: []byte, B: [80]byte, C: [32]byte -> ..., X: [64]byte, Y: bool
Cost: 5700
Availability: v7

Standards:
Index | Name
- | -
0 | VrfAlgorand (ECVRF-ED25519-SHA512-Elligator2)
```

--------------------------------

TITLE: ecdsa_verify TEAL v5 Opcode
DESCRIPTION: Verifies an ECDSA signature for a specified curve (V). It expects 32-byte data (A), 32-byte signature components R (B) and S (C), and 32-byte public key components X (D) and Y (E) on the stack. It verifies the signature against the public key and pushes 1 (true) or 0 (false) onto the stack. The Y-component is the top element, followed by X, S, R, and data. All values are big-endian. Only lower-S signatures are accepted. Available in v5. Costs 1700 units for Secp256k1.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v5.md#_snippet_5

LANGUAGE: TEAL
CODE:
```
ecdsa_verify V
Bytecode: 0x05 {uint8}
Stack: ..., A: [32]byte, B: [32]byte, C: [32]byte, D: [32]byte, E: [32]byte → ..., bool
```

--------------------------------

TITLE: Log Application State (TEAL)
DESCRIPTION: write A to log state of the current application. Fails if called more than MaxLogCalls times in a program, or if the sum of logged bytes exceeds 1024 bytes. Bytecode: 0xb0. Stack: ..., A: []byte → .... Availability: v5. Mode: Application.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v11.md#_snippet_87

LANGUAGE: TEAL
CODE:
```
log
```

--------------------------------

TITLE: Verify Ed25519 Signature (ed25519verify_bare) in TEAL
DESCRIPTION: Verifies an Ed25519 signature against provided data and a public key. It consumes the data, signature, and public key from the stack and pushes a boolean result (0 or 1) indicating success or failure.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v8.md#_snippet_107

LANGUAGE: Algorand TEAL
CODE:
```
0x84
```

--------------------------------

TITLE: Running tealdbg in Signature Mode (Command Line)
DESCRIPTION: Illustrates how to explicitly set the execution mode for `tealdbg` to "signature". This mode matches Algod's evaluation for logic signature TEAL and restricts state access instructions like `balance` or `app_opted_in`.

SOURCE: https://github.com/algorand/go-algorand/blob/master/cmd/tealdbg/README.md#_snippet_5

LANGUAGE: Command Line
CODE:
```
$ tealdbg debug myprog.teal --mode signature
```

--------------------------------

TITLE: Opcode: ecdsa_verify (0x05)
DESCRIPTION: Verifies an ECDSA signature for a specified curve (V). It expects 32-byte data, 32-byte signature R, 32-byte signature S, 32-byte public key X, and 32-byte public key Y on the stack (bottom to top). All values are big-endian. The signed data must be 32 bytes. Only signatures in lower-S form are accepted. It pushes a boolean (0 or 1) result. Available since v5. Cost for Secp256k1 is 1700.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v6.md#_snippet_5

LANGUAGE: TEAL
CODE:
```
ecdsa_verify
```

--------------------------------

TITLE: ed25519verify TEAL Opcode
DESCRIPTION: Verifies an Ed25519 signature. Verifies the signature B of ("ProgData" || program_hash || data A) against the public key C. The stack order is data A, signature B, pubkey C. Stack effect: ..., A: []byte, B: [64]byte, C: [32]byte → ..., bool. Bytecode: 0x04. Cost: 1900. Mode: Signature.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v3.md#_snippet_4

LANGUAGE: TEAL
CODE:
```
ed25519verify
Bytecode: 0x04
Stack: ..., A: []byte, B: [64]byte, C: [32]byte → ..., bool
```

--------------------------------

TITLE: TEAL Log Application State
DESCRIPTION: Writes byte array A to the log state of the current application. Available from TEAL version 5 in Application mode. Fails if called more than MaxLogCalls times or if the sum of logged bytes exceeds 1024 bytes.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v9.md#_snippet_117

LANGUAGE: TEAL
CODE:
```
log
```

--------------------------------

TITLE: Verify Ed25519 Signature (TEAL)
DESCRIPTION: Verifies an Ed25519 signature (B) of data (A) against a public key (C). Returns 1 if valid, 0 otherwise.

Bytecode: 0x84
Stack: ..., A: []byte, B: [64]byte, C: [32]byte → ..., bool
Cost: 1900
Availability: v7

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_100

LANGUAGE: TEAL
CODE:
```
ed25519verify_bare
```

--------------------------------

TITLE: ecdsa_verify (TEAL)
DESCRIPTION: For (data A, signature B, C and pubkey D, E) verify the signature of the data against the pubkey => {0 or 1}.
The 32 byte Y-component of a public key is the last element on the stack, preceded by X-component of a pubkey, preceded by S and R components of a signature, preceded by the data that is fifth element on the stack. All values are big-endian encoded. The signed data must be 32 bytes long, and signatures in lower-S form are only accepted.
Stack: ..., A: [32]byte, B: [32]byte, C: [32]byte, D: [32]byte, E: [32]byte → ..., bool
Bytecode: 0x05 {uint8}
Cost: Secp256k1=1700; Secp256r1=2500
Availability: v5

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v11.md#_snippet_5

LANGUAGE: TEAL
CODE:
```
ecdsa_verify V
```

--------------------------------

TITLE: Verify Signature (ECDSA) - Algorand TEAL
DESCRIPTION: Verifies an ECDSA signature against data and a public key for a specified curve (Secp256k1 or Secp256r1). Stack: ..., data: [32]byte, signature_R: [32]byte, signature_S: [32]byte, pubkey_X: [32]byte, pubkey_Y: [32]byte → ..., bool. Availability: v5. Cost: Secp256k1=1700; Secp256r1=2500. Requires a curve index parameter.

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v7.md#_snippet_5

LANGUAGE: TEAL
CODE:
```
ecdsa_verify
```

--------------------------------

TITLE: Verify VRF Proof (vrf_verify) - TEAL
DESCRIPTION: Verifies the VRF proof B of message A against public key C. Returns the VRF output (X) and a boolean verification flag (Y).

- Syntax: `vrf_verify S` where S: [vrf_verify](#field-group-vrf_verify)
- Bytecode: 0xd0 {uint8}
- Stack: ..., A: []byte, B: [80]byte, C: [32]byte → ..., X: [64]byte, Y: bool
- Cost: 5700
- Availability: v7

Standards:
| Index | Name | Notes |
| - | ------ | --------- |
| 0 | VrfAlgorand |  |

`VrfAlgorand` is the VRF used in Algorand. It is ECVRF-ED25519-SHA512-Elligator2, specified in the IETF internet draft [draft-irtf-cfrg-vrf-03](https://datatracker.ietf.org/doc/draft-irtf-cfrg-vrf/03/).

SOURCE: https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/TEAL_opcodes_v10.md#_snippet_132

LANGUAGE: TEAL
CODE:
```
vrf_verify S
```

--------------------------------

TITLE: Checking Transaction Fee Limit in Algorand TEAL
DESCRIPTION: This TEAL snippet checks if the transaction's fee is less than or equal to the template parameter `TMPL_FEE`. It is intended to be combined with previous checks using a logical AND (`&&`) to ensure all conditions are met.

SOURCE: https://github.com/algorand/go-algorand/blob/master/tools/teal/templates/docs/delegate-keyreg.teal.md#_snippet_1

LANGUAGE: TEAL
CODE:
```
txn Fee
int TMPL_FEE
<=
&&
```

--------------------------------

TITLE: Checking Transaction Lease Field in Algorand TEAL
DESCRIPTION: This TEAL snippet verifies that the transaction's Lease field exactly matches the template parameter `TMPL_LEASE`. The lease field is used for replay protection, and enforcing a specific value, combined with the `FirstValid` periodicity check, limits the number of transactions that can be approved per period. This check is combined with previous conditions using `&&`.

SOURCE: https://github.com/algorand/go-algorand/blob/master/tools/teal/templates/docs/delegate-keyreg.teal.md#_snippet_5

LANGUAGE: TEAL
CODE:
```
txn Lease
byte base64 TMPL_LEASE
==
&&
```