import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Sidebar from './Sidebar';
import TodoDetail from './TodoDetail';
import brace from 'brace';
import AceEditor from 'react-ace';
import ContainerDimensions from 'react-container-dimensions';
import useAsync from './useAsync';
import { useDB, useNormalizedApi } from './db'

import 'brace/mode/json';
import 'brace/theme/monokai';

const drawerWidth = 360;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    minWidth: 550
  },
});

const filterQueries = {
  'active': 'ACTIVE_TODOS',
  'all': 'ALL_TODOS',
  'completed': 'COMPLETED_TODOS'
}

function App(props) {
  const { classes } = props;
  let [filter, setFilter] = useState('active');
  let [selectedTodoId, setSelectedTodoId] = useState();

  let normalizedApi = useNormalizedApi()
  let db = useDB();

  let [fetchTodosRequest, fetchTodos] = useAsync(normalizedApi.fetchTodos)

  useEffect(() => {
    fetchTodos(filter)
  }, [filter])

  let todos = db.executeStoredQuery(filterQueries[filter]);
  let todoIds = JSON.stringify(todos.map(t => t.id))

  useEffect(() => {
    setSelectedTodoId(todos[0] && todos[0].id)
  }, [todoIds])

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Todo App
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar
        todos={todos}
        fetchTodosRequest={fetchTodosRequest}
        filter={filter}
        onFilterChange={setFilter}
        selectedTodo={selectedTodoId}
        onSelectedTodoChange={setSelectedTodoId}
      />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div style={{height: 170}}>
          <TodoDetail id={selectedTodoId}/>
        </div>
        <div style={{height: '70%', display: 'flex', justifyContent: 'space-between'}}>
          <div style={{flex: 1, margin: 8}}>
          <ContainerDimensions>
              { ({ height, width }) => (
                  <React.Fragment>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#252620',
                        color: 'rgba(255, 255, 255, .8)',
                        height: 48
                      }}
                    >
                      Entity Store
                    </div>
                    <AceEditor
                      value={JSON.stringify(db.entities, 2, 2)}
                      mode="json"
                      theme="monokai"
                      width={width}
                      height={320}
                      readOnly
                      name="entities-json"
                      editorProps={{$blockScrolling: true}}
                    />
                  </React.Fragment>
              ) }
          </ContainerDimensions>
          </div>
          <div style={{flex: 1, margin: 8}}>
            <ContainerDimensions>
                { ({ height, width }) => (
                  <React.Fragment>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#252620',
                        color: 'rgba(255, 255, 255, .8)',
                        height: 48
                      }}
                    >
                      Query Store
                    </div>
                    <AceEditor
                      value={JSON.stringify(db.storedQueries, 2, 2)}
                      mode="json"
                      theme="monokai"
                      width={width}
                      height={320}
                      readOnly
                      name="stored-queries-json"
                      editorProps={{$blockScrolling: true}}
                    />
                  </React.Fragment>
                ) }
            </ContainerDimensions>
          </div>
        </div>
      </main>
    </div>
  );
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
