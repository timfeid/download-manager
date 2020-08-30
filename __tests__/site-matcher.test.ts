import {matchSite} from '../src/sites'
import Rapidgator from '../src/sites/rapidgator.site'
import {expect} from 'chai'
import DefaultSite from '../src/sites/default'

describe('site matcher', () => {
  let rapidgator: Rapidgator

  before (() => {
    rapidgator = new Rapidgator()
  })

  it('matches rapidgator', async () => {
    expect(matchSite('https://rapidgator.net/file/cd292d534617e8b65831a25c4d6b9613/test.txt.html')).to.be.instanceOf(Rapidgator)
  })

  it('can authenticate', async () => {
    await rapidgator.authenticate()
    expect(rapidgator.sid).to.not.be.undefined
    const lastRetrieved = rapidgator.sid!.last_retrieved
    await new Promise(resolve => setTimeout(resolve, 2))
    await rapidgator.authenticate()
    expect(rapidgator.sid!.last_retrieved).to.eq(lastRetrieved)
  })

  it('transforms url to download url', async () => {
    const transformedUrl = await rapidgator.transformUrl('https://rapidgator.net/file/cd292d534617e8b65831a25c4d6b9613/test.txt.html')
    expect(/^https?:\/\/[^.]+\.rapidgator\.net\/download\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(transformedUrl)).to.eq(true)
  })

  it('uses default site for unknown', async () => {
    expect(matchSite('https://google.com')).to.be.instanceOf(DefaultSite)
  })
})
