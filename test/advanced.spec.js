import 'chai/register-should'
import  Q  from '../src'

function containsHTML(str) {
    return /<([^>]+)>/.test(str)
}

function htmlText(textName, htmlName, required = false) {
    if (!htmlName) htmlName = textName + '_html'
    return Q(
        obj => {
            const result = {}
            const { [htmlName]: html, [textName]: text } = obj
            if (html) return html.trim()
            else if (text) return text.trim()
            else if (required) return ''
            // else just return empty object
        },
        value => {
            const valueText = String(value).trim()
            const result = {}

            if (isDefined(value) && valueText != '') {
                if (containsHTML(valueText)) result[htmlName] = valueText
                else result[textName] = valueText
            } else if (required) result[textName] = ''

            return result
        },
    )
}

    describe('Advanced Q', () => {
        const filter = Q({
            text: htmlText('textText', 'textHtml'),
            comments: htmlText('comments'),
        })

        it('works in reverse', () => {
            filter
                .reverse({ text: 'normal' })
                .should.be.deep.equal({ textText: 'normal' })
            filter
                .reverse({ text: '<b>normal' })
                .should.be.deep.equal({ textHtml: '<b>normal' })
        })
        it('works forward', () => {
            filter({ textHtml: 'one' }).should.deep.equal({ text: 'one' })
        })
        it('works with single param', () => {
            filter({ comments_html: 'good' }).should.deep.equal({
                comments: 'good',
            })
        })

        it('works with two filters', () => {
            filter({
                comments_html: 'good',
                textText: 'great',
            }).should.deep.equal({ comments: 'good', text: 'great' })
        })
    })

function isDefined(value) {
    return typeof value != 'undefined' && value != null
}
