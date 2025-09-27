================
CODE SNIPPETS
================
TITLE: TypeScript: Get Box Map Value
DESCRIPTION: Retrieves a string value from a box map using a uint64 key. It also provides a method to retrieve the value with a default if the key is not found.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: typescript
CODE:
```
/**
* Retrieves the value stored in the boxMap box
* @param key The key of the boxMap to retrieve the value from
* @returns The value stored in the boxMap box
*/
@abimethod({ readonly: true })
public getBoxMap(key: uint64): string {
  return this.boxMap(key).value
}
```

LANGUAGE: typescript
CODE:
```
/**
* Retrieves the value stored in the boxMap box with a default value if the key does not exist
* @param key The key of the boxMap to retrieve the value from
* @returns The value stored in the boxMap box
*/
@abimethod({ readonly: true })
public getBoxMapWithDefault(key: uint64): string {
  return this.boxMap(key).get({ default: 'default' })
}
```

--------------------------------

TITLE: Box Management API
DESCRIPTION: This section details the API for interacting with keyed boxes. It includes methods to check if a box exists and retrieve its value, as well as methods to set or update the value of a box.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/type-aliases/boxmap

LANGUAGE: APIDOC
CODE:
```
Box Operations:

get(key: TKey): readonly [TValue, boolean]
  Description: Retrieves the value of a keyed box and checks for its existence.
  Parameters:
    key: TKey - The key of the box to check.
  Returns:
    readonly [TValue, boolean] - A tuple where the first element is the box value (TValue) and the second is a boolean indicating if the box exists.

set(key: TKey, value: TValue): void
  Description: Sets or updates the value of a keyed box.
  Parameters:
    key: TKey - The key of the box to set.
    value: TValue - The value to write to the box.
  Returns:
    void - This operation does not return a value.
```

--------------------------------

TITLE: CreateBoxOptions Interface
DESCRIPTION: Details the CreateBoxOptions interface used for creating Algorand boxes, including its properties like 'key'. This interface is part of the algorand-typescript library.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/-internal-/interfaces/createboxoptions

LANGUAGE: APIDOC
CODE:
```
CreateBoxOptions:
  Interface for creating a Box proxy.
  Defined in: packages/algo-ts/src/box.ts:202

  Properties:
    key: string | bytes
      The bytes which make up the key of the box
      Defined in: packages/algo-ts/src/box.ts:206
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

TITLE: CreateBoxRefOptions Interface
DESCRIPTION: API documentation for the CreateBoxRefOptions interface in algorand-typescript. This interface defines the options required for creating a BoxRef proxy, specifically detailing the 'key' property.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/-internal-/interfaces/createboxrefoptions

LANGUAGE: APIDOC
CODE:
```
Interface: CreateBoxRefOptions
Defined in: packages/algo-ts/src/box.ts:241

Options for creating a BoxRef proxy

Properties:
  key:
    Type: string | bytes
    Description: The bytes which make up the key of the box
    Defined in: packages/algo-ts/src/box.ts:245
```

--------------------------------

TITLE: BoxMap Function
DESCRIPTION: Creates a BoxMap proxy object for managing a set of values stored in individual boxes, indexed by a common key type. The key is encoded to bytes and prefixed, and the value is encoded/decoded on storage/retrieval.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/functions/boxmap

LANGUAGE: APIDOC
CODE:
```
BoxMap<TKey, TValue>(options: CreateBoxMapOptions)
  Creates a BoxMap proxy object offering methods of getting and setting a set of values stored in individual boxes indexed by a common key type.

  Type Parameters:
    TKey: The type of the value used to key each box. This key will be encoded to bytes and prefixed with `keyPrefix`.
    TValue: The type of the data stored in the box. This value will be encoded to bytes when stored and decoded on retrieval.

  Parameters:
    options: Options for creating the BoxMap proxy. See CreateBoxMapOptions.

  Returns:
    A BoxMap proxy object that allows getting and setting values in boxes.

  Defined in: packages/algo-ts/src/box.ts:234

  Related:
    - [Box](/reference/algorand-typescript/api-reference/index/functions/box)
    - [BoxRef](/reference/algorand-typescript/api-reference/index/functions/boxref)
```

--------------------------------

TITLE: Algorand Box Storage Operations
DESCRIPTION: Box storage in Algorand allows smart contracts to manage larger, dynamic data segments. Key operations include creating, resizing, reading, writing, and deleting boxes. Data and keys are byte arrays, requiring uint64 conversion. Boxes incur MBR costs and have size limitations. The maximum number of box references is 8, with additional references needed for boxes over 1024 bytes.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: APIDOC
CODE:
```
Algorand Box Storage:

Purpose:
  Provides dynamic, on-chain key-value storage for Algorand smart contracts, extending capabilities beyond global and local state.

