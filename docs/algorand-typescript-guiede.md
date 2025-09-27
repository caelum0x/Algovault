Program Structure
An Algorand TypeScript program is declared in a TypeScript module with a file extension of .algo.ts. Declarations can be split across multiple files, and types can be imported between these files using standard TypeScript import statements. The commonjs require function is not supported, and the asynchronous import(...) expression is also not supported as imports must be compile-time constant.

Algorand TypeScript constructs and types can be imported from the @algorandfoundation/algorand-typescript module, or one of its submodules. Compilation artifacts do not need to be exported unless you require them in another module; any non-abstract contract or logic signature discovered in your entry files will be output. Contracts and logic signatures discovered in non-entry files will not be output.

Constants
Constants declared at the module level have a compile-time constant value or a template variable. Some basic expressions are supported so long as they result in a compile time constant.

import { uint64 } from '@algorandfoundation/algorand-typescript'

const a: uint64 = 1000
const b: uint64 = 2000
const c: uint64 = a * b
Copy
Free Subroutines
Free subroutines can be declared at the module level and called from any contract, logic signature, or other subroutine. Subroutines do not have any compiler output on their own unless they are called by a contract or logic signature.

import { uint64 } from '@algorandfoundation/algorand-typescript'

function add(a: uint64, b: uint64): uint64 {
  return a + b
}
Copy
Contracts
A contract in Algorand TypeScript is defined by declaring a class which extends the Contract, or BaseContract types exported by @algorandfoundation/algorand-typescript. See ABI routing docs for more on the differences between these two options.

ARC4 Contract
Contracts which extend the Contract type are ARC4 compatible contracts. Any public methods on the class will be exposed as ABI methods, callable from other contracts and off-chain clients. private and protected methods can only be called from within the contract itself, or its subclasses. Note that TypeScript methods are public by default if no access modifier is present. A contract is considered valid even if it has no methods, though its utility is questionable.

import { Contract } from '@algorandfoundation/algorand-typescript'

class DoNothingContract extends Contract {}

class HelloWorldContract extends Contract {
  sayHello(name: string) {
    return `Hello ${name}`
  }
}
Copy
Contract Options
The contract decorator allows you to specify additional options and configuration for a contract such as which AVM version it targets, which scratch slots it makes use of, or the total global and local state which should be reserved for it. It should be placed on your contract class declaration.

import { Contract, contract } from '@algorandfoundation/algorand-typescript'

@contract({ name: 'My Contracts Name', avmVersion: 11, scratchSlots: [1, 2, 3], stateTotals: { globalUints: 4, localUints: 0 } })
class MyContract extends Contract {}
Copy
Application Lifecycle Methods and other method options
There are two approaches to handling application lifecycle events. By implementing a well-known method (convention based), or by using decorators (decorator based). It is also possible to use a combination of the two however decorators must not conflict with the implied behaviour of a well-known method.

Convention based
Application lifecycle methods can be handled by a convention of well-known method names. The easiest way to discover these method names is to implement the interface ConventionalRouting from the @algorandfoundation/algorand-typescript/arc4 module.

Explicit implementation of this interface is not required, but it will assist in auto complete suggestions for supported methods.
Only implement the methods your application should support. I.e. don't implement updateApplication if your application should not be updatable.
'Well-known' methods can receive arguments and return values
import type { bytes, uint64 } from '@algorandfoundation/algorand-typescript'
import { Contract, log } from '@algorandfoundation/algorand-typescript'
import type { ConventionalRouting } from '@algorandfoundation/algorand-typescript/arc4'

export class TealScriptConventionsAlgo extends Contract implements ConventionalRouting {
  /**
   * The function to invoke when closing out of this application
   */
  closeOutOfApplication(arg: uint64) {
    return arg
  }

  /**
   * The function to invoke when creating this application
   */
  createApplication(value: bytes) {
    log(value)
  }

  /**
   * The function to invoke when deleting this application
   */
  deleteApplication() {}

  /**
   * The function to invoke when opting in to this application
   */
  optInToApplication() {}

