
# Table of Contents

1.  [Enumerated Types for Javascript](#org8fc0a5e)
    1.  [Getting Started](#org27919a6)
        1.  [Installing](#org16efc6e)
    2.  [Usage](#org53a6534)
        1.  [Enumerated constants with `Enum`](#orgf93645f)
        2.  [Constrained types with `EnumeratedRange`](#org8bff889)


<a id="org8fc0a5e"></a>

# Enumerated Types for Javascript

An implementation of enumerated types in pure javascript.


<a id="org27919a6"></a>

## Getting Started


<a id="org16efc6e"></a>

### Installing


<a id="org53a6534"></a>

## Usage

The `enum` and `enum_module` files both provide two functions
`Enum` &#x2014; for creating enumerated constants &#x2014; and
`EnumeratedRange` &#x2014; for creating a types with constrained
numerical values &#x2014; as well as an object `EnumBase` which can be
used as the prototype of other types of enumerations.


<a id="orgf93645f"></a>

### Enumerated constants with `Enum`

Use the `Enum` function to create a set of constants:

    Color = Enum(
        'RED',
        'ORANGE',
        'YELLOW',
        'GREEN',
        'BLUE',
        'INDIGO',
        'VIOLET'
    )

Constants can be converted to and from their interger equivalents:

    Color.fromInt(3)    // Color.GREEN
    Color.GREEN.toInt() // 3

And you can also get the string representation:

    Color.RED.toString()    // 'RED'
    Color.VIOLET.toString() // 'VIOLET'

This allows you to use the constants as if they were object
keys.

    someObj = {
        Color.RED : 'Something having to do with red.',
        Color.BLUE : 'Something to do with blue.',
    }

In the above example the actual keys are the strings `'RED'` and
`'BLUE'` because javascript calls `toString()` automatically when
an object is used as a key.

You can navigate forwards and backwards through the sequence using
`next()` and `previous()`. Going past the end of the sequence
throws and error:

    Color.RED.next()        // Color.ORANGE
    Color.INDIGO.previous() // Color.BLUE
    Color.RED.previous()    // Error!
    Color.VIOLET.next()     // Error!

To get around that you can get an `iterator()` and loop through
the values with a `for` loop or with `forEach`.

    // Prints all the colors to the console.
    for (let color of Color.iterator()) {
        ; console.log(color.toString()) 
    }
    
    // Also prints all the colors to the console.
    Color.iterator().forEach(color => console.log(color.toString()))

The `iterator()` method takes two parameters `from` and `to`, both
optional, so you can iterate though a subset of the values.

    Color.iterator(Color.GREEN, Color.INDIGO)
        .forEach(color => console.log(color.toString()))

And can even be used to iterate though the values in reverse order
if desired.

    Color.iterator(Color.last(), Color.first())
        .forEach(color => console.log(color.toString()))

Finally, the constants can be compared in a number of ways.

    Color.RED.isLess(Color.BLUE)                // true
    Color.VIOLET.isLess(Color.BLUE)             // false
    Color.VIOLET.isGreater(Color.BLUE)          // true
    Color.VIOLET.isGreater(Color.VIOLET)        // false
    Color.VIOLET.isGreaterOrEqual(Color.VIOLET) // true
    Color.RED.isEqual(Color.GREEN)              // false
    Color.RED.isEqual(Color.RED)                // true
    Color.RED === Color.GREEN                   // false
    Color.RED === Color.RED                     // true


<a id="org8bff889"></a>

### Constrained types with `EnumeratedRange`

Another type of enumeration are values constrained to a particular
range: values between 1 and 10, for instance. In this case it's
actually the number we're interested in not a symbolic name and
there are, generally, too many possible values to create them as
contants. Instead we can create an `EnumeratedRange`.

    SmallNum = EnumeratedRange(1, 10, 'SmallNum')

The resulting value, `SmallNum` in this example, can then be used
as a constructor.  The third parameter is optional and is only
relevant when calling `toString()`. Trying to create a value
outside of the allowed range throws an error.

    x = SmallNum(1)
    y = SmallNum(5)
    z = SmallNum(10)
    error1 = SmallNum(0)  // Error!
    error2 = SmallNum(11) // Error!

Each value supports the same methods &#x2014; `next()`, `previous()`,
`toInt()`, `toString()`, etc. &#x2014; as enumerated constants.

    x.next()     // SmallNum(2)
    y.previous() // SmallNum(4)
    z.toInt()    // 10
    z.toString() // '10'

The constructor itself supports the `first()`, `last()`,
`iterator()`, and `fromInt()` methods.

    SmallNum.first()    // SmallNum(1)
    SmallNum.last()     // SmallNum(10)
    SmallNum.fromInt(3) // SmallNum(3)
    
    // Prints all the values to the console.
    SmallNum.iterator().forEach(n => console.log(n.toInt()))

