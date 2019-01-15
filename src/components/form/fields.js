import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';

class FormFields extends Component {
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
            Field Data
          </Header>
          {fields.map((field, idx) => (
            <Form.Field key={field.name}>
              <Form.Input
                autoFocus={(idx === 0)}
                defaultValue={values[field.name]}
                label={field.name}
                name={field.name}
                onChange={onChange}
              />
            </Form.Field>
          ))}
        </Segment>
        <Segment inverted basic>
          <Header>
            Transaction Data
          </Header>
          <ReactJson
            displayDataTypes={false}
            displayObjectSize={false}
            iconStyle="square"
            name={null}
            src={values}
            style={{ padding: '1em' }}
            theme="harmonic"
          />
        </Segment>
      </Segment>
    );
  }
}

export default FormFields;