Key Characteristics:
  - Data Storage: Up to 32KB (32768 bytes) per box as byte arrays.
  - Visibility: Boxes are only accessible to the application that created them.
  - Funding: The app account is responsible for funding box storage.
  - Access Control: Only the creating app can read, write, or delete its boxes.
  - Data Format: Both box keys and data are stored as byte arrays. uint64 variables must be converted.
  - Costs: Incurs additional Minimum Balance Requirements (MBR) for network storage space.
  - References: Maximum of 8 box references per application. Boxes over 1024 bytes require additional references.
  - MBR Increase: App account's MBR increases with each additional box and bytes in name/size.
  - Deletion: Deleting an app with outstanding boxes does not recover MBR. It's recommended to delete all box storage before app deletion.

Core Operations (Conceptual):

App.box_create(key: bytes, size: uint64)
  - Creates a new box associated with the application.
  - Parameters:
    - key: The unique identifier for the box (byte array).
    - size: The initial allocated size for the box (in bytes).
  - Returns: Success/failure status.

App.box_delete(key: bytes)
  - Deletes an existing box associated with the application.
  - Parameters:
    - key: The identifier of the box to delete.
  - Returns: Success/failure status.

App.box_get(key: bytes) -> bytes
  - Retrieves the data stored in a box.
  - Parameters:
    - key: The identifier of the box to retrieve.
  - Returns: The data content of the box as a byte array.

App.box_put(key: bytes, value: bytes)
  - Writes data to a box. If the box is larger than the provided value, the remaining space is zeroed out. If the value is larger than the box's allocated size, the box is resized.
  - Parameters:
    - key: The identifier of the box to write to.
    - value: The data to store in the box (byte array).
  - Returns: Success/failure status.

App.box_resize(key: bytes, new_size: uint64)
  - Resizes an existing box.
  - Parameters:
    - key: The identifier of the box to resize.
    - new_size: The new desired size for the box (in bytes).
  - Returns: Success/failure status.

App.box_length(key: bytes) -> uint64
  - Returns the current size of a box.
  - Parameters:
    - key: The identifier of the box.
  - Returns: The size of the box in bytes.

App.box_iterator()
  - Returns an iterator for all boxes associated with the application.
  - Returns: An iterator yielding box keys.

Usage Scenarios:
  - Applications requiring extensive or unbound contract storage.
  - Storing per-user data without requiring opt-in or persistence tied to user activity.
  - Handling dynamic storage requirements.
  - Storing data blocks larger than global state limits.
  - Implementing arbitrary maps or hash tables on-chain.
```

--------------------------------

TITLE: algopy.BoxMap Operations
DESCRIPTION: Documents the management of a collection of boxes using a common key and content type in algopy. Covers checking for key existence, deleting, getting, and setting values within the map, along with accessing the key prefix.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
algopy.BoxMap:
  __init__(key_type: type[algopy._TKey], value_type: type[algopy._TValue], /, *, key_prefix: bytes | str | algopy.Bytes | algopy.String = ...)
    Description: Abstracts reading/writing a set of boxes using a common key and content type. Each composite key needs to be available via the Transaction's `boxes` property.
    Parameters:
      key_type: The type of the keys.
      value_type: The type of the values.
      key_prefix: Value used as a prefix to key data. Defaults to the member variable name if not supplied and static.

  __contains__(key: algopy._TKey) -> bool
    Description: Returns True if a box with the specified key exists in the map.

  __delitem__(key: algopy._TKey) -> None
    Description: Deletes a keyed box from the map.

  __getitem__(key: algopy._TKey) -> algopy._TValue
    Description: Retrieve the contents of a keyed box. Fails if the box for the key has not been created.

  __setitem__(key: algopy._TKey, value: algopy._TValue) -> None
    Description: Write a value to a keyed box. Creates the box if it does not exist.

  get(key: algopy._TKey, *, default: algopy._TValue) -> algopy._TValue
    Description: Retrieve the contents of a keyed box, or return the default value if the box has not been created.
    Parameters:
      key: The key of the box to get.
      default: The default value to return if the box has not been created.

  key_prefix: property -> algopy.Bytes
    Description: Provides access to the raw storage key-prefix.
```

--------------------------------

TITLE: algopy.Box Class
DESCRIPTION: Documentation for the Box class in algopy, representing a key-value storage mechanism. Covers initialization, boolean evaluation, key/length access, and conditional retrieval.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
class algopy.Box
  Initialization:
    __bool__
    get
    property key
    property length
    maybe
    property value
```

--------------------------------

TITLE: algopy.BoxMap API
DESCRIPTION: Documentation for the BoxMap class, a dictionary-like structure for managing boxes. Supports get, set, and delete operations.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
class algopy.BoxMap:
  """A dictionary-like structure for managing boxes."""

  __contains__(key):
    """Checks if a key exists in the BoxMap."""

  __delitem__(key):
    """Deletes an item from the BoxMap."""

  __getitem__(key):
    """Retrieves an item from the BoxMap."""

  __setitem__(key, value):
    """Sets an item in the BoxMap."""

  get(key, default=None):
    """Retrieves an item, returning a default if not found."""

  property key_prefix:
    """The prefix used for keys in the BoxMap."""

  length():
    """Returns the number of items in the BoxMap."""

  maybe(key):
    """Returns the value for a key if present, otherwise None."""
```

