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

class FormAuthorization extends Component {
  getInput = (field, idx, canMatchSignerAccount = true, canMatchSignerPermission = true) => {
    const {
      aliases,
      authorization,
      fieldsMatchSignerAccount,
      fieldsMatchSignerPermission,
      onChange,
      onChangeAuthorizationMatchSignerAccount,
      onChangeAuthorizationMatchSignerPermission,
      values,
    } = this.props;
    const name = field;
    const isMatchingSignerAccount = !!(fieldsMatchSignerAccount[`authorization-${name}`]);
    const isMatchingSignerPermission = !!(fieldsMatchSignerPermission[`authorization-${name}`]);
    let value = authorization[field];
    let defaultInput = (
      <Form.Input
        autoFocus={(idx === 0)}
        label={name}
        name={name}
        onChange={onChange}
        defaultValue={(value instanceof Object) ? JSON.stringify(value) : value}
      />
    );
    console.log(isMatchingSignerAccount, isMatchingSignerPermission, name)
    if (isMatchingSignerAccount && name === 'actor') {
      defaultInput = (
        <Form.Field>
          <label>{name}</label>
          <Form.Input
            disabled
            value="Matching Transaction Signer Account Name"
          />
        </Form.Field>
      )
    }
    if (isMatchingSignerPermission && name === 'permission') {
      defaultInput = (
        <Form.Field>
          <label>{name}</label>
          <Form.Input
            disabled
            value="Matching Transaction Signer Permission"
          />
        </Form.Field>
      )
    }
    return (
      <Segment attached key={name} secondary={!!(idx % 2)}>
        <Form.Field key={name}>
          {defaultInput}
          {(canMatchSignerAccount && name === 'actor')
            ? (
              <React.Fragment>
                <Form.Checkbox
                  checked={fieldsMatchSignerAccount[`authorization-${name}`]}
                  label="Match to Signer Account Name"
                  name={name}
                  onChange={onChangeAuthorizationMatchSignerAccount}
                />
              </React.Fragment>
            )
            :  false
          }
          {(canMatchSignerPermission && name === 'permission')
            ? (
              <React.Fragment>
                <Form.Checkbox
                  checked={fieldsMatchSignerPermission[`authorization-${name}`]}
                  label="Match to Signer Permission"
                  name={name}
                  onChange={onChangeAuthorizationMatchSignerPermission}
                />
              </React.Fragment>
            )
            :  false
          }
        </Form.Field>
      </Segment>
    );
  }
  render() {
    const {
      authorization,
      billFirstAuthorizer,
      fields,
      fieldsMatchSignerAccount,
      greymassnoop,
      onChange,
      onChangeAuthorizationMatchSigner,
      onChangeBillFirst,
      onChangeNoop,
      values,
    } = this.props;
    const data = [
      {
        actor: authorization['actor'],
        permission: authorization['permission'],
      }
    ];
    return (
      <Segment attached>
        <Segment basic>
          <Header>
            Transaction Authorization
          </Header>
          {['actor', 'permission'].map((field, idx) => this.getInput(field, idx))}
          <Segment attached>
            <Form.Field key="billfirst">
              <React.Fragment>
                <Form.Checkbox
                  checked={greymassnoop}
                  label="Use ONLY_BILL_FIRST_AUTHORIZER w/ greymassnoop?"
                  name="greymassnoop"
                  onChange={onChangeNoop}
                />
              </React.Fragment>
            </Form.Field>
            {(greymassnoop)
              ? (
                <React.Fragment>
                  {['actor-paying', 'permission-paying'].map((field, idx) => this.getInput(field, idx, false))}
                </React.Fragment>
              )
              : false
            }
          </Segment>
        </Segment>
        <Segment inverted basic>
          <Header>
            Authorization Data
          </Header>
          <ReactJson
            displayDataTypes={false}
            displayObjectSize={false}
            iconStyle="square"
            name={null}
            src={data}
            style={{ padding: '1em' }}
            theme="harmonic"
          />
        </Segment>
      </Segment>
    );
  }
}

export default FormAuthorization;
