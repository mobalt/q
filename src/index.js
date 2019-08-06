function makeFilters(filters) {
    const q = []
    for (let x in filters) {
        const yValue = filters[x]
        let yFn
        switch (typeof yValue) {
            case 'function':
                if (yValue.hasOwnProperty('updateX')) {
                    yFn = yValue.updateX(x)
                } else {
                    yFn = fn({ x, yToX: yValue })
                }
                break
            case 'object':
                yFn = makeFilters(yValue).updateX(x)
                break
            case 'string':
                yFn = fn({ x, y: yValue })
                break
            default:
                throw new Error('Not an acceptable type for making filters.')
        }
        q.push(yFn)
    }

    function yToX(obj) {
        return flattenObjArray(
            q.map(filterFn => {
                return filterFn(obj)
            }),
        )
    }

    function xToY(obj) {
        return flattenObjArray(
            q.map(filterFn => {
                return filterFn.reverse(obj)
            }),
        )
    }

    return fn({
        yToX,
        xToY,
    })
}

function flattenObjArray(arr) {
    const result = {}
    for (let obj of arr) {
        for (let prop in obj) {
            result[prop] = obj[prop]
        }
    }
    return result
}

function mergeObj(unto, newProps) {
    for (let prop in newProps) {
        unto[prop] = newProps[prop]
    }
    return unto
}

export function Q(func1, func2) {
    const args = Array.from(arguments),
        strings = args.filter(isStr),
        fns = args
            .map(arg => (isFn(arg) && arg) || (isObj(arg) && makeFilters(arg)))
            .filter(a => a)

    const yToX = fns[0],
        xToY = fns[1],
        x = strings[1],
        y = strings[0]

    if (yToX && yToX.hasOwnProperty('updateX') && !xToY) {
        // console.log('just updating')
        // just update
        if (y) yToX.update({ y })
        if (x) yToX.updateX(x)
        return yToX
    } else {
        // console.log('creating new')
        return fn({ y, x, yToX, xToY })
    }
}

function mapTo(y, itemFilter) {
    return fn({
        y,
        yToX: x => x.map(itemFilter),
        xToY: x => x.map(itemFilter.reverse),
    })
}
Q.mapTo = mapTo

function fn(context) {
    const forwardWrapper = simplify('yToX', 'y', 'x'),
        reverseWrapper = simplify('xToY', 'x', 'y')
    const forward = bind(forwardWrapper, context)
    const reverse = bind(reverseWrapper, context)

    forward.updateX = updateX
    forward.update = update
    forward.reverse = reverse
    forward.context = context

    return forward

    function updateX(newX) {
        if (!isStr(newX))
            throw new Error(`This was expecting a string. Received: ${newX}`)

        // override x only if not already defined
        if (!isDefined(context.x)) {
            context.x = newX
        }
        return forward
    }

    function update(obj) {
        Object.assign(context, obj)
        return forward
    }
}

function simplify(f, p, r) {
    return function(obj) {
        const { [f]: fn, [p]: paramName, [r]: resultName } = this

        if (!fn) {
            if (resultName && paramName && obj[paramName] !== undefined) {
                return {
                    [resultName]: obj[paramName],
                }
            } // else fallthrough
        } else {
            const param = paramName ? obj[paramName] : obj
            if (param !== undefined) {
                const result = fn.call({ ...this, obj }, param)

                if (result !== undefined) {
                    return resultName ? { [resultName]: result } : result
                } // else fallthrough
            } // else fallthrough
        }

        // catchall fallthroughs
        return {}
    }
}

function bind(func, thisObj = {}) {
    if (!isFn(func)) throw new TypeError('Can only bind functions')

    function boundFunction() {
        return func.apply(thisObj, arguments)
    }

    boundFunction.thisObj = thisObj
    boundFunction.fn = func

    return boundFunction
}

function isFn(item) {
    return typeof item == 'function'
}

function isObj(item) {
    return typeof item == 'object'
}

function isStr(item) {
    return typeof item == 'string'
}

function isDefined(value) {
    return typeof value != 'undefined' && value != null
}