  /**
   * The function to invoke when updating this application
   */
  updateApplication() {}

  /**
   * Any public method that is not one of the 'well-known' names exhibit the default behaviour detailed in
   * the next section.
   */
  customMethod() {}
}
Copy
Decorator based
The default OnCompletionAction (OCA) for public methods is NoOp. To change this, a method should be decorated with the abimethod or baremethod decorators. These decorators can also be used to change the exported name of the method, determine if a method should be available on application create or not, and specify default values for arguments. See the ABI Routing guide for more details on how these various options work together.

import type { uint64 } from '@algorandfoundation/algorand-typescript'
import { abimethod, baremethod, Contract, Uint64 } from '@algorandfoundation/algorand-typescript'

class AbiDecorators extends Contract {
  @abimethod({ allowActions: 'NoOp' })
  public justNoop(): void {}

  @abimethod({ onCreate: 'require' })
  public createMethod(): void {}

  @abimethod({ allowActions: ['NoOp', 'OptIn', 'CloseOut', 'DeleteApplication', 'UpdateApplication'] })
  public allActions(): void {}

  @abimethod({ readonly: true, name: 'overrideReadonlyName' })
  public readonly(): uint64 {
    return 5
  }

  @baremethod()
  public noopBare() {}
}
Copy
Constructor logic and implicit create method
If a contract does not define an explicit create method (ie. onCreate: 'allow' or onCreate: 'require') then the compiler will attempt to add a bare create method with no implementation. Without this, you would not be able to deploy the contract.

Contracts which define custom constructor logic will have this logic executed once on application create immediately before any other logic is executed.

export class MyContract extends Contract {
  constructor() {
    super()
    log('This is executed on create only')
  }
}
Copy
Custom approval and clear state programs
The default implementation of a clear state program on a contract is to just return true, custom logic can be added by overriding the base implementation

The default implementation of an approval program on a contract is to perform ABI routing. Custom logic can be added by overriding the base implementation. If your implementation does not call super.approvalProgram() at some point, ABI routing will not function.

class Arc4HybridAlgo extends Contract {
  override approvalProgram(): boolean {
    log('before')
    const result = super.approvalProgram()
    log('after')
    return result
  }

  override clearStateProgram(): boolean {
    log('clearing state')
    return true
  }

  someMethod() {
    log('some method')
  }
}
Copy
Application State
Application state for a contract can be defined by declaring instance properties on a contract class using the relevant state proxy type. In the case of GlobalState it is possible to define an initialValue for the field. The logic to set this initial value will be injected into the contract's constructor. Global and local state keys default to the property name, but can be overridden with the key option. Box proxies always require an explicit key.

import { Contract, uint64, bytes, GlobalState, LocalState, Box } from '@algorandfoundation/algorand-typescript'

export class ContractWithState extends Contract {
  globalState = GlobalState<uint64>({ initialValue: 123, key: 'customKey' })
  localState = LocalState<string>()
  boxState = Box<bytes>({ key: 'boxKey' })
}
Copy
Custom approval and clear state programs
Contracts can optional override the default implementation of the approval and clear state programs. This covers some more advanced scenarios where you might need to perform logic before or after an ABI method; or perform custom method routing entirely. In the case of the approval program, calling super.approvalProgram() will perform the default behaviour of ARC4 routing. Note that the 'Clear State' action will be taken regardless of the outcome of the clearStateProgram, so care should be taken to ensure any clean up actions required are done in a way which cannot fail.

import { Contract, log } from '@algorandfoundation/algorand-typescript'

class Arc4HybridAlgo extends Contract {
  override approvalProgram(): boolean {
    log('before')
    const result = super.approvalProgram()
    log('after')
    return result
  }

  override clearStateProgram(): boolean {
    log('clearing state')
    return true
  }

  someMethod() {
    log('some method')
  }
}
Copy
Multi-inheritance
Javascript does not support multi-inheritance natively, but it is a useful feature for composing a larger contract out of several smaller ones. Algorand TypeScript supports multi-inheritance via the Polytype package and the compiled code matches the semantics of Polytype at runtime. Method resolution order is depth first meaning the entire prototype hierarchy of the first base type will be walked before moving onto the second base type and so on.

