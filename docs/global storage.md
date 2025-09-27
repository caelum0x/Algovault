Global Storage
Global state is associated with the app itself Global storage is a feature in Algorand that allows smart contracts to persistently store key-value pairs in a globally accessible state. This guide provides comprehensive information on how to allocate, read, write, and manipulate global storage within smart contracts.

Manipulating Global State Storage
Smart contracts can create, update, and delete values in global state using TEAL (Transaction Execution Approval Language) opcodes. The number of values that can be written is limited by the initial configuration set during smart contract creation. State is represented as key-value pairs, where keys are stored as byte slices (byte-array values), and values can be stored as either byte slices or uint64 values. TEAL provides several opcodes for facilitating reading and writing to state, including app_global_put, app_global_get, app_global_get_ex.

Allocation
Global storage can include between 0 and 64 key/value pairs and a total of 8K of memory to share among them. The amount of global storage is allocated in key/value units and determined at contract creation, which cannot be edited later. The contract creator address is responsible for funding the global storage by an increase to their minimum balance requirement.

Algorand TypeScript
Algorand Python
TEAL
Source
  public globalInt = GlobalState<uint64>({ initialValue: Uint64(50) }) // UInt64 with default value
  public globalIntNoDefault = GlobalState<uint64>() // UInt64 with no default value
  public globalBytes = GlobalState<bytes>({ initialValue: Bytes('Silvio') }) // Bytes with default value
  public globalString = GlobalState<string>({ initialValue: 'Micali' }) // Bytes with default value
  public globalBool = GlobalState({ initialValue: true }) // Bool with default value
  public globalAccount = GlobalState<Account>() // Address with no default value

Reading from Global State
The global storage of a smart contract can be read by any application call that specifies the contract’s application ID in its foreign apps array. The key-value pairs in global storage can be read on-chain directly, or off-chain using SDKs, APIs, and the goal CLI. Only the smart contract itself can write to its own global storage.

TEAL provides opcodes to read global state values for the current smart contract. The app_global_get opcode retrieve values from the current contract’s global storage, respectively. The app_global_get_ex opcode returns two values on the stack: a boolean indicating whether the value was found, and the actual value if it exists.

These _ex opcodes allow reading global states from other accounts and smart contracts, as long as the account and contract are included in the accounts and applications arrays. Branching logic is typically used after calling the _ex opcodes to handle cases where the value is found or not found.

Algorand TypeScript
Algorand Python
TEAL
Source
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

Refer Sinppet Source to get global storage value for different data types

In addition to using TEAL, the global state values of a smart contract can be read externally using SDKs and the goal CLI. These reads are non-transactional queries that retrieve the current state of the contract.

Example command:

Terminal window
goal app read --app-id 1 --guess-format --global --from <ADDRESS>

This command returns the global state of the smart contract with application ID 1, formatted for readability.

Example Output

Output.json
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

Interpretation:

The keys are Creator, MyBytesKey, and MyUintKey.
The tt field indicates the type of the value: 1 for byte slices (byte-array values), 2 for uint64 values.
When tt=1, the value is stored in the tb field. The --guess-format option automatically converts the Creator value to an Algorand address with a checksum (instead of displaying the raw 32-byte public key).
When tt=2, the value is stored in the ui field.
The app_global_get_ex is used to read not only the global state of the current contract but any contract that is in the applications array. To access these foreign apps, they must be passed in with the application call.

Terminal window
goal app call --foreign-app APP1ID --foreign-app APP2ID

In addition to modifying its own global storage, a smart contract can read the global storage of any contract specified in its applications array. However, this is a read-only operation. The global state of other smart contracts cannot be modified directly. External smart contracts can be changed per smart contract call (transaction).

Writing to Global State
Can only be written by smart contract. To write to global state, use the app_global_put opcode.

Algorand TypeScript
Algorand Python
TEAL
Source
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

Refer Sinppet Source to set global storage value for different data types

Deleting Global State
Global storage is deleted when the corresponding smart contract is deleted. However, the smart contract can clear the contents of its global storage without affecting the minimum balance requirement.

Algorand TypeScript
Algorand Python
TEAL
Source
  @arc4.abimethod()
  public deleteGlobalState(): boolean {
    this.globalInt.delete()
    return true
  }

Refer Sinppet Source to delete global storage value for different data types

Summary of Global State Operations
For manipulating global storage data like reading, writing, deleting and checking if exists:

TEAL: Different opcodes can be used

Function	Description
app_global_get	Get global data for the current app
app_global_get_ex	Get global data for other app
app_global_put	Set global data to the current app
app_global_del	Delete global data from the current app
app_global_get_ex	Check if global data exists for the current app
app_global_get_ex	Check if global data exists for the other app
Different functions of globalState class can be used. The detailed api reference can be found here

Function	Description
GlobalState(type_)	Initialize a global state with the specified data type
get(default)	Get data or a default value if not found
maybe()	Get data and a boolean indicating if it exists