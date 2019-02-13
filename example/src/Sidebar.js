import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const drawerWidth = 320;

const styles = theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: {
    ...theme.mixins.toolbar,
    position: 'relative'
  },
  tabRoot: {
    minWidth: 0
  },
  tabs: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }
});

const tabs = ['active', 'completed', 'all']

function Sidebar(props) {
  const { classes } = props;

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <div className={classes.toolbar}>
        <Tabs
          value={tabs.indexOf(props.filter)}
          onChange={(e, i) => props.onFilterChange(tabs[i])}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          className={classes.tabs}
        >
          <Tab label="Active" classes={{ root: classes.tabRoot }} />
          <Tab label="Completed" classes={{ root: classes.tabRoot }} />
          <Tab label="All" classes={{ root: classes.tabRoot }}/>
        </Tabs>
      </div>
      <Divider />
      <List>
        {props.todos.map((todo, index) => (
          <ListItem
            button
            key={todo.id}
            onClick={(e) => props.onSelectedTodoChange(todo.id)}
          >
            <span style={{color: props.selectedTodo === todo.id ? 'red' : 'black'}}>
              {todo.text}
            </span>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
};

Sidebar.defaultProps = {
  onFilterChange: () => {},
};

export default withStyles(styles)(Sidebar);