import type { uint64 } from '@algorandfoundation/algorand-typescript'
import { Contract, GlobalState } from '@algorandfoundation/algorand-typescript'
import { classes } from 'polytype'

class StoreString extends Contract {
  stringStore = GlobalState<string>()

  setStore(value: string) {
    this.stringStore.value = value
  }
}

class StoreUint64 extends Contract {
  uint64Store = GlobalState<uint64>()

  setStore(value: uint64) {
    this.uint64Store.value = value
  }
}

class StoreBoth extends classes(StoreString, StoreUint64) {
  test(theString: string, theUint: uint64) {
    // setStore resolved from first base type
    this.setStore(theString)

    // Can explicitly resolve from other base type with .class
    super.class(StoreUint64).setStore(theUint)
  }
}
Copy
Whilst method names can overlap between base types (and resolved as above), properties (Local and Global State + Boxes) must be unique, and will result in a compile error if they are redefined.

BaseContract
If ARC4 routing and/or interoperability is not required, a contract can extend the BaseContract type which gives full control to the developer to implement the approval and clear state programs. If this type is extended directly it will not be possible to output ARC-32 or ARC-56 app spec files and related artifacts. Transaction arguments will also need to be decoded manually.

import { BaseContract, log, op } from '@algorandfoundation/algorand-typescript'

class DoNothingContract extends BaseContract {
  public approvalProgram(): boolean {
    return true
  }
  public clearStateProgram(): boolean {
    return true
  }
}
class HelloWorldContract extends BaseContract {
  public approvalProgram(): boolean {
    const name = String(op.Txn.applicationArgs(0))
    log(`Hello, ${name}`)
    this.notRouted()
    return true
  }

  public notRouted() {
    log('This method is not public accessible')
  }
}
Copy
Logic Signatures
Logic signatures or smart signatures as they are sometimes referred to are single program constructs which can be used to sign transactions. If the logic defined in the program runs without error, the signature is considered valid - if the program crashes, or returns 0 or false, the signature is not valid and the transaction will be rejected. It is possible to delegate signature privileges for any standard account to a logic signature program such that any transaction signed with the logic signature program will pass on behalf of the delegating account provided the program logic succeeds. This is obviously a dangerous proposition and such a logic signature program should be meticulously designed to avoid abuse. You can read more about logic signatures on Algorand here.

Logic signature programs are stateless, and support a different subset of op codes to smart contracts. The LogicSig class should only ever have a program method, complex signatures can make use of free subroutines to break up logic into smaller chunks.

import { assert, LogicSig, Txn, Uint64 } from '@algorandfoundation/algorand-typescript'

export class AlwaysAllow extends LogicSig {
  program() {
    return true
  }
}

function feeIsZero() {
  assert(Txn.fee === 0, 'Fee must be zero')
}

export class AllowNoFee extends LogicSig {
  program() {
    feeIsZero()
    return Uint64(1)
  }
}
Types
Types in Algorand TypeScript can be divided into two camps, 'native' AVM types where the implementation is opaque, and it is up to the compiler and the AVM how the type is represented in memory; and 'ARC4 Encoded types' where the in memory representation is always a byte array, and the exact format is determined by the ARC4 Spec.

ARC4 defines an Application Binary Interface (ABI) for how data should be passed to and from a smart contract, and represents a sensible standard for how data should be represented at rest (eg. in Box storage or Application State). It is not necessarily the most optimal format for an in memory representation and for data which is being mutated. For this reason we offer both sets of types and a developer can choose the most appropriate one for their usage. As a beginner the native types will feel more natural to use, but it is useful to be aware of the encoded versions when it comes to optimizing your application.

AVM Types
The most basic types on the AVM are uint64 and bytes, representing unsigned 64-bit integers and byte arrays respectively. These are represented by uint64 and bytes in Algorand TypeScript.

