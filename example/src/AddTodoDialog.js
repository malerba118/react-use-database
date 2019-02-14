import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useNormalizedApi } from './db'

const AddTodoDialog = (props) => {
  let normalizedApi = useNormalizedApi()
  let [text, setText] = useState('')

  const addTodo = () => {
    normalizedApi.addTodo(text)
      .then(() => {
        props.onSuccess()
      })
      .catch(() => {
        props.onCancel()
      })
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onCancel}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Todo</DialogTitle>
      <DialogContent>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          margin="dense"
          id="add-todo"
          label="Add Todo"
          type="text"
          style={{width: 320}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={addTodo} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTodoDialog
