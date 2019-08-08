import 'chai/register-should'
//import {describe} from 'mocha'
import Q from '../src'

describe('Additional options', () => {
    const options = {
        // === PARAMS ===
        // if x is known, simplify and check are true otherwise by necessity they are false
        // simplify will pass the value of obj[x] instead of the full obj
        simplifyX: false,
        // if check only works if simplify is on. When turned on, If value is undefined, then don't call the function
        checkX: false,
        // if checkResult is turned on, then undefined results are stored to property rather than ignored
        checkResultX: false,

        simplifyY: false,
        checkY: false,
        checkResultY: false,
    }
    const lookup = {
        one: 'aaa',
        two: 'bbb',
        three: undefined,
    }
    const rLookup = {
        aaa: 'one',
        bbb: 'two',
        undefined: 'three'
    }
    const fn = Q({
        x: Q('y',
            y => lookup[y],
            x =>  rLookup[x] || 'other number'
        ).update({
            checkY: false,
            checkX: false
        })
    })


    it('works when all is defined', () => {
        const one = {y: 'one'}, oneOut = {x: 'aaa'}
        fn(one) .should.deep.equal(oneOut)
        fn.reverse(oneOut).should.deep.equal(one)

        const two = {y: 'two'}, twoOut = {x: 'bbb'}
        fn(two) .should.deep.equal(twoOut)
        fn.reverse(twoOut).should.deep.equal(two)
    })
    it ('works when undefined', ()=>{

        const three = {y: 'three'}, threeOut = {}
        fn(three) .should.deep.equal(threeOut)
        fn.reverse(threeOut).should.deep.equal(three)

    })
    it ('works when default cases', ()=>{

        fn({y: 'four'}) .should.deep.equal({})
        fn.reverse({}).should.deep.equal({y: 'three'})

        fn.reverse({x: 'XXX'}).should.deep.equal({y: 'other number'})

    })
})
