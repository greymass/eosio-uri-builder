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
import TabURI from '../components/tab/uri';

const { SigningRequest } = require("eosio-uri");

const eosjs = require('eosjs')
const eos = eosjs({
  httpEndpoint: 'https://eos.greymass.com'
});

const initialState = {
  abi: false,
  action: false,
  authorization: {
    actor: "............1",
    permission: "............1",
  },
  callback: {
    background: false,
    url: '',
  },
  contract: false,
  decoded: {},
  fields: {},
  uri: false,
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
    const uriState = {};
    const { decode, props } = this;
    const { match } = props;
    if (match && match.params && match.params.uri) {
      this.setState({
        uri: `eosio://${match.params.uri}`
      }, () => {
        decode(`eosio://${match.params.uri}`);
      });
    }
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

  decode = async (uri = false) => {
    const {
      authorization
    } = this.state;
    const decoded = SigningRequest.from(uri, opts);
    const actions = await decoded.getActions();
    const head = (await eos.getInfo(true)).head_block_num;
    const block = await eos.getBlock(head);
    const tx = await decoded.getTransaction(authorization, block);
    const cb = decoded.data.callback.url;
    const action = actions[0];
    this.setState({
      action: action.name,
      callback: {
        background: false,
        url: cb
      },
      contract: action.account,
      fields: Object.assign({}, action.data),
      decoded: {
        actions,
        tx,
        callback: cb,
      }
    });
  }

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
        authorization: [authorization],
        data: fields
      }]
    }, opts);
    const uri = req.encode();
    this.decode(uri);
    this.setState({
      uri
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
      ) },
    ];

    if (uri) {
      panes.push({ menuItem: 'Generated URI', render: () => (
        <TabURI
          uri={uri}
          tx={tx}
        />
      )});
    }

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
            {(action && fields)
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
              : false
            }
          </Form>
        </Segment>
      </Container>
    );
  }
}

export default IndexContainer;