There are further "bounded" types supported by the AVM, which are backed by these two simple primitives. For example, biguint represents a variably sized (up to 512-bits), unsigned integer, but is actually backed by a byte[]. This is represented by biguint in Algorand TypeScript.

Uint64
uint64 represents an unsigned 64-bit integer type that will error on both underflow (negative values) and overflows (values larger than 64-bit). It can be declared with a numeric literal and a type annotation of uint64 or by using the Uint64 factory method (think number (type) vs Number (a function for creating numbers))

import { Uint64, uint64 } from '@algorandfoundation/algorand-typescript'

const x: uint64 = 123
demo(x)
// Type annotation is not required when `uint64` can be inferred from usage
demo(456)

function demo(y: uint64) {}
// `Uint64` constructor can be used to define `uint64` values which `number` cannot safely represent
const z = Uint64(2n ** 54n)

// No arg (returns 0), similar to Number()
demo(Uint64())
// Create from string representation (must be a string literal)
demo(Uint64('123456'))
// Create from a boolean
demo(Uint64(true))
// Create from a numeric expression
demo(Uint64(34 + 3435))
Copy
Math operations with the uint64 work the same as EcmaScript's number type however due to a hard limitation in TypeScript, it is not possible to control the type of these expressions - they will always be inferred as number. As a result, a type annotation will be required making use of the expression value if the type cannot be inferred from usage.

import { Uint64, uint64 } from '@algorandfoundation/algorand-typescript'

function add(x: uint64, y: uint64): uint64 {
  return x + y // uint64 inferred from function's return type
}
// uint64 inferred from assignment target
const x: uint64 = 123 + add(4, 5)

const a: uint64 = 50

// Error because type of `b` will be inferred as `number`
const b = a * x
// Ok
const c: uint64 = a * x
// Ok
const d = Uint64(a * x)
Copy
BigUint
biguint represents an unsigned integer of up to 512-bit. The leading 0 padding is variable and not guaranteed. Operations made using a biguint are more expensive in terms of opcode budget by an order of magnitude, as such - the biguint type should only be used when dealing with integers which are larger than 64-bit. A biguint can be declared with a bigint literal (A number with an n suffix) and a type annotation of biguint, or by using the BigUint factory method. The same constraints of the uint64 type apply here with regards to required type annotations.

import { BigUint, bigint } from '@algorandfoundation/algorand-typescript'

const x: bigint = 123n
demo(x)
// Type annotation is not required when `bigint` can be inferred from usage
demo(456n)

function demo(y: bigint) {}

// No arg (returns 0), similar to Number()
demo(BigUint())
// Create from string representation (must be a string literal)
demo(BigUint('123456'))
// Create from a boolean
demo(BigUint(true))
// Create from a numeric expression
demo(BigUint(34 + 3435))
Copy
Bytes
bytes represents a variable length sequence of bytes up to a maximum length of 4096. Bytes values can be created from various string encodings using string literals using the Bytes factory function.

import { Bytes } from '@algorandfoundation/algorand-typescript'

const fromUtf8 = Bytes('abc')
const fromHex = Bytes.fromHex('AAFF')
const fromBase32 = Bytes.fromBase32('....')
const fromBase64 = Bytes.fromBase64('....')

const interpolated = Bytes`${fromUtf8}${fromHex}${fromBase32}${fromBase64}`
const concatenated = fromUtf8.concat(fromHex).concat(fromBase32).concat(fromBase64)
Copy
String
string literals and values are supported in Algorand TypeScript however most of the prototype is not implemented. Strings in EcmaScript are implemented using utf-16 characters and achieving semantic compatability for any prototype method which slices or splits strings based on characters would be non-trivial (and opcode expensive) to implement on the AVM with no clear benefit as string manipulation tasks can easily be performed off-chain. Algorand TypeScript APIs which expect a bytes value will often also accept a string value. In these cases, the string will be interpreted as a utf8 encoded value.

const a = 'Hello'
const b = 'world'

const interpolate = `${a} ${b}`
const concat = a + ' ' + b
Copy
Boolean
bool literals and values are supported in Algorand TypeScript. The Boolean factory function can be used to evaluate other values as true or false based on whether the underlying value is truthy or falsey.

