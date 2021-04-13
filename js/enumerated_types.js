/* Copyright 2021 Jason DeLaat

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

; const Base = {
    /*
      The base prototype object.

      Base contains all the methods which don't have a default
      implementation for enumerations.
    */
    first() {
        /*
          Returns the first element of the enumeration.
        */
        ; throw new Error('first() not implemented.')
    },
    fromInt(i) { /* eslint no-unused-vars : 'off' */
        /*
          Converts an integer to it's corresponding element in the
          enumeration.

          Arguments:
              i - an integer

          Returns:
              An element of the enumeration.
         */
        ; throw new Error('fromInt() not implemented.')
    },
    last() {
        /*
          Returns the last element of the enumeration.
        */
        ; throw new Error('last() not implemented.')
    },
    toInt() {
        /*
          Returns the integer value associated with the enumeration
          element.
         */
        ; throw new Error('toInt() not implemented.')
    },
    toString() {
        /*
          Returns the string representation of the enumeration
          element.
         */
        ; throw new Error('toString() not implemented.')
    },
}

; const EnumerationBase = Object.create(Base)
/*
  The prototype of all enumerated types.

  EnumerationBase contains all the methods of the Base object, which need to
  be implemented in actual enumerated types, as well as all the
  methods with default implementations.
*/
; Object.assign(EnumerationBase, {
    create() {
        ; const methods_prototype = {}
        ; const enum_base = Object.create(methods_prototype)
        ; enum_base._methods_prototype = methods_prototype
        ; return Object.assign(enum_base, EnumerationBase)
    },
    isEqualTo(other) {
        ; return this.toInt() === other.toInt()
    },
    isGreater(other) {
        ; return this.toInt() > other.toInt()
    },
    isGreaterOrEqualTo(other) {
        ; return this.isEqualTo(other) || this.isGreater(other)
    },
    iterator(from, to) {
        /*
           Constructs an iterator from the enumerated type.

           The iterator can be used to loop through the values of an
           enumerated type and has a 'forEach' method.

           Example:
               Letters = Enum('A', 'B', 'C', 'D', 'E');
               for (let letter of Letters.iterator()) {
                   console.log(letter);
               }

           Using the same Enum we can accomplish the same thing like so:

           Example:
               Letters.iterator().forEach(letter => console.log(letter))

           Arguments:
               from - an enumeration object from which the iterator starts
               to - an enumeration object at which the iterator stops

           Returns:
               An iterator/generator object.
         */
        ; const start = from ? from.toInt() : this.first().toInt()
        ; const end = to ? to.toInt() : this.last().toInt()
        ; let iterator
        ; if (start < end) {
            ; iterator = this._forward_iterator(start, end)
        } else {
            ; iterator = this._backward_iterator(start, end)
        }
        ; iterator.forEach = action => {
            ; for (let value of iterator) {
                ; action(value)
            }
        }
        ; return iterator
    },
    isLess(other) {
        ; return this.toInt() < other.toInt()
    },
    isLessOrEqualTo(other) {
        ; return this.isEqualTo(other) || this.isLess(other)
    },
    methods(methods_object) {
        /*
          Extends enumerated types with custom methods.

          Arguments:
              methods_object - an object containing methods which
                               should be available on instances of the
                               enumerated type.
          Returns:
              The 'this' object.
         */
        ; Object.assign(this._methods_prototype, methods_object)
        ; Object.freeze(this._methods_prototype)
        ; return this
    },
    next() {
        /*
          Returns the next element of the enumeration.

          If there is no next element next() will throw an Error.
        */
        ; return this.fromInt(this.toInt() + 1)
    },
    previous() {
        /*
          Returns the previous element of the enumeration.

          If there is no previous element previous() will throw an
          Error.
        */
        ; return this.fromInt(this.toInt() - 1)
    },
    *_backward_iterator(start, end) {
        ; let value = this.fromInt(start)
        ; yield value
        ; while (value.toInt() !== end) {
            ; value = value.previous()
            ; yield value
        }
    },
    *_forward_iterator(start, end) {
        ; let value = this.fromInt(start)
        ; yield value
        ; while (value.toInt() !== end) {
            ; value = value.next()
            ; yield value
        }
    },
})

