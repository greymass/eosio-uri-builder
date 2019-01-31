import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

class SelectorContract extends Component {
  render() {
    const {
      contract,
      contractOptions,
      onChange,
      onReset,
    } = this.props;
    return (!contract)
      ? (
        <React.Fragment>
          <Header inverted attached='top'>
            Select a contract from which to generate a transaction:
          </Header>
          <Segment attached='bottom'>
            <Form.Field>
              <Dropdown
                allowAdditions
                fluid
                name="contract"
                options={contractOptions}
                onChange={onChange}
                search
                selection
                selectOnNavigation={false}
                value={contract}
              />
            </Form.Field>
          </Segment>
        </React.Fragment>
      )
      : (
        <Segment clearing attached='top'>
          <Header>
            <Button
              color="blue"
              content="Change Contract"
              floated="right"
              onClick={onReset}
              size="small"
            />
            Contract:
            {' '}
            <strong>{contract}</strong>
          </Header>
        </Segment>
      );
  }
}

export default SelectorContract;
