import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';

class FormOptions extends Component {
  render() {
    const {
      fields,
      onChange,
      values,
    } = this.props;
    return (
      <Segment attached>
        <Segment basic>
          <Header>
            Signing Request Options
          </Header>
          <Form.Field>
            <Form.Checkbox
              checked={values.broadcast}
              label="Broadcast transaction to blockchain"
              name="broadcast"
              onChange={onChange}
            />
          </Form.Field>
        </Segment>
        <Segment inverted basic>
          <Header>
            Callback Data
          </Header>
          <ReactJson
            displayDataTypes={false}
            displayObjectSize={false}
            iconStyle="square"
            name={null}
            src={{
              broadcast: values.broadcast
            }}
            style={{ padding: '1em' }}
            theme="harmonic"
          />
        </Segment>
      </Segment>
    );
  }
}

export default FormOptions;