; function Enum(...names) {
    /*
      Build a type of enumerated constants from a list of names.

      Example:
          Color = Enum('RED', 'GREEN', 'BLUE');
          console.log(Color.RED.toString())             // 'RED'
          console.log(Color.GREEN.toInt())              // 1
          console.log(Color.BLUE.previous().toString()) // 'GREEN'

      Arguments:
          ...names - Any number of strings which become the
                     names of the constants.

      Returns:
          An object encapsulating the enumerated constants.
     */

    // First create the type container for the constants.
    ; const enum_type = EnumerationBase.create()
    ; Object.assign(enum_type, {
        first() {
            ; return enum_type[names[0]]
        },
        fromInt(i) {
            ; return enum_type[names[i]]
        },
        last() {
            ; return enum_type[names[names.length - 1]]
        },
    })

    // Then create each of the objects and add them to the container.
    ; const value_prototype = Object.create(enum_type)
    ; Object.assign(value_prototype, {
            toInt() {
                ; return this.value
            },
            toString() {
                ; return this.name
            },
        })
    ; names.forEach(n => {
        ; const enum_object = Object.create(value_prototype)
        ; enum_object.name = n
        ; enum_object.value = names.indexOf(n)
        ; enum_type[n] = enum_object
        ; Object.freeze(enum_object)
    })
    ; return enum_type
}

; function EnumeratedRange(minimum, maximum, name='') {
    /*
      Creates a type which only allows values within a given range.

      Example:
          SmallNum = EnumeratedRange(1, 10)
          // These are all okay.
          SmallNum(1)
          SmallNum(5)
          SmallNum(10)

          // These will throw an error because they're out of range.
          SmallNum(0)
          SmallNum(11)
          SmallNum(100)

      An EnumeratedRange supports all the same methods as enumerated
      constants created with Enum: isEqualTo, next, previous,
      iterator, etc. Unlike values of an Enum, values of an
      EnumeratedRange can't be compared with '==' or '===' since
      they're not constants but are created when needed.

      Example:
          a = SmallNum(1)
          b = SmallNum(1)
          a === b        // false
          a.isEqualTo(b) // true

      An optional third parameter to EnumeratedRange controls the
      output of the toString() method.

      Example:
          SmallNum = EnumeratedRange(1, 10, 'SmallNum')
          SmallNum(1).toString() // 'SmallNum(1)'

          SmallNum = EnumeratedRange(1, 10)
          SmallNum(1).toString() // '1'


      Arguments:
          minimum - an integer, the smallest allowed value.
          maximum - an integer, the largest allowed value.
          name (optional) - a string. Determines the output of the
                            toString() method.

      Returns:
          A function/object for creating and manipulating values
          of the defined type.
     */
    ; const range_type = EnumerationBase.create()
    ; Object.assign(range_type, {
        first() {
            ; return range_type.fromInt(minimum)
        },
        fromInt(i) {
            ; if (i >= minimum && i <= maximum) {
                ; const enum_object = Object.create(range_type)
                ; enum_object.value = i
                ; return enum_object
            } else {
                ; throw new Error(`Value '${i}' is out of range.`)
            }
        },
        last() {
            ; return range_type.fromInt(maximum)
        },
        toInt() {
            ; return this.value
        },
        toString() {
            ; if (name) {
                ; return `${name}(${this.value})`
            } else {
                ; return `${this.value}`
            }
        },
    })

    // The range_type.fromInt method is the actual constructor. But we
    // also want it to behave like an object with 'static'
    // methods. Only some of the methods make sense though so we
    // assign the EnumerationBase and range_type methods to fromInt and then
    // 'undefine' the ones that don't make sense. The methods that
    // remain are: fromInt, iterator, first, last, and methods.
    ; Object.assign(range_type.fromInt, EnumerationBase, range_type, {
        toInt : undefined,
        toString : undefined,
        isEqualTo : undefined,
        isGreater : undefined,
        isGreaterEqualTo : undefined,
        isLess : undefined,
        isLessEqualTo : undefined,

        // Methods need to be applied to the base type not to fromInt
        // itself otherwise the methods don't exist on instances of
        // the type.
        methods(methods_object) {
            ; range_type.methods(methods_object)
            ; return this
        },
        next : undefined,
        previous : undefined,
    })
    ; return range_type.fromInt
}