--------------------------------

TITLE: CreateBoxMapOptions Interface
DESCRIPTION: Defines the structure for options used when creating a BoxMap proxy in the Algorand TypeScript SDK. It specifies the key prefix for the map.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/-internal-/interfaces/createboxmapoptions

LANGUAGE: APIDOC
CODE:
```
Interface: CreateBoxMapOptions

Defined in: packages/algo-ts/src/box.ts:221

Description: Options for creating a BoxMap proxy

Properties:
  keyPrefix: string | bytes
    Defined in: packages/algo-ts/src/box.ts:225
    Description: The bytes which prefix each key of the box map

Related:
  Previous: ConcatArray
  Next: CreateBoxOptions
```

--------------------------------

TITLE: TypeScript: Get Box Map Value with Existence Check
DESCRIPTION: Retrieves a string value from a box map by key and checks for its existence. Returns a tuple with the value (or empty string if not found) and a boolean indicating existence.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: typescript
CODE:
```
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
```

--------------------------------

TITLE: Algopy BoxMap for Grouped Storage
DESCRIPTION: Demonstrates the usage of BoxMap to group Algorand boxes with a common key and content type. It shows how to define a BoxMap with a key prefix and interact with it within a contract, including checking for existence and assigning values.

SOURCE: https://dev.algorand.co/algokit/languages/python/lg-storage

LANGUAGE: Python
CODE:
```
from algopy import BoxMap, Contract, Account, Txn, String

class MyContract(Contract):

    def __init__(self) -> None:
        self.my_map = BoxMap(Account, String, key_prefix=b"a_")

    def approval_program(self) -> bool:
        # Check if the box exists
        if Txn.sender in self.my_map:
            # Reassign the value
            self.my_map[Txn.sender] = String(" World")
        else:
            # Assign a new value
            self.my_map[Txn.sender] = String("Hello")

        # Read a value
        return self.my_map[Txn.sender] == String("Hello World")
```

--------------------------------

TITLE: BoxRef Type Alias and Methods
DESCRIPTION: This section details the BoxRef type alias, which acts as a proxy for Algorand smart contract boxes. It includes descriptions of its properties for checking existence, retrieving keys, lengths, and values, as well as methods for creating, deleting, and extracting data from boxes.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/type-aliases/boxref

LANGUAGE: APIDOC
CODE:
```
BoxRef Type Alias and Methods

This documentation describes the BoxRef type alias and its associated methods for interacting with Algorand boxes using algorand-typescript.

Type declaration:
BoxRef: object

Properties:
- exists: readonly boolean
  Get a boolean indicating if the box exists or not
- key: readonly bytes
  Get the key used by this box proxy
- length: readonly uint64
  Returns the length of the box, or error if the box does not exist
- value: bytes
  Get the value of the box. Error if this value is larger than what the `bytes` type supports

Methods:
- create(options: { size: uint64 }): boolean
  Create the box for this proxy with the specified size if it does not exist.
  No op if the box already exists.
  Parameters:
    options: The size of the box to create
      size: uint64
  Returns: boolean - True if the box was created, false if it already existed

- delete(): boolean
  Delete the box associated with this proxy if it exists.
  Returns: boolean - True if the box existed and was deleted, else false

- extract(start: uint64, length: uint64): bytes
  Extract a slice of bytes from the box.
  Error if the box does not exist.
  Error if `start` + `length` is greater than the box size.
  Parameters:
    start: uint64 - The index to start extracting
    length: uint64 - The number of bytes to extract
  Returns: bytes - The extracted slice of bytes
```

--------------------------------

TITLE: algopy.op.Box Methods
DESCRIPTION: Provides static methods for managing boxes, a key-value store available in Algorand smart contracts. These methods allow for creating, deleting, retrieving, and manipulating box data.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopyop

