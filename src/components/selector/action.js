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
    const options = [
      {
        key: '_',
        text: '',
        value: false
      },
      ...actionOptions
    ];
    return (
      <React.Fragment>
        <Header inverted attached>
          Select an action from the {contract} contract:
        </Header>
        <Segment attached>
          <Form.Field>
            <Dropdown
              allowAdditions
              fluid
              name="action"
              options={options}
              onChange={onChange}
              search
              selection
              selectOnBlur={false}
              selectOnNavigation={false}
              value={action}
            />
          </Form.Field>
        </Segment>
      </React.Fragment>
    );
  }
}

export default SelectorAction;
