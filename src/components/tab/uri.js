import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';

class TabURI extends Component {
  render() {
    const {
      uri,
      tx,
    } = this.props;
    return (
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
    );
  }
}

export default TabURI;