LANGUAGE: APIDOC
CODE:
```
class algopy.op.Box
  Description: Manages key-value storage (boxes) within Algorand smart contracts.

  Static Methods:
    create(key: bytes, value: bytes) -> None
      Description: Creates a new box with the given key and value.
      Parameters:
        key: The unique identifier for the box (bytes).
        value: The data to store in the box (bytes).
    delete(key: bytes) -> None
      Description: Deletes a box associated with the given key.
      Parameters:
        key: The identifier of the box to delete (bytes).
    extract(key: bytes) -> bytes
      Description: Retrieves the value associated with a given box key.
      Parameters:
        key: The identifier of the box to retrieve (bytes).
      Returns: The value stored in the box (bytes).
    get(key: bytes) -> bytes | None
      Description: Safely retrieves the value of a box, returning None if the box does not exist.
      Parameters:
        key: The identifier of the box to retrieve (bytes).
      Returns: The value stored in the box (bytes) or None.
    length(key: bytes) -> int
      Description: Returns the size of the value stored in a box.
      Parameters:
        key: The identifier of the box (bytes).
      Returns: The size of the box's value in bytes.
    put(key: bytes, value: bytes) -> None
      Description: Stores or updates a box with the given key and value.
      Parameters:
        key: The unique identifier for the box (bytes).
        value: The data to store in the box (bytes).
    replace(key: bytes, value: bytes) -> None
      Description: Replaces the content of an existing box with new data.
      Parameters:
        key: The identifier of the box to replace (bytes).
        value: The new data for the box (bytes).
    resize(key: bytes, new_size: int) -> None
      Description: Resizes an existing box to a new size.
      Parameters:
        key: The identifier of the box to resize (bytes).
        new_size: The desired new size for the box in bytes.
    splice(key: bytes, offset: int, length: int, value: bytes = b'') -> bytes
      Description: Replaces a portion of a box's value with new data or inserts data.
      Parameters:
        key: The identifier of the box to splice (bytes).
        offset: The starting position for the splice operation.
        length: The number of bytes to replace or remove.
        value: The data to insert (optional, defaults to empty bytes).
      Returns: The portion of the original box value that was replaced.
```

--------------------------------

TITLE: Algorand Python Box Storage Examples
DESCRIPTION: Provides examples for using the Box type in Algorand Python for direct key-value storage. Demonstrates declaring boxes, assigning values, checking existence, and modifying box contents.

SOURCE: https://dev.algorand.co/algokit/languages/python/lg-storage

LANGUAGE: python
CODE:
```
import typing as t
from algopy import Box, arc4, Contract, op

class MyContract(Contract):
    def __init__(self) -> None:
        # Declare a box with a static array type and a compile-time constant key
        self.box_a = Box(arc4.StaticArray[arc4.UInt32, t.Literal[20]], key=b"a")

    def approval_program(self) -> bool:
        # Declare a box as a local variable within a subroutine
        box_b = Box(arc4.String, key=b"b")
        
        # Assign a value to box_b
        box_b.value = arc4.String("Hello")

        # Check if box_a exists
        if self.box_a:
            # Reassign a specific element within the existing box_a value
            self.box_a.value[2] = arc4.UInt32(40)
        else:
            # Assign a new value to box_a, initializing with zeroed bytes
            self.box_a.value = arc4.StaticArray[arc4.UInt32, t.Literal[20]].from_bytes(op.bzero(20 * 4))
        
        # Example of reading a value (if it exists)
        # value_from_box_b = box_b.value
        
        return True

```

--------------------------------

TITLE: Algorand Box Storage: BoxRef Operations (Python)
DESCRIPTION: Illustrates Python code for managing Algorand's BoxRef, including creation, deletion, and retrieval of its key and value. This example demonstrates low-level interaction with box references.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: Python
CODE:
```
from algosdk.abi import UInt64, String, Bytes
from algosdk.abi.box import BoxRef
from algosdk.abi.transaction import Txn, Global

# Assuming 'self' is an instance of a contract

# @arc4.abimethod
# def get_box_ref(self) -> None:
#     box_ref = BoxRef(key=String("blob"))
#     assert box_ref.create(size=32)
#     sender_bytes = Txn.sender.bytes
#     assert box_ref.delete()
#     assert box_ref.key == b"blob"
#     assert box_ref.get(default=sender_bytes) == sender_bytes

```

--------------------------------

TITLE: algopy.op.Box Methods
DESCRIPTION: Provides static methods for managing boxes, a key-value store available in Algorand smart contracts. These methods allow for creating, deleting, retrieving, and manipulating box data.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: APIDOC
CODE:
```
class algopy.op.Box
  Description: Manages key-value storage (boxes) within Algorand smart contracts.

  Static Methods:
    create(key: bytes, value: bytes) -> None
      Description: Creates a new box with the given key and value.
      Parameters:
        key: The unique identifier for the box (bytes).
        value: The data to store in the box (bytes).
    delete(key: bytes) -> None
      Description: Deletes a box associated with the given key.
      Parameters:
        key: The identifier of the box to delete (bytes).
    extract(key: bytes) -> bytes
      Description: Retrieves the value associated with a given box key.
      Parameters:
        key: The identifier of the box to retrieve (bytes).
      Returns: The value stored in the box (bytes).
    get(key: bytes) -> bytes | None
      Description: Safely retrieves the value of a box, returning None if the box does not exist.
      Parameters:
        key: The identifier of the box to retrieve (bytes).
      Returns: The value stored in the box (bytes) or None.
    length(key: bytes) -> int
      Description: Returns the size of the value stored in a box.
      Parameters:
        key: The identifier of the box (bytes).
      Returns: The size of the box's value in bytes.
    put(key: bytes, value: bytes) -> None
      Description: Stores or updates a box with the given key and value.
      Parameters:
        key: The unique identifier for the box (bytes).
        value: The data to store in the box (bytes).
    replace(key: bytes, value: bytes) -> None
      Description: Replaces the content of an existing box with new data.
      Parameters:
        key: The identifier of the box to replace (bytes).
        value: The new data for the box (bytes).
    resize(key: bytes, new_size: int) -> None
      Description: Resizes an existing box to a new size.
      Parameters:
        key: The identifier of the box to resize (bytes).
        new_size: The desired new size for the box in bytes.
    splice(key: bytes, offset: int, length: int, value: bytes = b'') -> bytes
      Description: Replaces a portion of a box's value with new data or inserts data.
      Parameters:
        key: The identifier of the box to splice (bytes).
        offset: The starting position for the splice operation.
        length: The number of bytes to replace or remove.
        value: The data to insert (optional, defaults to empty bytes).
      Returns: The portion of the original box value that was replaced.
```