import { uint64 } from '@algorandfoundation/algorand-typescript'

const one: uint64 = 1
const zero: uint64 = 0

const trueValues = [true, Boolean(one), Boolean('abc')] as const
const falseValues = [false, Boolean(zero), Boolean('')] as const
Copy
Account, Asset, Application
These types represent the underlying Algorand entity and expose methods and properties for retrieving data associated with that entity. They are created by passing the relevant identifier to the respective factory methods.

import { Application, Asset, Account } from '@algorandfoundation/algorand-typescript'

const app = Application(123n) // Create from application id
const asset = Asset(456n) // Create from asset id
const account = Account('A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE') // Create from account address
const account2 = Account(Bytes.fromHex('07DACB4B6D9ED141B17576BD459AE6421D486DA3D4EF2247C409A396B82EA221')) // Create from account public key bytes
Copy
They can also be used in ABI method parameters where they will be created referencing the relevant foreign_* array on the transaction. See ARC4 reference types

Group Transactions
The group transaction types expose properties and methods for reading attributes of other transactions in the group. They can be created explicitly by calling gtxn.Transaction(n) where n is the index of the desired transaction in the group, or they can be used in ABI method signatures where the ARC4 router will take care of providing the relevant transaction specified by the client. They should not be confused with the itxn namespace which contains types for composing inner transactions

import { gtxn, Contract } from '@algorandfoundation/algorand-typescript'

class Demo extends Contract {
  doThing(payTxn: gtxn.PayTxn): void {
    const assetConfig = gtxn.AssetConfigTxn(1)

    const txn = gtxn.Transaction(i)
    switch (txn.type) {
      case TransactionType.ApplicationCall:
        log(txn.appId.id)
        break
      case TransactionType.AssetTransfer:
        log(txn.xferAsset.id)
        break
      case TransactionType.AssetConfig:
        log(txn.configAsset.id)
        break
      case TransactionType.Payment:
        log(txn.receiver)
        break
      case TransactionType.KeyRegistration:
        log(txn.voteKey)
        break
      default:
        log(txn.freezeAsset.id)
        break
    }
  }
}
Copy
Arrays
Immutable
const myArray: uint64[] = [1, 2, 3]
const myOtherArray = ['a', 'b', 'c']
Copy
Arrays in Algorand TypeScript can be declared using the array literal syntax and are explicitly typed using either the T[] shorthand or Array<T> full name. The type can usually be inferred but uints will require a type hint. Native arrays are currently considered immutable (as if they were declared readonly T[]) as the AVM offers limited resources for storing mutable reference types in a heap. "Mutations" can be done using the pure methods available on the Array prototype.

let myArray: uint64[] = [1, 2, 3]

// Instead of .push
myArray = [...myArray, 4]

// Instead of index assignment
myArray = myArray.with(2, 3)
Copy
Similar to other supported native types, much of the full prototype of Array is not supported but this coverage may expand over time.

Mutable
import { MutableArray, uint64 } from '@algorandfoundation/algorand-typescript'

const myMutable = new MutableArray<uint64>()
myMutable.push(1)
addToArray(myMutable)
assert(myMutable.pop() === 4)

function addToArray(x: MutableArray<uint64>) {
  x.push(4)
}
Copy
Mutable arrays can be declared using the MutableArray type. This type makes use of scratch space as a heap in order to provide an array type with 'pass by reference' semantics. It is currently limited to fixed size item types.

Tuples
import { Uint64, Bytes } from '@algorandfoundation/algorand-typescript'

const myTuple = [Uint64(1), 'test', false] as const

const myOtherTuple: [string, bytes] = ['hello', Bytes('World')]
const myOtherTuple2: readonly [string, bytes] = ['hello', Bytes('World')]
Copy
Tuples can be declared by appending the as const keywords to an array literal expression, or by adding an explicit type annotation. Tuples are considered immutable regardless of how they are declared meaning readonly [T1, T2] is equivalent to [T1, T2]. Including the readonly keyword will improve intellisense and TypeScript IDE feedback at the expense of verbosity.

