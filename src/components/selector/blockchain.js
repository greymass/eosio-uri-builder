import React, { Component } from 'react';
import { find } from 'lodash';

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
      blockchain,
      blockchainOptions,
      chainAliases,
      onChange,
      onReset,
    } = this.props;
    const chain = find(chainAliases, function(c) { return c[1] === blockchain }) || [];
    return (!blockchain)
      ? (
        <React.Fragment>
          <Header inverted attached='top'>
            Select which blockchain this transaction is intended for or enter a chain ID:
          </Header>
          <Segment attached='bottom'>
            <Form.Field>
              <Dropdown
                allowAdditions
                fluid
                name="blockchain"
                options={blockchainOptions}
                onChange={onChange}
                search
                selection
                selectOnNavigation={false}
                value={blockchain}
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
              content="Change Blockchain"
              floated="right"
              onClick={onReset}
              size="small"
            />
            Blockchain: {chain[0] || 'Unknown'}
            <Header.Subheader>
              <strong>{blockchain}</strong>
            </Header.Subheader>
          </Header>
        </Segment>
      );
  }
}

export default SelectorContract;
