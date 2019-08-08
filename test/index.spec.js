import 'chai/register-should'
import Q  from '../src'

describe('Basic Q: params', () => {
    const startedOutAsY = 'started out as Y',
        startedOutAsX = 'started out as X',
        x = { y: startedOutAsY },
        xOut = { x: startedOutAsY },
        y = { x: startedOutAsX },
        yOut = { y: startedOutAsX }

        it('a single fn', () => {
            const fn = Q(function forward(yObj) {
                return { x: yObj.y }
            })
            fn(x).should.deep.equal(xOut)
            fn.reverse(x).should.deep.equal({})
        })

        it('a forward & reverse fn', () => {
            const fn = Q(
                function forward(yObj) {
                    return { x: yObj.y }
                },
                function reverse(xObj) {
                    return { y: xObj.x }
                },
            )
            fn(x).should.deep.equal(xOut)
            fn.reverse(y).should.deep.equal(yOut)
        })
        it('two str (param, result) ', () => {
            const fn = Q('x','y')
            fn(x).should.deep.equal(xOut)
            fn.reverse(y).should.deep.equal(yOut)
        })
        it('a paramName & forwardFn', () => {
            const fn = Q('y', function forward(obj) {
                return { x: obj }
            })
            fn(x).should.deep.equal(xOut)
            fn(y).should.deep.equal({})
        })

        it('a filterObj', () => {
            const fn = Q({
                x: 'y',
            })
            fn(x).should.deep.equal(xOut)
            fn.reverse(y).should.deep.equal(yOut)
        })
        it('a nested filterObj', () => {
            const fn = Q({
                x: Q('y'),
            })
            fn(x).should.deep.equal(xOut)
            fn.reverse(y).should.deep.equal(yOut)
        })
        it('a nested filterObj with overriding x', () => {
            const fn = Q({
                ignoreThisName: Q('y').updateX('x'),
            })
            fn(x).should.deep.equal(xOut)
            fn.reverse(y).should.deep.equal(yOut)
        })
        it('a complex filterObj', () => {
            const fn = Q({
                x: Q(
                    'y',
                    function passthroughY(y) {
                        return y
                    },
                    function lengthOfX(x) {
                        return x.length
                    },
                ),
            })

            fn(x).should.deep.equal(xOut)
            fn.reverse(y).should.deep.equal({ y: 16 })
        })
        it('a complex filterObj using arrow fns', () => {
            const fn = Q({
                x: Q('y', y => y, x => x.length),
            })
            fn(x).should.deep.equal(xOut)
            fn.reverse(y).should.deep.equal({ y: 16 })
        })

        it('manual mapping', () => {
            const list = [x, x, { y: 'x' }]
            const list2 = [y, y]
            const fn = Q('x', 'y')
            list.map(fn).should.deep.equal([xOut, xOut, { x: 'x' }])
            list2.map(fn.reverse).should.deep.equal([yOut, yOut])
        })
        it('semi-automated mapping', () => {
            const obj = {
                listX: [x, x],
                listY: [y],
            }
            const expectedOutput = { listXX: [xOut, xOut] }

            const simpleFn = Q('x', 'y')
            const fn = Q({
                listXX: Q(
                    'listX',
                    x => x.map(simpleFn),
                    x => x.map(simpleFn.reverse),
                ),
            })
            fn(obj).should.deep.equal(expectedOutput)
            fn.reverse(expectedOutput).should.deep.equal({ listX: [x, x] })
        })
        it('a mapTo', () => {
            const obj = {
                listX: [x, x],
                listY: [y],
            }
            const expectedOutput = { listXX: [xOut, xOut] }
            const fn = Q({
                listXX: Q.mapTo('listX', Q('x', 'y')),
            })

            fn(obj).should.deep.equal(expectedOutput)
            fn.reverse(expectedOutput).should.deep.equal({ listX: [x, x] })
        })
    })