Objects
import { Uint64, Bytes, uint64 } from '@algorandfoundation/algorand-typescript'

type NamedObj = { x: uint64; y: uint64 }

const myObj = { a: Uint64(123), b: Bytes('test'), c: false }

function test(obj: NamedObj): uint64 {
  return (obj.x = obj.y)
}
Copy
Object types and literals are treated as named tuples. The types themselves can be declared with a name using a type NAME = { ... } expression, or anonymously using an inline type annotation let x: { a: boolean } = { ... }. If no type annotation is present, the type will be inferred from the assigned values. Object types are immutable and are treated as if they were declared with the Readonly helper type. i.e. { a: boolean } is equivalent to Readonly<{ a: boolean }>. An object's property can be updated using a spread expression.

import { Uint64 } from '@algorandfoundation/algorand-typescript'

let obj = { first: 'John', last: 'Doh' }
obj = { ...obj, first: 'Jane' }
Copy
ARC4 Encoded Types
ARC4 encoded types live in the /arc4 module

Where supported, the native equivalent of an ARC4 type can be obtained via the .native property. It is possible to use native types in an ABI method and the router will automatically encode and decode these types to their ARC4 equivalent.

Booleans
Type: @algorandfoundation/algorand-typescript/arc4::Bool
Encoding: A single byte where the most significant bit is 1 for True and 0 for False
Native equivalent: bool

Unsigned ints
Types: @algorandfoundation/algorand-typescript/arc4::UIntN
Encoding: A big endian byte array of N bits
Native equivalent: uint64 or biguint

Common bit sizes have also been aliased under @algorandfoundation/algorand-typescript/arc4::UInt8, @algorandfoundation/algorand-typescript/arc4::UInt16 etc. A uint of any size between 8 and 512 bits (in intervals of 8bits) can be created using a generic parameter. Byte is an alias of UintN<8>

Unsigned fixed point decimals
Types: @algorandfoundation/algorand-typescript/arc4::UFixedNxM
Encoding: A big endian byte array of N bits where encoded_value = value / (10^M)
Native equivalent: none

Bytes and strings
Types: @algorandfoundation/algorand-typescript/arc4::DynamicBytes and @algorandfoundation/algorand-typescript/arc4::Str
Encoding: A variable length byte array prefixed with a 16-bit big endian header indicating the length of the data
Native equivalent: bytes and string

Strings are assumed to be utf-8 encoded and the length of a string is the total number of bytes, not the total number of characters.

StaticBytes
Types: @algorandfoundation/algorand-typescript/arc4::StaticBytes
Encoding: A fixed length byte array
Native equivalent: bytes

Like DynamicBytes but the length header can be omitted as the data is assumed to be of the specified length.

Static arrays
Type: @algorandfoundation/algorand-typescript/arc4::StaticArray
Encoding: See ARC4 Container Packing
Native equivalent: none

An ARC4 StaticArray is an array of a fixed size. The item type is specified by the first generic parameter and the size is specified by the second.

Address
Type: @algorandfoundation/algorand-typescript/arc4::Address
Encoding: A byte array 32 bytes long
Native equivalent: Account

Address represents an Algorand address' public key, and can be used instead of Account when needing to reference an address in an ARC4 struct, tuple or return type. It is a subclass of StaticArray<Byte, 32>

Dynamic arrays
Type: @algorandfoundation/algorand-typescript/arc4::DynamicArray
Encoding: See ARC4 Container Packing
Native equivalent: none

An ARC4 DynamicArray is an array of a variable size. The item type is specified by the first generic parameter. Items can be added and removed via .pop, .append, and .extend.

The current length of the array is encoded in a 16-bit prefix similar to the arc4.DynamicBytes and arc4.String types

Tuples
Type: @algorandfoundation/algorand-typescript/arc4::Tuple
Encoding: See ARC4 Container Packing
Native equivalent: TypeScript tuple

