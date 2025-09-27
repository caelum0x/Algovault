Box Storage
Box storage in Algorand is a feature that provides additional on-chain storage options for smart contracts, allowing them to store and manage larger amounts of data beyond the limitations of global and local state. Unlike the fixed sizes of global and local state storages, box storage offers dynamic flexibility for creating, resizing, and deleting storage units

These storage units, called boxes, are key-value storage segments associated with individual applications, each capable of storing upto 32KB (32768 bytes) of data as byte arrays. Boxes are only visible and accessible to the application that created them, ensuring data integrity and security. The app account (the smart contract) is responsible for funding the box storage, and only the creating app can read, write, or delete its boxes on-chain.

Both the box key and data are stored as byte arrays, requiring any uint64 variables to be converted before storage. While box storage expands the capabilities of Algorand smart contracts, it does incur additional costs in terms of minimum balance requirements (MBR) to cover the network storage space. The maximum number of box references is currently set to 8, allowing an app to create and reference up to 8 boxes simultaneously. Each box is a fixed-length structure but can be resized using the App.box_resize method or by deleting and recreating the box. Boxes over 1024 bytes require additional references, as each reference has a 1024-byte operational budget. The app account’s MBR increases with each additional box and byte in the box’s name and allocated size. If an application with outstanding boxes is deleted, the MBR is not recoverable, so it’s recommended to delete all box storage and withdraw funds before app deletion.

Usage of Boxes
Boxes are helpful in many scenarios:

Applications that need more extensive or unbound contract storage.
Applications that want to store data per user but do not wish to require users to opt in to the contract or need the account data to persist even after the user closes or clears out of the application.
Applications that have dynamic storage requirements.
Applications requiring larger storage blocks that can not fit the existing global state key-value pairs.
Applications that require storing arbitrary maps or hash tables.
Box Array
When interacting with apps via app call transactions, developers need a way to specify which boxes an application will access during execution. The box array is part of the smart contract reference arrays alongside the apps, accounts, and assets arrays. These arrays define the objects the app call will interact with (read, write, or send transactions to).

The box array is an array of pairs: the first element of each pair is an integer specifying the index into the foreign application array, and the second element is the key name of the box to be accessed.

Each entry in the box array allows access to only 1kb of data. For example, if a box is sized to 4kb, the transaction must use four entries in this array. To claim an allotted entry, a corresponding app ID and box name must be added to the box ref array. If you need more than the 1kb associated with that specific box name, you can either specify the box ref entry more than once or, preferably, add “empty” box refs [0,""] into the array. If you specify 0 as the app ID, the box ref is for the application being called.

For example, suppose the contract needs to read “BoxA” which is 1.5kb, and “Box B” which is 2.5kb. This would require four entries in the box ref array and would look something like:

boxes=[[0, "BoxA"],[0,"BoxB"], [0,""],[0,""]]

