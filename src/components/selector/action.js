import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

class SelectorAction extends Component {
  render() {
    const {
      abi,
      action,
      contract,
      contractOptions,
      onChange,
      onReset,
    } = this.props;
    const actionOptions = abi.actions.map((action) => (
      { key: action.name, text: action.name, value: action.name }
    ));
    return (
      <React.Fragment>
        <Header inverted attached>
          Select an action from the {contract} contract:
        </Header>
        <Segment attached>
          <Form.Field>
            <Dropdown
              defaultValue={action}
              fluid
              name="action"
              options={actionOptions}
              onChange={onChange}
              search
              selection
            />
          </Form.Field>
        </Segment>
      </React.Fragment>
    );
  }
}

export default SelectorAction;
