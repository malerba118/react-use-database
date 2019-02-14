import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useDB, useNormalizedApi, queries } from './db'

const styles = theme => ({

});

function TodoDetail(props) {

  let normalizedApi = useNormalizedApi()
  let db = useDB();

  let [todoText, setTodoText] = useState('')
  let [completed, setCompleted] = useState(false)

  let todo = db.executeQuery(queries.getTodoById(props.id))

  const updateTodo = () => {
    normalizedApi.updateTodo(props.id, {
      text: todoText,
      completed: completed
    })
  }

  const deleteTodo = () => {
    normalizedApi.deleteTodo(props.id)
  }

  let todoId = todo ? todo.id : null

  useEffect(() => {
    if (todo) {
      setTodoText(todo.text)
      setCompleted(todo.completed)
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
          <FormControlLabel
            control={
              <Checkbox
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
            }
            label="Completed"
          />
          <button onClick={updateTodo}>Update</button>
          <button onClick={deleteTodo}>Delete</button>
        </div>
      )}
    </div>
  );
}

TodoDetail.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TodoDetail);
