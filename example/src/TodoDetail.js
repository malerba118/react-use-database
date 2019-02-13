import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useDB, useNormalizedApi, queries } from './db'

const styles = theme => ({

});

function TodoDetail(props) {

  let normalizedApi = useNormalizedApi()
  let db = useDB();

  let [todoText, setTodoText] = useState('')

  let todo = db.executeQuery(queries.getTodoById(props.id))

  const updateTodo = () => {
    normalizedApi.updateTodo(props.id, {text: todoText})
  }

  let todoId = todo ? todo.id : null

  useEffect(() => {
    if (todo) {
      setTodoText(todo.text)
    }
  }, [todoId])

  return (
    <div>
      {todo && (
        <div>
          <TextField
            value={todoText}
            onChange={e => setTodoText(e.target.value)}
            label="Todo"
            fullWidth
            margin="normal"
          />
          <button onClick={updateTodo}>Update</button>
        </div>
      )}
    </div>
  );
}

TodoDetail.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TodoDetail);
