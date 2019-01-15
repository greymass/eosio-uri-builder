import React, { Component } from 'react';
import { find } from 'lodash';

import {
  Button,
  Container,
  Checkbox,
  Divider,
  Dropdown,
  Form,
  Header,
  Segment,
  Select,
  Tab,
  TextArea
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';

import FormCallback from '../components/form/callback';
import FormFields from '../components/form/fields';
import SelectorAction from '../components/selector/action';
import SelectorContract from '../components/selector/contract';

const { SigningRequest } = require("eosio-uri");

const eosjs = require('eosjs')
const eos = eosjs({
  httpEndpoint: 'https://eos.greymass.com'
});

const initialState = {
  abi: false,
  action: 'bidname',
  authorization: { actor: 'teamgreymass', permission: 'active' },
  callback: {
    background: false,
    url: 'http://eos.greymass.com',
  },
  contract: 'eosio',
  decoded: {},
  fields: {
    "bidder": "asdf",
    "newname": "asdf",
    "bid": "0.0001 EOS"
  },
};

const knownContracts = [
  'eosio',
  'eosio.token',
  'eosio.forum',
];

// opts for the signing request
const util = require('util');
const zlib = require('zlib');
const opts = {
  // string compression
  zlib: {
      deflateRaw: (data) => {
          return new Uint8Array(zlib.deflateRawSync(Buffer.from(data)))
      },
      inflateRaw: (data) => {
          return new Uint8Array(zlib.inflateRawSync(Buffer.from(data)))
      },
  },
  // provider to retrieve contract abi
  abiProvider: {
      getAbi: async (account) => {
          return (await eos.getAbi(account)).abi
      }
  }
}

class IndexContainer extends Component {
  constructor(props) {
    super(props)
    this.state = Object.assign({}, initialState);
  }
  componentWillMount() {
    if (this.state.contract && !this.state.abi) {
      eos.getAbi(this.state.contract).then((result) => {
        this.setState({ abi: result.abi });
      });
    }
  }
  componentWillUpdate(nextProps, nextState) {
    console.log(nextState)
    if (
      this.state.contract !== nextState.contract
    ) {
      eos.getAbi(nextState.contract).then((result) => {
        this.setState({ abi: result.abi });
      });
    }
  }

  onChangeCallback = (e, { checked, name, value }) => {
    console.log(name, value)
    this.setState({
      callback: Object.assign({}, this.state.callback, {
        [name]: value || checked
      })
    });
  }

  onChangeField = (e, { name, value }) => {
    console.log(name, value)
    this.setState({
      fields: Object.assign({}, this.state.fields, {
        [name]: value
      })
    });
  }

  onResetContract = () => {
    this.setState({
      abi: false,
      contract: false,
    });
  }

  onSelect = (e, { name, value }) => this.setState({ [name]: value })

  generate = async () => {
    const {
      abi,
      action,
      authorization,
      callback,
      contract,
      fields
    } = this.state;
    const req = await SigningRequest.create({
      callback,
      actions: [{
        account: contract,
        name: action,
        authorization: [{
          actor: "............1",
          permission: "............1",
        }],
        data: fields
      }]
    }, opts);
    const uri = req.encode();
    const decoded = SigningRequest.from(uri, opts);
    const actions = await decoded.getActions();
    const exampleSigner = {
      actor: 'example_account',
      permission: 'example_permission',
    };
    console.log(eos)
    const tx = await decoded.getTransaction(exampleSigner, {});
    const cb = req.data.callback.url;
    this.setState({
      uri,
      decoded: {
        actions,
        tx,
        callback: cb,
      }
    });
  }

  render() {
    const {
      abi,
      action,
      contract,
      decoded,
      uri,
    } = this.state;
    const {
      actions,
      tx,
      callback
    } = decoded;
    const contractOptions = knownContracts.map((contract) => (
      { key: contract, text: contract, value: contract }
    ));
    let fields;
    if (abi && contract && action) {
      const { structs } = abi;
      const struct = find(structs, { name: action });
      if (struct) {
        ({ fields } = struct);
      }
    }
    console.log(this.state)
    const panes = [
      { menuItem: 'Action Data', render: () => (
        <FormFields
          fields={fields}
          onChange={this.onChangeField}
          values={this.state.fields}
        />
      ) },
      { menuItem: 'Callback', render: () => (
        <FormCallback
          onChange={this.onChangeCallback}
          values={this.state.callback}
        />
      ) }
    ]

    return (
      <Container className="App" style={{ paddingTop: "1em" }}>
        <Header>
          EOSIO uri-builder
        </Header>
        <Segment>
          <Form>
            <SelectorContract
              contract={contract}
              contractOptions={contractOptions}
              onChange={this.onSelect}
              onReset={this.onResetContract}
            />
            {(abi)
              ? (
                <SelectorAction
                  abi={abi}
                  action={action}
                  contract={contract}
                  onChange={this.onSelect}
                />
              )
              : false
            }
            {(action && fields && !uri)
              ? (
                <Segment attached secondary>
                  <Tab panes={panes} />
                  <Button
                    color="blue"
                    content="Generate URI"
                    onClick={this.generate}
                  />
                </Segment>
              )
              : (
                <Segment attached>
                  <Header>
                    URI Generated:
                    <Header.Subheader style={{ marginTop: '0.5em' }}>
                      <a href={uri} target="_blank">
                        {uri}
                      </a>
                    </Header.Subheader>
                  </Header>
                  <Header size="small">
                    URI Transaction:
                  </Header>
                  <ReactJson
                    displayDataTypes={false}
                    displayObjectSize={false}
                    iconStyle="square"
                    name={null}
                    src={tx}
                    style={{ padding: '1em' }}
                    theme="harmonic"
                  />
                </Segment>
              )
            }
          </Form>
        </Segment>
      </Container>
    );
  }
}

export default IndexContainer;
