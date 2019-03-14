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
import SelectorContract from '../components/selector/contract';
import TabURI from '../components/tab/uri';

const { SigningRequest } = require("eosio-uri");

const eosjs = require('eosjs')
const eos = eosjs({
  httpEndpoint: 'https://eos.greymass.com'
});

const initialState = {
  abi: false,
  action: 'transfer',
  authorization: {
    actor: "............1",
    permission: "............1",
  },
  callback: {
    background: false,
    url: '',
  },
  contract: 'eosio.token',
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

  onSelect = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

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
      callback: {
        background: false,
        url: cb
      },
      contract: action.account,
      decoded: {
        actions,
        tx,
        callback: cb,
      },
      fields: Object.assign({}, action.data),
      fieldsMatchSigner,
      fieldsPromptSigner,
      loading: false
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
    try {
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

  render() {
    const {
      abi,
      action,
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
        <Segment loading={loading}>
          <Form
            as="div"
          >
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
          </Form>
        </Segment>
      </Container>
    );
  }
}

export default IndexContainer;