--------------------------------

TITLE: Manage Box References in Algorand TypeScript
DESCRIPTION: Illustrates creating a box reference with a specified key and writing the sender's address to it. This function demonstrates dynamic box creation and data writing.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: Algorand TypeScript
CODE:
```
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
```

--------------------------------

TITLE: Delete Algorand Boxes (Python)
DESCRIPTION: Provides Python implementations for deleting boxes, map entries, and box references in Algorand smart contracts. It utilizes the `del` keyword on box values or specific map keys, and the `delete()` method for box references. Includes assertions to confirm box states.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: python
CODE:
```
@arc4.abimethod
def delete_box(self) -> None:
    del self.box_int.value
    del self.box_dynamic_bytes.value
    del self.box_string.value
    assert self.box_int.get(default=UInt64(42)) == 42
    assert (
        self.box_dynamic_bytes.get(default=arc4.DynamicBytes(b"42")).native == b"42"
    )
    assert self.box_string.get(default=arc4.String("42")) == "42"

@arc4.abimethod
def delete_box_map(self, key: UInt64) -> None:
    del self.box_map[key]

@arc4.abimethod
def delete_box_ref(self) -> None:
    box_ref = BoxRef(key=String("blob"))
    self.box_ref.create(size=UInt64(32))
    assert self.box_ref, "has data"
    self.box_ref.delete()
    value, exists = box_ref.maybe()
    assert not exists
    assert value == b"";
```

--------------------------------

TITLE: BoxMap Type Alias Documentation
DESCRIPTION: Documentation for the BoxMap type alias, which acts as a proxy for managing key-value data structures. It includes methods for interacting with keyed boxes.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/index/type-aliases/boxmap

LANGUAGE: APIDOC
CODE:
```
BoxMap<TKey, TValue>
  A BoxMap proxy

  Type Parameters:
  • TKey: The type of the value used to key each box.
  • TValue: The type of the data stored in the box.

  Type declaration:
  keyPrefix: readonly bytes
    Get the bytes used to prefix each key

  delete(key: TKey): boolean
    Delete the box associated with a specific key
    Parameters:
      key: The key of the box to delete (TKey)
    Returns:
      boolean: True if the box existed and was deleted, else false

  get(key: TKey): TValue
    Get the value of a keyed box, error if the box does not exist
    Parameters:
      key: The key of the box to retrieve (TKey)
    Returns:
      TValue: The value

  get(key: TKey, options: { default: TValue }): TValue
    Get the value of a keyed box, or return options.default if the box does not exist
    Parameters:
      key: The key of the box to retrieve (TKey)
      options.default: The default value to be returned if no other value exists (TValue)
    Returns:
      TValue: The value if the box exists, else the default value

  has(key: TKey): boolean
    Returns a boolean indicating if a box associated with the specified key exists
    Parameters:
      key: The key of the box to check (TKey)
    Returns:
      boolean: True if the box exists, else false

  length(key: TKey): uint64
    Get the length of a keyed box, or error if the box does not exist
    Parameters:
      key: The key of the box to check (TKey)
    Returns:
      uint64: The length of the box

  maybe(key: TKey): [TValue | undefined, boolean]
    Get the value of a keyed box if available, and a boolean indicating if the box exists.
    If the box does not exist, the value returned at position 0 should not be relied on to have a valid value.
    Parameters:
      key: The key of the box to retrieve (TKey)
    Returns:
      [TValue | undefined, boolean]: A tuple containing the value (or undefined) and a boolean indicating existence.
```

--------------------------------

