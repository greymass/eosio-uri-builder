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
  Message,
  Segment,
  Select,
  Tab,
  TextArea
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';

import FormCallback from '../components/form/callback';
import FormFields from '../components/form/fields';
import SelectorAction from '../components/selector/action';
import SelectorBlockchain from '../components/selector/blockchain';
import SelectorContract from '../components/selector/contract';
import TabURI from '../components/tab/uri';

const { SigningRequest } = require("eosio-uri");

const eosjs = require('eosjs')
let eos = eosjs({
  httpEndpoint: 'https://eos.greymass.com'
});

const initialState = {
  abi: false,
  action: '',
  authorization: {
    actor: "............1",
    permission: "............1",
  },
  blockchain: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  callback: {
    background: false,
    url: '',
  },
  contract: '',
  decoded: {},
  fields: {},
  fieldsMatchSigner: {},
  fieldsPromptSigner: {},
  loading: false,
  uri: false,
  uriError: false
};

const knownContracts = [
  'eosio',
  'eosio.token',
  'eosio.forum',
];

const chainAliases = [
  ['EOS','aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'], // 0x01
  ['TELOS','4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11'], // 0x02
  ['JUNGLE','038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'], // 0x03
  ['KYLIN','5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'], // 0x04
  ['WORBLI','73647cde120091e0a4b85bced2f3cfdb3041e266cbbe95cee59b73235a1b3b6f'], // 0x05
  ['BOS','d5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86'], // 0x06
  ['MEETONE','cfe6486a83bad4962f232d48003b1824ab5665c36778141034d75e57b956e422'], // 0x07
  ['INSIGHTS','b042025541e25a472bffde2d62edd457b7e70cee943412b1ea0f044f88591664'], // 0x08
  ['BEOS','b912d19a6abd2b1b05611ae5be473355d64d95aeff0c09bedc8c166cd6468fe4'], // 0x09
];

