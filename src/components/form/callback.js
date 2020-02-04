import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';

class FormCallback extends Component {
  render() {
    const {
      background,
      fields,
      onChange,
      request,
    } = this.props;
    return (
      <Segment attached>
        <Segment basic>
          <Header>
            Callback Configuration
          </Header>
          <Form.Field>
            <Form.Input
              autoFocus
              defaultValue={request.data.callback}
              label="Callback URL"
              name="callback"
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field>
            <Form.Checkbox
              checked={background}
              label="Process callback in background"
              name="background"
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
              background,
              callback: request.data.callback,
            }}
            style={{ padding: '1em' }}
            theme="harmonic"
          />
        </Segment>
      </Segment>
    );
  }
}

export default FormCallback;