TITLE: Algorand Box Storage: Extracting and Manipulating BoxRef (TypeScript)
DESCRIPTION: Demonstrates TypeScript code for advanced BoxRef manipulation on Algorand. This includes creating a box, replacing and splicing data within it, and extracting specific parts to verify content.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: TypeScript
CODE:
```
/**
* Extracts a value from the boxRef box
* @param key The key to extract from
*/

// Assuming this is part of a contract class
// public extractBoxRef(key: string): void {
//     const senderBytes = Txn.sender.bytes
//     const appAddress = Global.currentApplicationAddress.bytes
//     const totalSize = Uint64(appAddress.length + senderBytes.length)
//     const boxRef = BoxRef({ key })
//     assert(boxRef.create({ size: totalSize }), 'boxRef creation failed')
//     boxRef.replace(0, senderBytes)
//     boxRef.splice(0, 0, appAddress)
//     const part1 = boxRef.extract(0, 32)
//     const part2 = boxRef.extract(32, 32)
//     assert(part1.equals(appAddress), 'First part should match app address')
//     assert(part2.equals(senderBytes), 'Second part should match sender bytes')
// }

```

--------------------------------

TITLE: algopy.op.Box Class Methods
DESCRIPTION: Provides static methods for managing boxes, a key-value storage mechanism in Algorand smart contracts. These operations include creating, deleting, getting, putting, resizing, and extracting data from boxes.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopyop

LANGUAGE: APIDOC
CODE:
```
algopy.op.Box:

- static create(key, value, **kwargs): Creates a new box with the given key and value.
- static delete(key, **kwargs): Deletes a box associated with the given key.
- static extract(key, **kwargs): Extracts data from a box.
- static get(key, **kwargs): Retrieves the value of a box for the given key.
- static length(key, **kwargs): Returns the size of a box.
- static put(key, value, **kwargs): Stores or updates a box with the given key and value.
- static replace(key, value, **kwargs): Replaces the content of an existing box.
- static resize(key, new_size, **kwargs): Resizes an existing box.
- static splice(key, offset, length, value, **kwargs): Replaces a portion of a box's value with new data.
```

--------------------------------

TITLE: algopy.op.Box Class Methods
DESCRIPTION: Provides static methods for managing boxes, a key-value storage mechanism in Algorand smart contracts. These operations include creating, deleting, getting, putting, resizing, and extracting data from boxes.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy-op

LANGUAGE: APIDOC
CODE:
```
algopy.op.Box:

- static create(key, value, **kwargs): Creates a new box with the given key and value.
- static delete(key, **kwargs): Deletes a box associated with the given key.
- static extract(key, **kwargs): Extracts data from a box.
- static get(key, **kwargs): Retrieves the value of a box for the given key.
- static length(key, **kwargs): Returns the size of a box.
- static put(key, value, **kwargs): Stores or updates a box with the given key and value.
- static replace(key, value, **kwargs): Replaces the content of an existing box.
- static resize(key, new_size, **kwargs): Resizes an existing box.
- static splice(key, offset, length, value, **kwargs): Replaces a portion of a box's value with new data.
```

--------------------------------

TITLE: algopy.Box API
DESCRIPTION: Documentation for the Box class, representing a key-value storage box. Includes methods for getting and accessing box data.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
class algopy.Box:
  """Represents a key-value storage box."""

  __bool__():
    """Checks if the box contains data."""

  get(key):
    """Retrieves a value from the box using a key."""

  property key:
    """The key of the box."""

  property length:
    """The length of the box value."""

  maybe():
    """Returns the box value if present, otherwise None."""

  property value:
    """The value stored in the box."""
```

--------------------------------

TITLE: Algorand Box Array Structure Example
DESCRIPTION: Illustrates the structure of the box array used in Algorand app call transactions to specify which boxes an application will access. Each entry is a pair of app index and box key name.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: APIDOC
CODE:
```
boxes=[[0, "BoxA"],[0,"BoxB"], [0,""],[0,""]]
```

--------------------------------

TITLE: Store and Retrieve Box Data with algopy.op.Box
DESCRIPTION: Illustrates using `algopy.op.Box.put` to store data and `algopy.op.Box.get` to retrieve it within a smart contract. This opcode group facilitates persistent key-value storage associated with smart contracts. It requires a key and value for storage and returns the retrieved value and existence status.

SOURCE: https://dev.algorand.co/algokit/unit-testing/python/opcodes

LANGUAGE: python
CODE:
```
from algopy import op

class BoxStorageContract(algopy.ARC4Contract):

    @algopy.arc4.abimethod
    def store_and_retrieve(self, key: algopy.Bytes, value: algopy.Bytes) -> algopy.Bytes:
        op.Box.put(key, value)
        retrieved_value, exists = op.Box.get(key)
        assert exists
        return retrieved_value

# ... # setup context (below assumes available under 'ctx' variable)
contract = BoxStorageContract()
key, value = algopy.Bytes(b"test_key"), algopy.Bytes(b"test_value")

result = contract.store_and_retrieve(key, value)

assert result == value

stored_value = context.ledger.get_box(contract, key)

