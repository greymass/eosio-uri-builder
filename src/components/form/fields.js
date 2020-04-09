import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';

import { find } from 'lodash';

class FormFields extends Component {
  getInput = (field, idx) => {
    const {
      aliases,
      fieldsMatchSignerAccount,
      fieldsMatchSignerPermission,
      onChange,
      onChangeMatchSigner,
      values,
    } = this.props;
    const { name } = field;
    let { type } = field;
    const alias = find(aliases, { new_type_name: type });
    const isMatchingSignerAccount = !!(fieldsMatchSignerAccount[name]);
    const isMatchingSignerPermission = !!(fieldsMatchSignerPermission[name]);
    const isTemplated = (isMatchingSignerAccount );
    const label = `${name} [${type}]${(alias) ? `, extending [${alias.type}]` : ''}`;
    let fieldType = 'string';
    let value = this.formatValue(type, values[name]);
    let defaultInput = (
      <Form.Input
        autoFocus={(idx === 0)}
        label={label}
        name={name}
        onChange={onChange}
        defaultValue={(value instanceof Object) ? JSON.stringify(value) : value}
      />
    );
    // an array of values
    if (type.substr(type.length - 2) === "[]") {
      let options = [];
      fieldType = 'multi';
      if (value && value.length > 0) {
        if(Array.isArray(value)) {
          options = value.map((option) => ({
            key: option,
            value: option,
            text: option
          }))
        } else {
          options = [{
            key: value,
            value: value,
            text: value,
          }];
        }
      }
      defaultInput = (
        <Form.Select
          allowAdditions
          autoFocus={(idx === 0)}
          options={options}
          value={value}
          label={label}
          name={name}
          selection
          search
          multiple
          onChange={onChange}
        />
      );
    }
    if (isMatchingSignerAccount) {
      defaultInput = (
        <Form.Field>
          <label>{label}</label>
          <Form.Input
            disabled
            value='Matching Transaction Signer Account Name'
          />
        </Form.Field>
      )
    }
    if (isMatchingSignerPermission) {
      defaultInput = (
        <Form.Field>
          <label>{label}</label>
          <Form.Input
            disabled
            value='Matching Transaction Signer Permission'
          />
        </Form.Field>
      )
    }
    console.log(type, alias)
    return (
      <Segment attached key={name} secondary={!!(idx % 2)}>
        <Form.Field key={name}>
          {defaultInput}
          {(type === 'name' || (alias && alias.type === 'name'))
            ? (
              <React.Fragment>
                <Form.Checkbox
                  checked={fieldsMatchSignerAccount[name]}
                  label="Match to Signer Account Name"
                  name={name}
                  onChange={onChangeMatchSigner}
                />
              </React.Fragment>
            )
            : false
          }
        </Form.Field>
      </Segment>
    );
  }
  formatValue = (type, value) => {
    // return as an empty string
    if (value === '.............') {
      return '';
    }
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
          <Header attached="top" block>
            Action Parameters
          </Header>
          {fields.map((field, idx) => this.getInput(field, idx))}
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