; function Flags(...names) {
    /*
      Enumerated constants where each constant's value is a power of 2.

      Flags allow users to give symbolic names to a set of flags
      and represent a subset of those options as a single integer
      value.

      Example:
          const Options = Flags('A', 'B', 'C', 'D');
          Options.A.toInt();       // 1
          Options.fromInt(8);      // Options.D
          Options.A | Options.C;   // 5
          Options.listFromInt(11); // [Options.A, Options.B, Options.D]
          (13 & Options.B) > 0;    // false
          (13 & Options.C) > 0;    // true

     */
    ; const flag_type = EnumerationBase.create()
    ; Object.assign(flag_type, {
        first() {
            ; return flag_type[names[0]]
        },
        fromInt(i) {
            ; const value = flag_type[names[Math.log2(i)]]
            ; if (value === undefined) {
                ; throw new Error(`Integer '${i}' is not a valid flag value.`)
            } else {
                ; return value
            }
        },
        last() {
            ; return flag_type[names[names.length - 1]]
        },
        listFromInt(i) {
            /*
              Get a list of all flags represented by an integer.

              If the given integer is outside of the allowable range,
              listFromInt() throws an error. The allowable range is
              [0..(2^n)-1] where n is the number of flags. So for
              four flags the allowable range is [0..15]

              Arguments:
                  i - an integer

              Returns:
                  An array of flags.
             */
            ; if (i < 0 || i >= Math.pow(2, names.length)) {
                ; throw new Error(`Integer '${i}' is out of range.`)
            }
            ; const flags = []
            ; this.iterator().forEach(
                value => i & value ? flags.push(value) : undefined
            )
            ; return flags
        },
        next() {
            ; return this.fromInt(2 * this.toInt())
        },
        previous() {
            ; return this.fromInt(this.toInt() / 2)
        }
    })

    ; const value_proto = Object.create(flag_type)
    ; Object.assign(value_proto, {
        toInt() {
            ; return Math.pow(2, names.indexOf(this.name))
        },
        toString() {
            ; return this.name
        },
        valueOf() {
            ; return this.toInt()
        }
    })
    ; names.forEach(n => {
        ; const flag_object = Object.create(value_proto)
        ; flag_object.name = n
        ; flag_type[n] = flag_object
        ; Object.freeze(flag_object)
    })
    ; return flag_type
}

; function EnumObjects(object_map) {
    /*
      Build a type of enumerated constants from an object map.

      EnumObjects is very similar to Enum except that in additional to
      adding default methods to each enumerated value, each value can
      have it's own methods as well.

      Example:
          Animal = EnumObjects({
             DOG : {
                 speak() {
                     console.log('woof!');
                 }
             },
             CAT : {
                 speak() {
                     console.log('meow!');
                 }
             },
             GIRAFFE : {}
          }).methods({
             speak() {
                 console.log('...');
             }
          })

          Animal.DOG.speak()     // woof!
          Animal.CAT.speak()     // meow!
          Animal.GIRAFFE.speak() // ...

      Arguments: object_map - An object where each key becomes one
          enumerated constant. The value associated with each key
          should itself be an object usually containing methods

      Returns:
          An object encapsulating the enumerated constants.
     */

    ; const enum_type = EnumerationBase.create()
    ; const names = Object.keys(object_map)
    ; Object.assign(enum_type, {
        first() {
            ; return enum_type[names[0]]
        },
        fromInt(i) {
            ; return enum_type[names[i]]
        },
        last() {
            ; return enum_type[names[names.length - 1]]
        },
        toInt() {
            ; return this.value
        },
        toString() {
            ; return this.name
        },
    })
    ; names.forEach(n => {
        ; const enum_obj = Object.create(enum_type)
        ; Object.assign(enum_obj, object_map[n])
        ; enum_obj.name = n
        ; enum_obj.value = names.indexOf(n)
        ; enum_type[n] = enum_obj
        ; Object.freeze(enum_obj)
    })
    ; Object.freeze(enum_type)
    ; return enum_type
}
