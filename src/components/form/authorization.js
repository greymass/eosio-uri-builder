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
  getInput = (field, idx, canMatchSigner = true) => {
    const {
      aliases,
      authorization,
      fieldsMatchSigner,
      onChange,
      onChangeAuthorizationMatchSigner,
      values,
    } = this.props;
    const name = field;
    const isMatchingSigner = !!(fieldsMatchSigner[`authorization-${name}`]);
    const isTemplated = (isMatchingSigner);
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
    if (isTemplated) {
      defaultInput = (
        <Form.Field>
          <label>{name}</label>
          <Form.Input
            disabled
            value={(isMatchingSigner) ? 'Matching Transaction Signer' : 'Prompting Transaction Signer'}
          />
        </Form.Field>
      )
    }
    return (
      <Segment attached key={name} secondary={!!(idx % 2)}>
        <Form.Field key={name}>
          {defaultInput}
          {(canMatchSigner)
            ? (
              <React.Fragment>
                <Form.Checkbox
                  checked={fieldsMatchSigner[`authorization-${name}`]}
                  label="Match to Signer"
                  name={name}
                  onChange={onChangeAuthorizationMatchSigner}
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
      fieldsMatchSigner,
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