The required box I/O budget is based on the sizes of the boxes accessed rather than the amount of data read or written. For example, if a contract accesses “Box A” with a size of 2kb and “Box B” with a size of 10 bytes, this requires both boxes to be in the box reference array and one additional reference ( ceil((2kb + 10b) / 1kb), which can be an “empty” box reference.

Access budgets are summed across multiple application calls in the same transaction group. For example, in a group of two smart contract calls, there is room for 16 array entries (8 per app call), allowing access to 16kb of data. If an application needs to access a 16kb box named “Box A”, it will need to be grouped with one additional application call, and the box reference array for each transaction in the group should look similar to this:

Transaction 0: [0,“Box A”],[0,""],[0,""],[0,""],[0,""],[0,""],[0,""],[0,""] Transaction 1: [0,""],[0,""],[0,""],[0,""],[0,""],[0,""],[0,""],[0,""]

Box refs can be added to the boxes array using goal or any SDKs.

Terminal window
goal app method --app-id=53 --method="add_member2()void" --box="53,str:BoxA" --from=CONP4XZSXVZYA7PGYH7426OCAROGQPBTWBUD2334KPEAZIHY7ZRR653AFY

Minimum Balance Requirement For Boxes
Boxes are created by a smart contract and raise the minimum balance requirement (MBR) in the contract’s ledger balance. This means that a contract intending to use boxes must be funded beforehand.

When a box with name n and size s is created, the MBR is raised by 2500 + 400 * (len(n)+s) microAlgos. When the box is destroyed, the minimum balance requirement is decremented by the same amount.

Notice that the key (name) is included in the MBR calculation.

For example, if a box is created with the name “BoxA” (a 4-byte long key) and with a size of 1024 bytes, the MBR for the app account increases by 413,700 microAlgos:

(2500 per box) + (400 * (box size + key size))
(2500) + (400 * (1024+4)) = 413,700 microAlgos

Manipulating Box Storage
Box storage offers several abstractions for efficient data handling:

Box: Box abstracts the reading and writing of a single value to a single box. The box size will be reconfigured dynamically to fit the size of the value being assigned to it.

BoxRef: BoxRef abstracts the reading and writing of boxes containing raw binary data. The size is configured manually and can be set to values larger than the AVM can handle in a single value.

BoxMap: BoxMap abstracts the reading and writing of a set of boxes using a common key and content type. Each composite key (prefix + key) still needs to be made available to the application via the boxes property of the Transaction.

Allocation
App A can allocate as many boxes as needed when needed. App a allocates a box using the box_create opcode in its TEAL program, specifying the name and the size of the allocated box. Boxes can be any size from 0 to 32K bytes. Box names must be at least 1 byte, at most 64 bytes, and unique within app a. The app account(the smart contract) is responsible for funding the box storage (with an increase to its minimum balance requirement; see below for details). The app call’s boxes array must reference a box name and app ID to be allocated.

Boxes may only be accessed (whether reading or writing) in a Smart Contract’s approval program, not in a clear state program.

Creating a Box
The AVM supports two opcodes box_create and box_put that can be used to create a box. The box_create opcode takes two parameters, the name and the size in bytes for the created box. The box_put opcode takes two parameters as well. The first parameter is the name and the second is a byte array to write. Because the AVM limits any element on the stack to 4kb, box_put can only be used for boxes with length <= 4kb.

Boxes can be created and deleted, but once created, they cannot be resized. At creation time, boxes are filled with 0 bytes up to their requested size. The box’s contents can be changed, but the size is fixed at that point. If a box needs to be resized, it must first be deleted and then recreated with the new size.

Algorand TypeScript
Algorand Python
TypeScript
Source
  public boxString = Box<string>({ key: 'boxString' })
  public boxInt = Box<uint64>({ key: 'boxInt' })
  public boxBytes = Box<bytes>({ key: 'boxBytes' })
  public boxDynamicBytes = Box<arc4.DynamicBytes>({ key: 'boxDynamicBytes' })
  public boxRef = BoxRef({ key: 'boxRef' })
  public boxMap = BoxMap<uint64, string>({ keyPrefix: 'boxMap' })
  public boxMapStruct = BoxMap<uint64, UserStruct>({ keyPrefix: 'users' })

Box names must be unique within an application. If using box_create, and an existing box name is passed with a different size, the creation will fail. If an existing box name is used with the existing size, the call will return a 0 without modifying the box contents. When creating a new box, the call will return a 1. When using box_put with an existing key name, the put will fail if the size of the second argument (data array) is different from the original box size.

Note

When creating a box, the key name must be in the box ref array.

Reading
Boxes can only be manipulated by the smart contract that owns them. While the SDKs and goal cmd tool allow these boxes to be read off-chain, only the smart contract that owns them can read or manipulate them on-chain. App a is the only app that can read the contents of its boxes on-chain. This on-chain privacy is unique to box storage. Recall that anybody can read everything from off-chain using the algod or indexer APIs. To read box b from app a, the app call must include b in its boxes array. Read budget: Each box reference in the boxes array allows an app call to access 1K bytes of box state - 1K of “box read budget”. To read a box larger than 1K, multiple box references must be put in the boxes arrays. The box read budget is shared across the transaction group. The total box read budget must be larger than the sum of the sizes of all the individual boxes referenced (it is not possible to use this read budget for a part of a box - the whole box is read in). Box data is unstructured. This is unique to box storage. A box is referenced by including its app ID and box name.

The AVM provides two opcodes for reading the contents of a box, box_get and box_extract. The box_get opcode takes one parameter,: the key name of the box. It reads the entire contents of a box. The box_get opcode returns two values. The top-of-stack is an integer that has the value of 1 or 0. A value of 1 means that the box was found and read. A value of 0 means that the box was not found. The next stack element contains the bytes read if the box exists; otherwise, it contains an empty byte array. box_get fails if the box length exceeds 4kb.

Algorand TypeScript
Algorand Python
TEAL
Source
  /**
   * Retrieves the value stored in the boxInt box
   * @returns The uint64 value stored in boxInt
   */
  @abimethod({ readonly: true })
  public getBox(): uint64 {
    return this.boxInt.value
  }

  /**
   * Retrieves the value of the boxInt box
   */
  @abimethod({ readonly: true })
  public valueBox(): uint64 {
    return this.boxInt.value
  }

  /**
   * Retrieves the value stored in the boxInt box and checks if it exists
   * @returns A tuple containing the value and a boolean indicating if the box exists
   */
  @abimethod({ readonly: true })
  public maybeBox(): [uint64, boolean] {
    const [boxIntValue, boxIntExists] = this.boxInt.maybe()
    return [boxIntValue, boxIntExists]
  }

  /**
   * Retrieves the value stored in the boxMap box
   * @param key The key of the boxMap to retrieve the value from
   * @returns The value stored in the boxMap box
   */
  @abimethod({ readonly: true })
  public getBoxMap(key: uint64): string {
    return this.boxMap(key).value
  }

  /**
   * Retrieves the value stored in the boxMap box with a default value if the key does not exist
   * @param key The key of the boxMap to retrieve the value from
   * @returns The value stored in the boxMap box
   */
  @abimethod({ readonly: true })
  public getBoxMapWithDefault(key: uint64): string {
    return this.boxMap(key).get({ default: 'default' })
  }

  /**
   * Retrieves the value stored in the boxMap box and checks if it exists
   * @param key The key to check in the boxMap
   * @returns A tuple containing the value and a boolean indicating if the box exists
   */
  @abimethod({ readonly: true })
  public maybeBoxMap(key: uint64): [string, boolean] {
    const [value, exists] = this.boxMap(key).maybe()
    return [exists ? value : '', exists]
  }

  /**
   * Retrieves the key prefix of the boxMap box
   * @returns The key prefix of the boxMap box
   */
  @abimethod({ readonly: true })
  public keyPrefixBoxMap(): bytes {
    return this.boxMap.keyPrefix
  }

  /**
   * Retrieves the value stored in the boxRef box
   * @returns The value stored in the boxRef box
   */
  public getBoxRef(): arc4.Address {
    this.boxRef.create({ size: 32 })
    const senderBytes = Txn.sender.bytes
    this.boxRef.put(senderBytes)
    const value = this.boxRef.get({ default: senderBytes })
    assert(value === senderBytes, 'boxRef value mismatch')
    return new arc4.Address(value)
  }

  /**
   * Checks if the boxMap box exists
   * @param key The key to check for
   * @returns true if the box exists, false otherwise
   */
  @abimethod({ readonly: true })
  public boxMapExists(key: uint64): boolean {
    return this.boxMap(key).exists
  }

  /**
   * Retrieves the value stored in the boxRef box and checks if it exists
   * @returns A tuple containing the value and a boolean indicating if the box exists
   */
  @abimethod({ readonly: true })
  public maybeBoxRef(key: string): [bytes, boolean] {
    const boxRef = BoxRef({ key })
    const [value, exists] = boxRef.maybe()
    return [value, exists]
  }

Note

when using either opcode to read the contents of a box, the AVM is limited to reading no more than 4kb at a time. This is because the stack is limited to 4kb entries. For larger boxes, the box_extract opcode should be used to perform multiple reads to retrieve all the contents.

Algorand TypeScript
Python
TEAL
Source
  /**
   * Extracts a value from the boxRef box
   * @param key The key to extract from
   */
  public extractBoxRef(key: string): void {
    const senderBytes = Txn.sender.bytes
    const appAddress = Global.currentApplicationAddress.bytes

    const totalSize = Uint64(appAddress.length + senderBytes.length)

    const boxRef = BoxRef({ key })
    assert(boxRef.create({ size: totalSize }), 'boxRef creation failed')

    boxRef.replace(0, senderBytes)
    boxRef.splice(0, 0, appAddress)

    const part1 = boxRef.extract(0, 32)
    const part2 = boxRef.extract(32, 32)

    assert(part1.equals(appAddress), 'First part should match app address')
    assert(part2.equals(senderBytes), 'Second part should match sender bytes')
  }

Writing
App A is the only app that can write the contents of its boxes. As with reading, each box ref in the boxes array allows an app call to write 1kb of box state - 1kb of “box write budget”.

The AVM provides two opcodes, box_put and box_replace, to write data to a box. The box_put opcode is described in the previous section. The box_replace opcode takes three parameters: the key name, the starting location and replacement bytes.

Algorand TypeScript
Algorand Python
TEAL
Source
  /**
   * Sets the value of the boxInt box
   * @param valueInt The uint64 value to set in the boxInt box
   */
  public setBox(valueInt: uint64): void {
    this.boxInt.value = valueInt
  }

  /**
   * Sets the value of the boxString box
   * @param value The string value to set in the boxString box
   */
  public setBoxString(value: string): void {
    this.boxString.value = value
  }

  /**
   * Sets the value of the boxDynamicBytes box
   * @param value The dynamic bytes value to set in the boxDynamicBytes box
   */
  public setBoxDynamicBytes(value: arc4.DynamicBytes): void {
    this.boxDynamicBytes.value = value
  }

  /**
   * Sets the value of the boxMap box
   * @param key The key to set the value for
   * @param value The value to set in the boxMap box
   */
  public setBoxMap(key: uint64, value: string): void {
    this.boxMap(key).value = value
  }

  /**
   * Creates a box ref with the given key and sets its value to the sender's address
   * @param key The key to use for the box ref
   */
  public setBoxRef(key: string): void {
    const boxRef = BoxRef({ key })
    boxRef.create({ size: 32 })
    const senderBytes = Txn.sender.bytes
    boxRef.put(senderBytes)
  }

When using box_replace, the box size can not increase. This means the call will fail if the replacement bytes, when added to the start byte location, exceed the box’s upper bounds.

The following sections cover the details of manipulating boxes within a smart contract.

Getting a Box Length
The AVM offers the box_len opcode to retrieve the length of a box and verify its existence. The opcode takes the box key name and returns two unsigned integers (uint64). The top-of-stack is either a 0 or 1, where 1 indicates the box’s existence, and 0 indicates it does not exist. The next is the length of the box if it exists; otherwise, it is 0.

Algorand TypeScript
Python
TEAL
Source
  /**
   * Retrieves the length of the boxMap box
   * @param key The key to get the length for
   * @returns The length of the boxMap box
   */
  @abimethod({ readonly: true })
  public boxMapLength(key: uint64): uint64 {
    if (!this.boxMap(key).exists) {
      return Uint64(0)
    }

    return this.boxMap(key).length
  }

  /**
   * Retrieves the length of the boxRef box
   * @param key The key to get the length for
   * @returns The length of the boxRef box
   */
  public lengthBoxRef(key: string): uint64 {
    const boxRef = BoxRef({ key })
    assert(boxRef.create({ size: 32 }), 'boxRef creation failed')
    return boxRef.length
  }

Deleting a Box
Only the app that created a box can delete it. If an app is deleted, its boxes are not deleted. The boxes will not be modifiable but can still be queried using the SDKs. The minimum balance will also be locked. (The correct cleanup design is to look up the boxes from off-chain and call the app to delete all its boxes before deleting the app itself.)

The AVM offers the box_del opcode to delete a box. This opcode takes the box key name. The opcode returns one unsigned integer (uint64) with a value of 0 or 1. A value of 1 indicates the box existed and was deleted. A value of 0 indicates the box did not exist.

Algorand TypeScript
Python
TEAL
Source
  /**
   * Deletes the value of the boxInt box
   */
  public deleteBox(): void {
    this.boxInt.delete()
    this.boxDynamicBytes.delete()
    this.boxString.delete()

    assert(this.boxInt.get({ default: Uint64(42) }) === 42)
    assert(this.boxDynamicBytes.get({ default: new arc4.DynamicBytes('42') }).native === Bytes('42'))
    assert(this.boxString.get({ default: '42' }) === '42')
  }

  /**
   * Deletes the value of the boxMap box
   * @param key The key to delete the value from
   */
  public deleteBoxMap(key: uint64): void {
    this.boxMap(key).delete()
  }

  /**
   * Deletes the value of the boxRef box
   * @param key The key to delete the value from
   */
  public deleteBoxRef(key: string): void {
    const boxRef = BoxRef({ key })
    boxRef.delete()
    assertMatch(boxRef.maybe(), [Bytes(''), false])
  }

Other methods for boxes
Here are some methods that can be used with box reference to splice, replace and extract box

Algorand TypeScript
Python
TEAL
Source
  /**
   * Creates and manipulates a box containing a static array of 8-bit unsigned integers
   * @param key The key for the static array box
   * @returns The static array stored in the box
   */
  public arc4Box(key: string): StaticInts {
    const staticIntBox = Box<StaticInts>({ key: Bytes(key) })

    staticIntBox.value = new arc4.StaticArray<arc4.UintN8, 4>(
      new arc4.UintN8(0),
      new arc4.UintN8(1),
      new arc4.UintN8(2),
      new arc4.UintN8(3),
    )

    assert(staticIntBox.value[0].native === 0)
    assert(staticIntBox.value[1].native === 1)
    assert(staticIntBox.value[2].native === 2)
    assert(staticIntBox.value[3].native === 3)

    return staticIntBox.value
  }

You must delete all boxes before deleting a contract. If this is not done, the minimum balance for that box is not recoverable.

Summary of Box Operations
For manipulating box storage data like reading, writing, deleting and checking if it exists:

TEAL: Different opcodes can be used

Function	Description
box_create	creates a box named A of length B. It fails if the name A is empty or B exceeds 32,768. It returns 0 if A already exists else 1
box_del	deletes a box named A if it exists. It returns 1 if A existed, 0 otherwise
box_extract	reads C bytes from box A, starting at offset B. It fails if A does not exist or the byte range is outside A’s size
box_get	retrieves the contents of box A if A exists, else ”. Y is 1 if A exists, else 0
box_len	retrieves the length of box A if A exists, else 0. Y is 1 if A exists, else 0
box_put	replaces the contents of box A with byte-array B. It fails if A exists and len(B) != len(box A). It creates A if it does not exist
box_replace	writes byte-array C into box A, starting at offset B. It fails if A does not exist or the byte range is outside A’s size
Different functions of the box can be used. The detailed API reference can be found here

Example: Storing struct in box map
Algorand TypeScript
Algorand Python
Source
class UserStruct extends arc4.Struct<{
  name: arc4.Str
  id: arc4.UintN64
  asset: arc4.UintN64
}> {}

export default class StructInBoxMap extends Contract {
  public userMap = BoxMap<uint64, UserStruct>({ keyPrefix: 'users' })

  @abimethod()
  public boxMapTest(): boolean {
    const key0 = Uint64(0)
    const value = new UserStruct({
      name: new arc4.Str('testName'),
      id: new arc4.UintN64(70),
      asset: new arc4.UintN64(2),
    })

    this.userMap(key0).value = value.copy()
    assert(this.userMap(key0).length === value.bytes.length, 'Length mismatch')
    assert(this.userMap(key0).length === value.bytes.length, 'Length mismatch')
    return true
  }

  @abimethod()
  public boxMapSet(key: uint64, value: UserStruct): boolean {
    this.userMap(key).value = value.copy()
    assert(this.userMap(key).value === value.copy(), 'Value mismatch')
    return true
  }

  @abimethod()
  public boxMapGet(key: uint64): UserStruct {
    return this.userMap(key).value
  }

  @abimethod()
  public boxMapExists(key: uint64): boolean {
    return this.userMap(key).exists
  }
}