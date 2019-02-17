import React, { useEffect } from 'react'
import { mount } from 'enzyme'
import { initDB, getAppData, users, models } from './testHelpers'
import createDB from '../'

const timeout = (n) => {
  return new Promise((resolve) => {
    setTimeout(resolve, n)
  })
}

class JSONSet extends Set {
    toJSON () {
        return [...this]
    }
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

  it('default entities filters out bad keys', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: users[0]
        },
        Comment: {
          5: {
            value: 'should be filtered out'
          }
        }
      }
    })

    const App = (props) => {
      let db = useDB()
      return <div id="data">{JSON.stringify(Object.keys(db.entities))}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(['Post', 'User']);
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

  it('mergeEntities filters out bad keys', async () => {
    let [DatabaseProvider, useDB] = initDB({
      userByIdDefaultValue: 0
    })

    const App = (props) => {
      let db = useDB()
      useEffect(() => {
        db.mergeEntities({
          Comment: {
            5: {
              value: 'should be filtered out'
            }
          }
        })
      }, [])
      return <div id="data">{JSON.stringify(db.entities)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(Object.keys(data)).toEqual(['Post', 'User']);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    console.log(JSON.stringify(data))
    expect(Object.keys(data)).toEqual(['Post', 'User']);
  })

  it('mergeEntities arrays should be replaced', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: {
            ...users[0],
            someArray: ['foo', 'bar', 'baz']
          }
        }
      },
    })

    const App = (props) => {
      let db = useDB()
      useEffect(() => {
        db.mergeEntities({
          User: {
            1: {
              ...users[0],
              someArray: ['baz']
            }
          }
        })
      }, [])
      return <div id="data">{JSON.stringify(db.entities.User[1].someArray)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(['foo', 'bar', 'baz']);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data).toEqual(['baz']);
  })

  it('mergeEntities sets should be replaced', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: {
            ...users[0],
            someSet: new JSONSet(['foo', 'bar'])
          }
        }
      },
    })

    const App = (props) => {
      let db = useDB()
      useEffect(() => {
        db.mergeEntities({
          User: {
            1: {
              ...users[0],
              someSet: new JSONSet(['bar'])
            }
          }
        })
      }, [])
      return <div id="data">{JSON.stringify(db.entities.User[1].someSet)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(['foo', 'bar']);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data).toEqual(['bar']);
  })

  it('mergeEntities customizer should override default', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: {
            ...users[0],
            someArray: ['foo', 'bar', 'baz']
          }
        }
      },
    })

    const App = (props) => {
      let db = useDB()
      useEffect(() => {
        db.mergeEntities(
          {
            User: {
              1: {
                ...users[0],
                someArray: ['baz']
              }
            }
          },
          {
            customizer: () => {}
          }
        )
      }, [])
      return <div id="data">{JSON.stringify(db.entities.User[1].someArray)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(['foo', 'bar', 'baz']);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data).toEqual(['baz', 'bar', 'baz']);
  })

  it('mergeEntities accepts function as first arg', async () => {
    let [DatabaseProvider, useDB] = initDB({
      defaultEntities: {
        User: {
          1: {
            ...users[0],
            someArray: ['foo']
          }
        }
      },
    })

    const App = (props) => {
      let db = useDB()
      useEffect(() => {
        db.mergeEntities((prevEntities) => ({
          User: {
            1: {
              ...users[0],
              someArray: [...prevEntities.User[1].someArray, 'bar']
            }
          }
        }))
      }, [])
      return <div id="data">{JSON.stringify(db.entities.User[1].someArray)}</div>
    }

    let wrapper = mount(
      <DatabaseProvider>
        <App/>
      </DatabaseProvider>
    )
    let data = getAppData(wrapper)
    expect(data).toEqual(['foo']);
    await timeout(0)
    wrapper.update()
    data = getAppData(wrapper)
    expect(data).toEqual(['foo', 'bar']);
  })
})