assert stored_value == value.value
```

--------------------------------

TITLE: Algorand Box Storage: Extracting and Manipulating BoxRef (Python)
DESCRIPTION: Provides Python code for manipulating Algorand's BoxRef, similar to the TypeScript example. It covers creating a box, replacing and splicing data, and extracting combined parts to assert their correctness.

SOURCE: https://dev.algorand.co/concepts/smart-contracts/storage/box

LANGUAGE: Python
CODE:
```
from algosdk.abi import UInt64, String, Bytes
from algosdk.abi.box import BoxRef
from algosdk.abi.transaction import Txn, Global

# Assuming 'self' is an instance of a contract

# @arc4.abimethod
# def extract_box_ref(self) -> None:
#     box_ref = BoxRef(key=String("blob"))
#     assert box_ref.create(size=32)
#     sender_bytes = Txn.sender.bytes
#     app_address = Global.current_application_address.bytes
#     value_3 = Bytes(b"hello")
#     box_ref.replace(0, sender_bytes)
#     box_ref.splice(0, 0, app_address)
#     box_ref.replace(64, value_3)
#     prefix = box_ref.extract(0, 32 * 2 + value_3.length)
#     assert prefix == app_address + sender_bytes + value_3

```

--------------------------------

TITLE: Algorand SDK: KeyregTxn Methods
DESCRIPTION: Details the methods available for key registration transactions in the Algorand SDK. This includes initialization, equality checks, string representation, hashing, creating from index, retrieving transaction IDs, and signing operations.

SOURCE: https://dev.algorand.co/reference/algokit-utils-py/api-reference/algosdk/algosdktransaction

LANGUAGE: APIDOC
CODE:
```
class algosdk.transaction.KeyregTxn:
  __eq__(self, other):
    Compares two KeyregTxn objects for equality.
  __str__(self):
    Returns a string representation of the KeyregTxn object.
  static as_hash(txn):
    Calculates a hash for the given transaction.
  static creatable_index(txn):
    Retrieves the index of a creatable transaction.
  get_txid(self):
    Gets the transaction ID.
  raw_sign(self, private_key):
    Signs the transaction with a private key without broadcasting.
  sign(self, private_key):
    Signs the transaction with a private key and returns the signed transaction.
```

--------------------------------

TITLE: acctTotalBoxBytes: Get Total Box Bytes Used by Account
DESCRIPTION: Returns the total number of bytes used by this account's app's box keys and values. Requires a minimum AVM version of 8.

SOURCE: https://dev.algorand.co/reference/algorand-typescript/api-reference/op/variables/acctparams

LANGUAGE: APIDOC
CODE:
```
acctTotalBoxBytes()
  - Returns the total number of bytes used by this account’s app’s box keys and values.
  - Min AVM version: 8
  - Parameters:
    - a: uint64 | Account - The account identifier.
  - Returns: uint64 | boolean - The total bytes used or false.
```

--------------------------------

TITLE: Manage Algorand Boxes
DESCRIPTION: Shows how to implement and interact with Algorand Boxes, including single boxes and `BoxMap` for key-value storage. It covers setting, getting, and checking the existence of boxes within the testing framework.

SOURCE: https://dev.algorand.co/algokit/unit-testing/typescript/state-management

LANGUAGE: TypeScript
CODE:
```
class MyContract extends algots.arc4.Contract {

box: algots.Box<algots.uint64> | undefined;

boxMap = algots.BoxMap<algots.bytes, algots.uint64>({ keyPrefix: 'boxMap' });

@algots.arc4.abimethod()

someMethod(keyA: algots.bytes, keyB: algots.bytes, keyC: algots.bytes) {

this.box = algots.Box<algots.uint64>({ key: keyA });

this.box.value = algots.Uint64(1);

this.boxMap.set(keyB, algots.Uint64(1));

this.boxMap.set(keyC, algots.Uint64(2));

}

}

// In your test

const contract = ctx.contract.create(MyContract);

const keyA = algots.Bytes('keyA');

const keyB = algots.Bytes('keyB');

const keyC = algots.Bytes('keyC');

contract.someMethod(keyA, keyB, keyC);

// Access boxes

const boxContent = ctx.ledger.getBox(contract, keyA);

expect(ctx.ledger.boxExists(contract, keyA)).toBe(true);

// Set box content manually

ctx.ledger.setBox(contract, keyA, algots.op.itob(algots.Uint64(1)));
```

--------------------------------

TITLE: Master Contract Storage
DESCRIPTION: Defines the box storage keys used by the Master smart contract.

SOURCE: https://dev.algorand.co/arc-standards/arc-0012

LANGUAGE: APIDOC
CODE:
```
Box Storage:
  - Key: Account (Type: address)
  - Value: Application ID (Type: uint64) - The vault application ID for the given account.
