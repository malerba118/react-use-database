import React, { useEffect } from 'react'
import { mount } from 'enzyme'
import { initDB, getAppData, users, models } from './testHelpers'

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

  it('empty query returns empty array', async () => {
    let [DatabaseProvider, useDB] = initDB()

    const App = (props) => {
      let db = useDB()
      let posts = db.executeStoredQuery('postsByIds')
      return <div id="data">{JSON.stringify(posts)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual([]);
  })

  it('default entities works', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: users[0]
        }
      }
    })

    const App = (props) => {
      let db = useDB()
      let user = db.executeQuery({
        value: 1,
        schema: models.UserSchema
      })
      return <div id="data">{JSON.stringify(user)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(users[0]);
  })

  it('stored query defaultValue works', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: users[0]
        }
      },
      userByIdDefaultValue: 1
    })

    const App = (props) => {
      let db = useDB()
      let user = db.executeStoredQuery('userById')
      return <div id="data">{JSON.stringify(user)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(users[0]);
  })

  it('user exists eventually', async () => {
    let [DatabaseProvider, useDB] = initDB()

    const App = (props) => {
      let db = useDB()
      let user = db.executeStoredQuery('userById') || null
      useEffect(() => {
        db.mergeEntities({
          User: {
            1: users[0]
          }
        })
        db.updateStoredQuery('userById', 1)
      }, [])
      return <div id="data">{JSON.stringify(user)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(null);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data).toEqual(users[0]);
  })

  it('function setter works with updateStoredQuery', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          0: users[0],
          1: users[1]
        }
      },
      userByIdDefaultValue: 0
    })

    const App = (props) => {
      let db = useDB()
      let user = db.executeStoredQuery('userById') || null
      useEffect(() => {
        db.updateStoredQuery('userById', prevId => prevId + 1)
      }, [])
      return <div id="data">{JSON.stringify(user)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(users[0]);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data).toEqual(users[1]);
  })

  it('user changes eventually', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: users[0],
        }
      },
    })

    const App = (props) => {
      let db = useDB()
      let user = db.executeQuery({
        value: 1,
        schema: models.UserSchema
      }) || null
      useEffect(() => {
        db.mergeEntities({
          User: {
            1: users[1]
          }
        })
      }, [])
      return <div id="data">{JSON.stringify(user)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data.id).toEqual(1);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data.id).toEqual(2);
  })

  it('partial user update', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: users[0]
        }
      },
    })

    const App = (props) => {
      let db = useDB()
      let user = db.executeQuery({
        value: 1,
        schema: models.UserSchema
      }) || null
      useEffect(() => {
        db.mergeEntities({
          User: {
            1: {...users[0], name: users[1].name}
          }
        })
      }, [])
      return <div id="data">{JSON.stringify(user)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data.name).toEqual(users[0].name);
    expect(data.id).toEqual(users[0].id);
    expect(data.email).toEqual(users[0].email);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data.name).toEqual(users[1].name);
    expect(data.id).toEqual(users[0].id);
    expect(data.email).toEqual(users[0].email);
  })

})
