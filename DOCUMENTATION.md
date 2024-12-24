# Ta5beesScript Documentation

## Table of Contents
- [Introduction](#introduction)
- [Language Features](#language-features)
- [Basic Syntax](#basic-syntax)
- [Variables and Data Types](#variables-and-data-types)
- [Control Flow](#control-flow)
- [Functions](#functions)
- [Error Handling](#error-handling)
- [Built-in Methods](#built-in-methods)
- [Standard Library](#standard-library)
- [Command Line Interface](#command-line-interface)

## Introduction

Ta5beesScript is a modern programming language inspired by JavaScript, designed to provide a more intuitive and expressive coding experience. It combines familiar JavaScript-like syntax with unique features that enhance developer productivity and code readability.

## Language Features

- JavaScript-like syntax with intuitive keywords
- Strong support for asynchronous programming
- Built-in error handling mechanisms
- Comprehensive standard library
- Modern array and string manipulation methods
- DOM manipulation capabilities
- Flexible type system

## Basic Syntax

### Keywords

Ta5beesScript uses Arabic-inspired keywords for core programming concepts:

- `khalli` - Variable declaration (let)
- `thabit` - Constant declaration (const)
- `arrifli` - Function declaration
- `iza` - If statement
- `willa` - Else statement
- `la` - For loop
- `raje3li` - Return statement
- `hawel` - Try block
- `law_sar_ma_sar` - Catch block
- `irmi` - Throw statement
- `kammil` - Continue statement
- `iksir` - Break statement
- `stanna` - Await keyword
- `tazamonan` - Async keyword

### Comments
```javascript
// Single line comment
```

## Variables and Data Types

### Variable Declaration
```javascript
khalli name = "John";    // Mutable variable
thabit age = 25;         // Immutable variable
```

### Data Types
- Numbers (integers and floating-point)
- Strings
- Booleans
- Arrays
- Objects
- Null
- Functions

### Arrays
```javascript
khalli numbers = [1, 2, 3, 4, 5];
khalli fruits = ["apple", "banana", "orange"];
```

### Objects
```javascript
khalli person = {
    name: "John",
    age: 25,
    city: "New York"
};
```

## Control Flow

### If Statements
```javascript
iza (condition) {
    // code
} willa {
    // else code
}
```

### For Loops
```javascript
la (khalli i = 0; i < 10; i = i + 1) {
    // loop body
}
```

### Try-Catch
```javascript
hawel {
    // code that might throw an error
} law_sar_ma_sar (error) {
    // error handling code
}
```

## Functions

### Regular Functions
```javascript
arrifli add(a, b) {
    raje3li a + b;
}
```

### Async Functions
```javascript
tazamonan arrifli getData() {
    khalli response = stanna fetchData();
    raje3li response;
}
```

### Arrow Functions
```javascript
khalli multiply = (a, b) => a * b;
```

## Error Handling

### Throwing Errors
```javascript
iza (invalidCondition) {
    irmi "Invalid operation";
}
```

### Try-Catch Block
```javascript
hawel {
    // risky code
} law_sar_ma_sar (error) {
    gool(error);  // Built-in console.log equivalent
}
```

## Built-in Methods

### Console Output
```javascript
gool("Hello, World!");  // Prints to console
```

### Array Methods
- push
- pop
- filter
- map
- reduce
- forEach
- find
- some
- every
- join

### String Methods
- substring
- toUpperCase
- toLowerCase
- trim
- replace
- includes
- startsWith
- endsWith
- split

### Math Methods
Available through the `Math` object:
- max
- min
- round
- floor
- ceil
- abs
- pow
- sqrt
- random

## Standard Library

### Type Conversion
Available through the `Type` object:
- toString
- toNumber
- toBoolean

### Network Requests
```javascript
khalli response = stanna jeeb("https://api.example.com/data");
```

### DOM Manipulation
```javascript
khalli element = document.createElement("div");
document.getElementById("container").appendChild(element);
```

## Command Line Interface

### Usage
```bash
ta5bees <command> [options] <file>
```

### Commands
- `compile` - Compile a .ta5bees file to JavaScript
- `run` - Run a .ta5bees file directly
- `help` - Show help message

### Options
- `--out` - Output file (for compile command)
- `--watch` - Watch for file changes
- `--version` - Show version number

### Examples
```bash
ta5bees run program.ta5bees
ta5bees compile program.ta5bees --out program.js
ta5bees run program.ta5bees --watch
```

## Best Practices

1. Use descriptive variable names
2. Properly handle errors using try-catch blocks
3. Make use of async/await for asynchronous operations
4. Comment your code when necessary
5. Use const (thabit) for values that won't be reassigned
6. Break down complex functions into smaller, reusable pieces
7. Use proper indentation and formatting for better readability

## Common Pitfalls

1. Forgetting to use `stanna` with async operations
2. Incorrect error handling
3. Mixing synchronous and asynchronous code without proper handling
4. Not checking for null or undefined values
5. Forgetting to use proper variable declarations

---

This documentation is continuously updated as the language evolves. For the latest updates and more detailed information, please refer to the official Ta5beesScript repository.