ARC4 Tuples are immutable statically sized arrays of mixed item types. Item types can be specified via generic parameters or inferred from constructor parameters.

Structs
Type: @algorandfoundation/algorand-typescript/arc4::Struct
Encoding: See ARC4 Container Packing
Native equivalent: None

ARC4 Structs are named tuples. Items can be accessed via names instead of indexes. They are also mutable

ARC4 Container Packing
ARC4 encoding rules are detailed explicitly in the ARC. A summary is included here.

Containers are composed of a head and a tail portion, with a possible length prefix if the container length is dynamic.

[Length (2 bytes)][Head bytes][Tail bytes]
                  ^ Offsets are from the start of the head bytes
Copy
Fixed length items (eg. bool, uintn, byte, or a static array of a fixed length item) are inserted directly into the head
Variable length items (eg. bytes, string, dynamic array, or even a static array of a variable length item) are inserted into the tail. The head will include a 16-bit number representing the offset of the tail data, the offset is the total number of bytes in the head + the number of bytes preceding the tail data for this item (ie. the tail bytes of any previous items)
Consecutive boolean values are packed into CEIL(N / 8) bytes where each bit will represent a single boolean value (big endian)
Storage
Algorand smart contracts have three different types of on-chain storage they can utilise: Global storage, Local storage, and Box Storage. They also have access to a transient form of storage in Scratch space.

Global storage
Global or Application storage is a key/value store of bytes or uint64 values stored against a smart contract application. The number of values used must be declared when the application is first created and will affect the minimum balance requirement for the application. For ARC4 contracts this information is captured in the ARC32 and ARC56 specification files and automatically included in deployments.

Global storage values are declared using the GlobalState function to create a GlobalState proxy object.

import { GlobalState, Contract, uint64, bytes, Uint64, contract } from '@algorandfoundation/algorand-typescript'

class DemoContract extends Contract {
  // The property name 'globalInt' will be used as the key
  globalInt = GlobalState<uint64>({ initialValue: Uint64(1) })
  // Explicitly override the key
  globalBytes = GlobalState<bytes>({ key: 'alternativeKey' })
}

// If using dynamic keys, state must be explicitly reserved
@contract({ stateTotals: { globalBytes: 5 } })
class DynamicAccessContract extends Contract {
  test(key: string, value: string) {
    // Interact with state using a dynamic key
    const dynamicAccess = GlobalState<string>({ key })
    dynamicAccess.value = value
  }
}
Copy
Local storage
Local or Account storage is a key/value store of bytes or uint64 stored against a smart contract application and a single account which has opted into that contract. The number of values used must be declared when the application is first created and will affect the minimum balance requirement of an account which opts in to the contract. For ARC4 contracts this information is captured in the ARC32 and ARC56 specification files and automatically included in deployments.

import type { bytes, uint64 } from '@algorandfoundation/algorand-typescript'
import { abimethod, Contract, LocalState, Txn } from '@algorandfoundation/algorand-typescript'
import type { StaticArray, UintN } from '@algorandfoundation/algorand-typescript/arc4'

type SampleArray = StaticArray<UintN<64>, 10>

export class LocalStateDemo extends Contract {
  localUint = LocalState<uint64>({ key: 'l1' })
  localUint2 = LocalState<uint64>()
  localBytes = LocalState<bytes>({ key: 'b1' })
  localBytes2 = LocalState<bytes>()
  localEncoded = LocalState<SampleArray>()

  @abimethod({ allowActions: 'OptIn' })
  optIn() {}

  public setState({ a, b }: { a: uint64; b: bytes }, c: SampleArray) {
    this.localUint(Txn.sender).value = a
    this.localUint2(Txn.sender).value = a
    this.localBytes(Txn.sender).value = b
    this.localBytes2(Txn.sender).value = b
    this.localEncoded(Txn.sender).value = c.copy()
  }

  public getState() {
    return {
      localUint: this.localUint(Txn.sender).value,
      localUint2: this.localUint2(Txn.sender).value,
      localBytes: this.localBytes(Txn.sender).value,
      localBytes2: this.localBytes2(Txn.sender).value,
      localEncoded: this.localEncoded(Txn.sender).value.copy(),
    }
  }

