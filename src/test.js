import React from 'react'
import { mount } from 'enzyme'

const timeout = (n) => {
  return new Promise((resolve) => {
    setTimeout(resolve, n)
  })
}


describe('useDB', () => {

  beforeEach(() => {

  })

  afterEach(() => {

  })

  it('renders', async () => {
    await timeout(0)
    expect(true).toEqual(true);
  })

})