```

--------------------------------

TITLE: getBoxReference Function
DESCRIPTION: Provides a reference for an Algorand box, accepting either a `BoxIdentifier` or an existing `BoxReference`. This function is deprecated and users should use `AppManager.getBoxReference()` instead.

SOURCE: https://dev.algorand.co/reference/algokit-utils-ts/api-reference/functions/getboxreference

LANGUAGE: APIDOC
CODE:
```
getBoxReference(box): algosdk.BoxReference
  Description: Returns a algosdk.BoxReference given a BoxIdentifier or BoxReference.
  Deprecated: Use AppManager.getBoxReference() instead.
  Defined in: src/app.ts:389

  Parameters:
    box (BoxReference | BoxIdentifier | BoxReference): The box to return a reference for

  Returns:
    algosdk.BoxReference: The box reference ready to pass into a Transaction
```

--------------------------------

TITLE: Perform Rekey-to Transaction
DESCRIPTION: Executes a `goal clerk send` transaction to change the authorized spending key for an account. This command sets the 'rekey-to' parameter to a new address.

SOURCE: https://dev.algorand.co/concepts/accounts/rekeying

LANGUAGE: shell
CODE:
```
goal clerk send --from $ADDR_A --to $ADDR_A --amount 0 --rekey-to $ADDR_B
```

--------------------------------

TITLE: Algopy BoxRef Class Documentation
DESCRIPTION: Documentation for the BoxRef class, which abstracts the reading and writing of boxes containing raw binary data. It covers initialization, properties like key and length, and methods for managing box state and content.

SOURCE: https://dev.algorand.co/reference/algorand-python/api-reference/algopy

LANGUAGE: APIDOC
CODE:
```
class algopy.BoxRef
  BoxRef(/, *, key: bytes | str | algopy.Bytes | algopy.String = …)
    BoxRef abstracts the reading and writing of boxes containing raw binary data. The size is configured manually, and can be set to values larger than what the AVM can handle in a single value.

  __bool__() → bool
    Returns True if the box has a value set, regardless of the truthiness of that value.

  create(*, size: [algopy.UInt64](#algopy.UInt64) | int) → bool
    Creates a box with the specified size, setting all bits to zero. Fails if the box already exists with a different size. Fails if the specified size is greater than the max box size (32,768).
    Returns True if the box was created, False if the box already existed.

  delete() → bool
    Deletes the box if it exists and returns a value indicating if the box existed.

  extract(start_index: [algopy.UInt64](#algopy.UInt64) | int, length: [algopy.UInt64](#algopy.UInt64) | int) → [algopy.Bytes](#algopy.Bytes)
    Extract a slice of bytes from the box.
    Fails if the box does not exist, or if `start_index + length > len(box)`.
    :arg start_index: The offset to start extracting bytes from.
    :arg length: The number of bytes to extract.

  get(*, default: [algopy.Bytes](#algopy.Bytes) | bytes) → [algopy.Bytes](#algopy.Bytes)
    Retrieve the contents of the box, or return the default value if the box has not been created.
    :arg default: The default value to return if the box has not been created.

  key *: [algopy.Bytes](#algopy.Bytes)*
    Provides access to the raw storage key.

  length *: [algopy.UInt64](#algopy.UInt64)*
    Get the length of this Box. Fails if the box does not exist.

  maybe() → tuple[[algopy.Bytes](#algopy.Bytes), bool]
    Retrieve the contents of the box if it exists, and return a boolean indicating if the box exists.

  put(value: [algopy.Bytes](#algopy.Bytes) | bytes) → None
    Replaces the contents of box with value. Fails if box exists and len(box) != len(value). Creates box if it does not exist.
    :arg value: The value to write to the box.

  replace(start_index: [algopy.UInt64](#algopy.UInt64) | int, value: [algopy.Bytes](#algopy.Bytes) | bytes) → None
    Write `value` to the box starting at `start_index`. Fails if the box does not exist, or if `start_index + len(value) > len(box)`.
    :arg start_index: The offset to start writing bytes from.
    :arg value: The bytes to be written.

  resize(new_size: [algopy.UInt64](#algopy.UInt64) | int) → None
    Resizes the box the specified `new_size`. Truncating existing data if the new value is shorter or padding with zero bytes if it is longer.
    :arg new_size: The new size of the box.

  splice(start_index: [algopy.UInt64](#algopy.UInt64) | int, length: [algopy.UInt64](#algopy.UInt64) | int, value: [algopy.Bytes](#algopy.Bytes) | bytes) → None
    set box to contain its previous bytes up to index `start_index`, followed by `bytes`, followed by the original bytes of the box that began at index `start_index + length`.
    Important: This op does not resize the box.
    If the new value is longer than the box size, it will be truncated.
    If the new value is shorter than the box size, it will be padded with zero bytes.
    :arg start_index: The index to start inserting `value`.
    :arg length: The number of bytes after `start_index` to omit from the new value.
    :arg value: The `value` to be inserted.
```