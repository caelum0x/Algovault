Best Practices
Use Static Types: Always define explicit types for arrays, tuples, and objects to leverage TypeScript’s static typing benefits.
Prefer UInt<64>: Utilize UInt<64> for numeric operations to align with AVM’s native types, enhancing performance and compatibility.
Use the StaticArray generic type to define static arrays and avoid specifying array lengths using square brackets (e.g., number[10]) as it is not valid TypeScript syntax in this context.
Limit Dynamic Arrays: Avoid excessive use of dynamic arrays, especially nested ones, to prevent inefficiencies. Also, splice is rather heavy in terms of opcode cost so it should be used sparringly.
Immutable Data Structures: Use immutable patterns for arrays and objects. Instead of mutating arrays directly, create new arrays with the desired changes (e.g., myArray = [...myArray, newValue]).
Efficient Iteration: Use for...of loops for iterating over arrays, which also enables continue/break functionality.
Type Casting: Use constructors (e.g., UintN8, UintN<64>) rather than as keyword for type casting.