const chainAPIs = {
  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906': 'https://eos.greymass.com',
  '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11': 'https://telos.greymass.com',
  '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca': 'http://jungle.cryptolions.io:18888',
  '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191': 'https://kylin.eoscanada.com:443',
  '73647cde120091e0a4b85bced2f3cfdb3041e266cbbe95cee59b73235a1b3b6f': 'https://api.worbli.io',
  'd5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86': 'https://hapi.bos.eosrio.io',
  'cfe6486a83bad4962f232d48003b1824ab5665c36778141034d75e57b956e422': 'https://fullnode.meet.one',
  'b042025541e25a472bffde2d62edd457b7e70cee943412b1ea0f044f88591664': 'https://ireland-history.insights.network',
  'b912d19a6abd2b1b05611ae5be473355d64d95aeff0c09bedc8c166cd6468fe4': 'https://api.beos.world',
}

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
      const uri = `eosio:${match.params.uri}`;
      this.setState({
        loading: true,
        uri
      }, () => {
        decode(uri);
      });
    }
    if (this.state.contract && !this.state.abi) {
      console.log("loading", this.state.contract)
      console.log("from", this.state.blockchain)
      eos.getAbi(this.state.contract).then((result) => {
        this.setState({ abi: result.abi });
      });
    }
  }
  componentWillUpdate(nextProps, nextState) {
    if (
      this.state.contract !== nextState.contract
    ) {
      eos.getAbi(nextState.contract).then((result) => {
        this.setState({ abi: result.abi });
      });
    }
    if (
      this.state.action
      && this.state.action !== nextState.action
    ) {
      const { abi, action } = nextState;
      const { structs } = abi;
      const struct = find(structs, { name: action });
      if (struct) {
        const { fields } = struct;
        const defaultFields = {};
        fields.forEach((field) => {
          defaultFields[field.name] = '';
        });
        this.setState({
          uri: undefined,
          fields: defaultFields
        });
      }
    }
  }

  onChangeCallback = (e, { checked, name, value }) => {
    this.setState({
      callback: Object.assign({}, this.state.callback, {
        [name]: value || checked
      })
    });
  }

  onChangeField = (e, { name, value }) => {
    this.setState({
      fields: Object.assign({}, this.state.fields, {
        [name]: value
      })
    });
  }

  onChangeMatchSigner = (e, { name }) => {
    const {
      fields,
      fieldsMatchSigner,
      fieldsPromptSigner
    } = this.state;
    const newValue = !(fieldsMatchSigner[name] || false)
    const newState = {
      // Set the field to the placeholder value
      fields: Object.assign({}, fields, {
        [name]: (newValue) ? '............1' : ''
      }),
      // Set the boolean value
      fieldsMatchSigner: Object.assign({}, fieldsMatchSigner, {
        [name]: newValue
      })
    }
    if (fieldsPromptSigner[name]) {
      newState['fieldsPromptSigner'] = Object.assign({}, fieldsPromptSigner, {
        [name]: false
      })
    }
    this.setState(newState);
    e.preventDefault();
    return false;
  }

  onChangePromptSigner = (e, { name, checked }) => {
    const {
      fields,
      fieldsMatchSigner,
      fieldsPromptSigner
    } = this.state;
    const newValue = !(fieldsPromptSigner[name] || false)
    const newState = {
      fields: Object.assign({}, fields, {
        [name]: (newValue) ? '............2' : ''
      }),
      fieldsPromptSigner: Object.assign({}, fieldsPromptSigner, {
        [name]: newValue
      })
    }
    if (fieldsMatchSigner[name]) {
      newState['fieldsMatchSigner'] = Object.assign({}, fieldsMatchSigner, {
        [name]: false
      });
    }
    this.setState(newState);
    e.preventDefault();
    return false;
  }

  onResetContract = () => {
    this.setState({
      abi: false,
      contract: false,
    });
  }

  onResetBlockchain = () => {
    this.setState({
      abi: false,
      blockchain: false,
      contract: false,
    });
  }

  onSelect = (e, { name, value }) => {
    this.setState({ [name]: value });
  }

  onSelectBlockchain = (e, { name, value }) => {
    this.setState({ [name]: value }, () => {
      const httpEndpoint = chainAPIs[value];
      eos = eosjs({ httpEndpoint });
    });
  }

  decode = async (uri = false) => {
    const {
      authorization
    } = this.state;
    const decoded = SigningRequest.from(uri, opts);
    const blockchain = decoded.getChainId().toLowerCase();
    const httpEndpoint = chainAPIs[blockchain];
    eos = eosjs({ httpEndpoint });
    try {
      const actions = await decoded.getActions();
      const head = (await eos.getInfo(true)).head_block_num;
      const block = await eos.getBlock(head);
      const tx = await decoded.getTransaction(authorization, block);
      const { callback } = decoded.data;
      const action = actions[0];
      const fieldsMatchSigner = {};
      const fieldsPromptSigner = {};
      Object.keys(action.data).forEach((field) => {
        const data = action.data[field];
        if (data === '............2') {
          fieldsPromptSigner[field] = true;
        }
        if (data === '............1') {
          fieldsMatchSigner[field] = true;
        }
      });
      this.setState({
        action: action.name,
        blockchain,
        callback,
        contract: action.account,
        decoded: {
          actions,
          tx,
          callback,
        },
        fields: Object.assign({}, action.data),
        fieldsMatchSigner,
        fieldsPromptSigner,
        loading: false
      });
    } catch (err) {
      this.setState({
        blockchain,
        loading: false
      });
    }
  }

  generate = async () => {
    const {
      abi,
      action,
      authorization,
      blockchain,
      callback,
      contract,
      fields
    } = this.state;
    try {
      const req = await SigningRequest.create({
        actions: [{
          account: contract,
          name: action,
          authorization: [authorization],
          data: fields
        }],
        callback,
        chainId: blockchain,
      }, opts);
      const uri = req.encode();
      this.decode(uri);
      this.setState({
        uri,
        uriError: false
      }, () => {
        const data = uri.replace('eosio:', '');
        this.props.history.replace(`/eosio-uri-builder/${data}`);
      });

    } catch(err) {
      this.setState({
        uriError: err.toString()
      })
    }
  }

  onBlockchainSelect = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  render() {
    const {
      abi,
      action,
      blockchain,
      contract,
      decoded,
      fieldsMatchSigner,
      fieldsPromptSigner,
      loading,
      uri,
      uriError,
    } = this.state;
    const {
      actions,
      tx,
      callback
    } = decoded;
    const contractOptions = knownContracts.map((contract) => (
      { key: contract, text: contract, value: contract }
    ));
    const blockchainOptions = chainAliases.map(([chainName, chainId]) => (
      { key: chainId, text: chainName, value: chainId }
    ));
    let fields;
    if (abi && contract && action) {
      const { structs } = abi;
      const struct = find(structs, { name: action });
      if (struct) {
        ({ fields } = struct);
      }
    }
    const panes = [
      { menuItem: 'Action Data', render: () => (
        <FormFields
          aliases={abi.types}
          fields={fields}
          fieldsMatchSigner={fieldsMatchSigner}
          fieldsPromptSigner={fieldsPromptSigner}
          onChange={this.onChangeField}
          onChangeMatchSigner={this.onChangeMatchSigner}
          onChangePromptSigner={this.onChangePromptSigner}
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
        <Segment basic loading={loading}>
          <Form
            as="div"
          >
            <SelectorBlockchain
              blockchain={blockchain}
              blockchainOptions={blockchainOptions}
              chainAliases={chainAliases}
              onChange={this.onSelectBlockchain}
              onReset={this.onResetBlockchain}
            />
            {(blockchain)
              ? (
                <React.Fragment>
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
                      <React.Fragment>
                        <Segment attached secondary>
                          <Tab panes={panes} />
                        </Segment>
                        <Segment attached tertiary>
                          {(uriError)
                            ? (
                              <Message
                                color="red"
                                content={uriError}
                                header="Transaction Error"
                                icon="exclamation circle"
                                size="large"
                              />
                            )
                            : false
                          }
                          <Button
                            color="blue"
                            content="Generate URI"
                            icon="certificate"
                            onClick={this.generate}
                          />
                          {(uri)
                            ? (
                              <React.Fragment>
                                <Header>
                                  Resulting URI
                                </Header>
                                <TextArea value={uri} />
                                <Divider />
                                <Button
                                  as="a"
                                  color="green"
                                  content="Trigger URI in default handler"
                                  icon="external"
                                  href={uri}
                                />
                              </React.Fragment>
                            )
                            : false
                          }
                        </Segment>
                      </React.Fragment>
                    )
                    : false
                  }
                </React.Fragment>
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
