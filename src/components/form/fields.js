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
  formatValue = (type, value) => {
    switch (type) {
      case 'string': {
        try {
          // Try re-encoding to ensure it's not an object.
          return JSON.stringify(JSON.parse(value));
        } catch(err) {
          // no catch, ignore
        }
        // otherwise just stringify and return
        return value;
      }
      default: {
        return value;
      }
    }
    return value;
  }
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
          {fields.map((field, idx) => {
            const { name, type } = field;
            let value = this.formatValue(type, values[name]);
            return (
              <Form.Field key={name}>
                <Form.Input
                  autoFocus={(idx === 0)}
                  value={value}
                  label={name}
                  name={name}
                  onChange={onChange}
                />
              </Form.Field>
            );
          })}
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