  public clearState() {
    this.localUint(Txn.sender).delete()
    this.localUint2(Txn.sender).delete()
    this.localBytes(Txn.sender).delete()
    this.localBytes2(Txn.sender).delete()
    this.localEncoded(Txn.sender).delete()
  }
}
Copy
Box storage
We provide 3 different types for accessing box storage: Box, BoxMap, and BoxRef. We also expose raw operations via the AVM ops module.

Before using box storage, be sure to familiarise yourself with the requirements and restrictions of the underlying API.

The Box type provides an abstraction over storing a single value in a single box. A box can be declared as a class field (in which case the key must be a compile time constant); or as a local variable within any subroutine. Box proxy instances can be passed around like any other value.

BoxMap is similar to the Box type, but allows for grouping a set of boxes with a common key and content type. A keyPrefix is specified when the BoxMap is created and the item key can be a Bytes value, or anything that can be converted to Bytes. The final box name is the combination of keyPrefix + key.

BoxRef is a specialised type for interacting with boxes which contain binary data. In addition to being able to set and read the box value, there are operations for extracting and replacing just a portion of the box data which is useful for minimizing the amount of reads and writes required, but also allows you to interact with byte arrays which are longer than the AVM can support (currently 4096).

import type { Account, uint64 } from '@algorandfoundation/algorand-typescript'
import { Box, BoxMap, BoxRef, Contract, Txn, assert } from '@algorandfoundation/algorand-typescript'
import { bzero } from '@algorandfoundation/algorand-typescript/op'

export class BoxContract extends Contract {
  boxOne = Box<string>({ key: 'one' })
  boxMapTwo = BoxMap<Account, uint64>({ keyPrefix: 'two' })
  boxRefThree = BoxRef({ key: 'three' })

  test(): void {
    if (!this.boxOne.exists) {
      this.boxOne.value = 'Hello World'
    }
    this.boxMapTwo(Txn.sender).value = Txn.sender.balance
    const boxForSender = this.boxMapTwo(Txn.sender)
    assert(boxForSender.exists)
    if (this.boxRefThree.exists) {
      this.boxRefThree.resize(8000)
    } else {
      this.boxRefThree.create({ size: 8000 })
    }

    this.boxRefThree.replace(0, bzero(0).bitwiseInvert())
    this.boxRefThree.replace(4000, bzero(0))
  }
}
Copy
Scratch storage
Scratch storage persists for the lifetime of a group transaction and can be used to pass values between multiple calls and/or applications in the same group. Scratch storage for logic signatures is separate from that of the application calls and logic signatures do not have access to the scratch space of other transactions in the group.

Values can be written to scratch space using the Scratch.store(...) method and read from using Scratch.loadUint64(...) or Scratch.loadBytes(...) methods. These all take a scratch slot number between 0 and 255 inclusive and that scratch slot must be explicitly reserved by the contract using the contract options decorator.

import { assert, BaseContract, Bytes, contract } from '@algorandfoundation/algorand-typescript'
import { Scratch } from '@algorandfoundation/algorand-typescript/op'

@contract({ scratchSlots: [0, 1, { from: 10, to: 20 }] })
export class ReserveScratchAlgo extends BaseContract {
  setThings() {
    Scratch.store(0, 1)
    Scratch.store(1, Bytes('hello'))
    Scratch.store(15, 45)
  }

  approvalProgram(): boolean {
    this.setThings()

    assert(Scratch.loadUint64(0) === 1)
    assert(Scratch.loadBytes(1) === Bytes('hello'))
    assert(Scratch.loadUint64(15) === 45)
    return true
  }
}
Copy
Scratch space can be read from group transactions using the gloadUint64 and gloadBytes ops. These ops take the group index of the target transaction, and a scratch slot number.

import { gloadBytes, gloadUint64 } from '@algorandfoundation/algorand-typescript/op'

function test() {
  const b = gloadBytes(0, 1)
  const u = gloadUint64(1, 2)
}
